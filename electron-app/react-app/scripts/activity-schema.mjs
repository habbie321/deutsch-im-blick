/**
 * Activity JSON schema constants and validation (mirrors activity.schema.json).
 */

export const PAGE_TYPES = [
  'multiple_choice',
  'matching_activity',
  'reading_self_check',
  'workbook',
  'prompt',
  'writing',
  'classification_grid',
  'cloze'
];

export const PAGE_TYPE_SET = new Set(PAGE_TYPES);

export const WORKBOOK_BLOCK_TYPES = [
  'sectionTitle',
  'tf',
  'mc',
  'who',
  'multi',
  'text',
  'cloze',
  'matching',
  'order'
];

function activityKey(chapter, id) {
  return `${chapter}-${id}`;
}

function push(errors, path, message) {
  errors.push({ path, message });
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isBlurbNode(node) {
  return isNonEmptyString(node?.text) && !node?.pages?.length;
}

function isExerciseNode(node) {
  return Boolean(node?.pages?.length);
}

function validateMediaCards(cards, path, errors, { requireContent = false } = {}) {
  if (!Array.isArray(cards)) {
    push(errors, path, 'must be an array');
    return;
  }
  cards.forEach((card, i) => {
    const p = `${path}[${i}]`;
    if (!card || typeof card !== 'object') {
      push(errors, p, 'must be an object');
      return;
    }
    const hasVideo = isNonEmptyString(card.videoPath) || isNonEmptyString(card.video?.path);
    const hasBody = isNonEmptyString(card.body);
    const hasImage = isNonEmptyString(card.imagePath);
    if (requireContent && !hasVideo && !hasBody && !hasImage) {
      push(errors, p, 'needs videoPath, body, or imagePath');
    }
  });
}

function validateWorkbookBlocks(blocks, path, errors) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    push(errors, path, 'workbook must have a non-empty checks.blocks array');
    return;
  }
  blocks.forEach((block, i) => {
    const p = `${path}[${i}]`;
    if (!block?.type) {
      push(errors, p, 'block missing type');
      return;
    }
    if (!WORKBOOK_BLOCK_TYPES.includes(block.type)) {
      push(errors, `${p}.type`, `unknown block type "${block.type}"`);
    }
    if (block.type !== 'sectionTitle' && block.id == null) {
      push(errors, p, 'block missing id');
    }
  });
}

function validateReadingItems(items, path, errors) {
  if (!Array.isArray(items) || items.length === 0) {
    push(errors, path, 'needs a non-empty readingItems array');
    return;
  }
  items.forEach((item, i) => {
    const p = `${path}[${i}]`;
    if (item?.id == null) push(errors, `${p}.id`, 'required');
    if (!isNonEmptyString(item?.prompt)) push(errors, `${p}.prompt`, 'required');
  });
}

function validateQuestionSets(sets, path, errors) {
  if (!Array.isArray(sets) || sets.length === 0) {
    push(errors, path, 'needs a non-empty questionSets array');
    return;
  }
  sets.forEach((set, si) => {
    const questions = set?.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      push(errors, `${path}[${si}].questions`, 'must be a non-empty array');
    }
  });
}

