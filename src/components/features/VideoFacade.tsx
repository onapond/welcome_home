"use client";

// Click-to-load video: shows the cover and a play button, and only inserts
// the YouTube/Vimeo player iframe (≈1 MB of player scripts) when the visitor
// presses play. The iframe then starts playing right away (autoplay).

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoFacadeProps {
  /** videoEmbedUrl(video) */
  embedUrl: string;
  /** videoEmbedAllow(video) — "autoplay" is added when missing */
  allow: string;
  title: string;
  /** Cover image URL; null draws a navy placeholder (e.g. Vimeo without `thumbnail:`) */
  thumbnail: string | null;
}

export default function VideoFacade({ embedUrl, allow, title, thumbnail }: VideoFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Keep keyboard focus on the player once it replaces the button.
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  const src = `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
  const allowWithAutoplay = /\bautoplay\b/.test(allow) ? allow : `autoplay; ${allow}`;

  return (
    <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
      {playing ? (
        <iframe
          ref={frame}
          src={src}
          title={`${title} 영상`}
          allow={allowWithAutoplay}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${title} 영상 재생`}
          className="group absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-inset"
          style={
            thumbnail
              ? undefined
              : { background: "linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-dark) 100%)" }
          }
        >
          {thumbnail && (
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          )}
          <span
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(26,30,44,0) 40%, rgba(26,30,44,0.45) 100%)" }}
            aria-hidden="true"
          />
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: "var(--color-primary)", boxShadow: "0 8px 24px rgba(26,30,44,0.35)" }}
            aria-hidden="true"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="currentColor" style={{ color: "var(--color-white)" }} />
          </span>
        </button>
      )}
    </div>
  );
}
