import type { Praise, Sermon } from "@/lib/content";
import { youtubeThumb } from "@/lib/media";
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
    thumb: s.youtube ? youtubeThumb(s.youtube) : null,
  };
}

export function praiseToItem(p: Praise): VideoItem {
  return {
    id: p.id,
    href: p.youtube ? `https://www.youtube.com/watch?v=${p.youtube}` : null,
    title: p.title,
    date: p.date,
    badge: "찬양",
    person: p.team,
    thumb: p.youtube ? youtubeThumb(p.youtube) : null,
  };
}