function validatePageNode(page, path, errors, envelope = {}) {
  if (!page || typeof page !== 'object') {
    push(errors, path, 'must be an object');
    return;
  }

  const { type } = page;
  if (!isNonEmptyString(page.id)) {
    push(errors, `${path}.id`, 'required');
  }
  if (!PAGE_TYPE_SET.has(type)) {
    push(errors, `${path}.type`, `unknown page type "${type}"`);
    return;
  }

  if (page.mediaCards) {
    validateMediaCards(page.mediaCards, `${path}.mediaCards`, errors);
  }

  switch (type) {
    case 'workbook':
      validateWorkbookBlocks(page.checks?.blocks, `${path}.checks.blocks`, errors);
      break;
    case 'prompt':
      if (page.checks?.blocks?.length) {
        push(errors, `${path}.type`, 'prompt pages must not use checks.blocks (use workbook instead)');
      }
      if (
        !page.tasks?.length &&
        !page.sections?.length &&
        !isNonEmptyString(page.intro) &&
        !isNonEmptyString(envelope.intro) &&
        !isNonEmptyString(envelope.description)
      ) {
        push(errors, path, 'prompt should have tasks, sections, intro, or description on envelope');
      }
      break;
    case 'reading_self_check':
      validateReadingItems(page.readingItems, `${path}.readingItems`, errors);
      break;
    case 'multiple_choice':
      validateQuestionSets(page.questionSets, `${path}.questionSets`, errors);
      break;
    case 'matching_activity':
      if (!page.matchingPairs?.length) {
        push(errors, `${path}.matchingPairs`, 'must be a non-empty array');
      }
      break;
    case 'cloze':
      if (!page.lines?.length) {
        push(errors, `${path}.lines`, 'must be a non-empty array');
      }
      break;
    case 'writing':
      if (!page.tasks?.length && !page.speakers?.length) {
        push(errors, path, 'writing needs tasks or speakers');
      }
      if (page.speakers?.length) {
        page.speakers.forEach((speaker, i) => {
          const p = `${path}.speakers[${i}]`;
          if (!isNonEmptyString(speaker?.id)) push(errors, `${p}.id`, 'required');
          if (!isNonEmptyString(speaker?.name)) push(errors, `${p}.name`, 'required');
          if (!speaker?.questions?.length) push(errors, `${p}.questions`, 'must be non-empty');
        });
      }
      break;
    case 'classification_grid': {
      const grid = page.grid;
      if (!grid?.categories?.length || !grid?.items?.length) {
        push(errors, `${path}.grid`, 'needs categories and items');
      }
      const pageMedia = page.mediaCards?.some(
        (c) => isNonEmptyString(c.videoPath) || isNonEmptyString(c.video?.path)
      );
      const envelopeMedia = envelope.mediaCards?.some(
        (c) => isNonEmptyString(c.videoPath) || isNonEmptyString(c.video?.path)
      );
      if (!pageMedia && !envelopeMedia) {
        push(errors, `${path}.mediaCards`, 'classification_grid needs video mediaCards on page or envelope');
      }
      break;
    }
    default:
      break;
  }
}

function validateEnvelopeActivity(node, path, errors) {
  if (!node || typeof node !== 'object') {
    push(errors, path, 'must be an object');
    return;
  }

  if (typeof node.chapter !== 'number') push(errors, `${path}.chapter`, 'must be a number');
  if (typeof node.id !== 'number') push(errors, `${path}.id`, 'must be a number');

  if (node.type === 'multi_page' || node.type === 'blurb') {
    push(errors, `${path}.type`, `top-level type "${node.type}" is deprecated — use pages[] or text instead`);
  }

  if (isNonEmptyString(node.text) && node.pages?.length) {
    push(errors, path, 'cannot have both text and pages');
    return;
  }

  if (isBlurbNode(node)) {
    if (!isNonEmptyString(node.title)) {
      push(errors, `${path}.title`, 'required');
    }
    return;
  }

  if (isExerciseNode(node)) {
    if (!isNonEmptyString(node.title)) {
      push(errors, `${path}.title`, 'required');
    }
    if (node.mediaCards) {
      validateMediaCards(node.mediaCards, `${path}.mediaCards`, errors);
    }
    node.pages.forEach((page, i) => {
      validatePageNode(page, `${path}.pages[${i}]`, errors, node);
    });
    return;
  }

  if (node.type && PAGE_TYPE_SET.has(node.type)) {
    push(errors, path, `legacy top-level page type "${node.type}" — wrap in pages[]`);
    return;
  }

  push(errors, path, 'must have pages[] (exercise) or text (blurb)');
}

/**
 * @param {{ activities: unknown[] }} data
 * @returns {{ ok: boolean, errors: { path: string, message: string }[] }}
 */
export function validateActivitiesData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { ok: false, errors: [{ path: '$', message: 'root must be an object' }] };
  }
  if (!Array.isArray(data.activities)) {
    return { ok: false, errors: [{ path: '$.activities', message: 'must be an array' }] };
  }

  const seen = new Set();
  data.activities.forEach((activity, i) => {
    validateEnvelopeActivity(activity, `activities[${i}]`, errors);
    if (typeof activity?.chapter === 'number' && typeof activity?.id === 'number') {
      const key = activityKey(activity.chapter, activity.id);
      if (seen.has(key)) {
        push(errors, `activities[${i}]`, `duplicate chapter/id pair (${activity.chapter}, ${activity.id})`);
      }
      seen.add(key);
    }
  });

  return { ok: errors.length === 0, errors };
}

export { activityKey };
