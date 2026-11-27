import type { Praise, Sermon } from "@/lib/content";
import { videoThumb, videoWatchUrl } from "@/lib/media";
import type { VideoItem } from "./VideoCard";

// Plain-data mappers (run on the server, result is passed to client components).

export function sermonToItem(s: Sermon): VideoItem {
  return {
    id: s.id,
    href: `/sermons/${s.id}`,
    title: s.title,
    date: s.date,
    badge: s.kind,
    kind: s.kind,
    scripture: s.scripture,
    person: s.preacher,
    series: s.series,
    thumb: videoThumb(s.video, s.thumbnail),
    hasVideo: !!s.video,
  };
}

export function praiseToItem(p: Praise): VideoItem {
  return {
    id: p.id,
    href: p.video ? videoWatchUrl(p.video) : null,
    title: p.title,
    date: p.date,
    badge: "찬양",
    person: p.team,
    thumb: videoThumb(p.video, p.thumbnail),
    hasVideo: !!p.video,
  };
}
