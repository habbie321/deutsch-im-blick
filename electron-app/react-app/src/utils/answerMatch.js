/**
 * Normalize free-text answers for tolerant comparison.
 */
export function normalizeAnswer(s) {
  if (s == null || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[.,;:'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True if normalized user string equals normalized expected or contains it as substring (for longer answers).
 */
export function matchesNormalized(userRaw, expectedRaw) {
  const u = normalizeAnswer(userRaw);
  const e = normalizeAnswer(expectedRaw);
  if (!u || !e) return false;
  if (u === e) return true;
  if (u.includes(e) || e.includes(u)) return true;
  return false;
}

/**
 * Pass if ANY accepted variant matches (normalized equality or mutual substring).
 */
export function matchesAnyVariant(userRaw, acceptedList) {
  if (!acceptedList || !acceptedList.length) return false;
  return acceptedList.some((exp) => matchesNormalized(userRaw, exp));
}

/**
 * Pass if EVERY keyword appears somewhere in the user answer (after normalization).
 * A keyword may be "a|b|c" — at least one alternative must appear.
 */
export function containsAllKeywords(userRaw, keywords) {
  const u = normalizeAnswer(userRaw);
  if (!u) return false;
  return keywords.every((kw) => {
    const alternatives = String(kw)
      .split('|')
      .map((p) => normalizeAnswer(p.trim()))
      .filter(Boolean);
    return alternatives.some((p) => u.includes(p));
  });
}

/** Field meta includes JSON keys for rule-based checking (no AI). */
export function hasAutomaticKeys(fieldMeta) {
  return Boolean(fieldMeta?.acceptedAnswers?.length || fieldMeta?.keywords?.length);
}

/**
 * Check answer against JSON keys for exact or keywords mode. Returns null when keys missing.
 * @returns {boolean|null}
 */
export function checkAutomaticAnswerByMode(
  userRaw,
  { acceptedAnswers, keywords, mode = 'keywords' } = {}
) {
  if (mode === 'exact') {
    if (!acceptedAnswers?.length) return null;
    return matchesAnyVariant(userRaw, acceptedAnswers);
  }
  if (mode === 'keywords') {
    if (!keywords?.length) return null;
    return containsAllKeywords(userRaw, keywords);
  }
  return null;
}

/**
 * Check answer against JSON keys. Returns null when no keys are configured.
 * Prefers acceptedAnswers, then keywords (legacy combined path).
 * @returns {boolean|null}
 */
export function checkAutomaticAnswer(userRaw, { acceptedAnswers, keywords } = {}) {
  if (acceptedAnswers?.length) {
    return matchesAnyVariant(userRaw, acceptedAnswers);
  }
  if (keywords?.length) {
    return containsAllKeywords(userRaw, keywords);
  }
  return null;
}
