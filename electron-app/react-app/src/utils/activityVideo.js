/**
 * Resolve which local clips to show for a chapter activity.
 * Paths are relative to electron-app/resources/videos/ and loaded via app:// in Electron.
 */

export function dibChapterTocUrl(chapter) {
  return `https://coerll.utexas.edu/dib/toc.php?k=${chapter}`;
}

/**
 * @param {object} activity — raw row from activites.json (includes chapter, id, icon, videos, video)
 * @returns {{ appSrc: string, relativePath: string, label: string, fallbackUrl: string }[]}
 */
export function getActivityVideoClips(activity) {
  if (!activity || activity.video?.disabled) {
    return [];
  }

  const chapter = activity.chapter ?? 1;
  const fallbackUrl =
    activity.videoFallbackUrl ||
    activity.video?.fallbackUrl ||
    dibChapterTocUrl(chapter);

  if (activity.videos?.length) {
    return activity.videos.map((v) => ({
      appSrc: `app://${v.path}`,
      relativePath: v.path,
      label: v.label || 'Video',
      fallbackUrl: v.fallbackUrl || fallbackUrl
    }));
  }

  if (activity.video?.path) {
    return [
      {
        appSrc: `app://${activity.video.path}`,
        relativePath: activity.video.path,
        label: activity.video.title || activity.video.label || 'Video',
        fallbackUrl: activity.video.fallbackUrl || fallbackUrl
      }
    ];
  }

  if (activity.icon === 'videoclips') {
    const ch = String(chapter).padStart(2, '0');
    const id = String(activity.id).padStart(2, '0');
    const path = `chapter${ch}/k${ch}_a${id}.mp4`;
    return [
      {
        appSrc: `app://${path}`,
        relativePath: path,
        label: activity.video?.label || `Kapitel ${chapter} · Aktivität ${activity.id}`,
        fallbackUrl: activity.video?.fallbackUrl || fallbackUrl
      }
    ];
  }

  return [];
}
