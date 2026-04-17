/**
 * COERLL DiB workbook companion video paths (placeholders — add files under electron-app/resources/videos/).
 * Pattern matches Kapitel 4: chapter04/k04_a02_berna.mp4
 */

export const DEFAULT_VIDEO_QUESTIONS = [
  'Notizen: Was hören Sie? (Stichpunkte auf Deutsch)'
];

export function chapterDir(chapter) {
  return `chapter${String(chapter).padStart(2, '0')}`;
}

/** @param {number} chapter @param {number} activityId @param {string} speakerId lowercase slug */
export function videoPath(chapter, activityId, speakerId) {
  const ch = String(chapter).padStart(2, '0');
  const act =
    typeof activityId === 'number' && !Number.isInteger(activityId)
      ? String(activityId).replace('.', '_')
      : String(Math.floor(activityId)).padStart(2, '0');
  return `${chapterDir(chapter)}/k${ch}_a${act}_${speakerId}.mp4`;
}
