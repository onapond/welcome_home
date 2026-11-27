"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface PhotoItem {
  thumb: string;
  full: string;
  width?: number;
  height?: number;
  caption?: string;
}

const iconBtn: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.14)",
  color: "var(--color-white)",
};

/** Size hint for the full-size photo when the content file has no width/height. */
const FALLBACK_WIDTH = 1600;
const FALLBACK_HEIGHT = 1200;

/**
 * Photo grid + lightbox. The lightbox uses a native modal <dialog>, which
 * provides the focus trap and Esc to close. Arrow keys are handled here, and
 * on close focus goes back to the thumbnail that opened it.
 */
export default function PhotoGrid({ photos, albumTitle }: { photos: PhotoItem[]; albumTitle: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openedFrom = useRef<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const total = photos.length;

  const open = (i: number) => {
    openedFrom.current = i;
    setIndex(i);
  };
  const close = () => dialogRef.current?.close();

  // Show the modal after the photo has rendered so autoFocus lands inside it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (index !== null && dialog && !dialog.open) dialog.showModal();
  }, [index]);

  const handleClose = () => {
    setIndex(null);
    const from = openedFrom.current;
    openedFrom.current = null;
    if (from !== null) thumbRefs.current[from]?.focus();
  };

  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total],
  );

  // Preload neighbours so arrow navigation feels instant.
  useEffect(() => {
    if (index === null) return;
    [index - 1, index + 1].forEach((n) => {
      const p = photos[(n + total) % total];
      if (p) new window.Image().src = p.full;
    });
  }, [index, photos, total]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p, i) => (
          <li key={`${p.full}-${i}`}>
            <button
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => open(i)}
              aria-label={`사진 ${i + 1} / ${total} 크게 보기${p.caption ? `: ${p.caption}` : ""}`}
              className="relative block w-full overflow-hidden rounded-lg"
              style={{ aspectRatio: "4/3", backgroundColor: "var(--color-bg-warm)" }}
            >
              <Image
                src={p.thumb}
                alt={p.caption ?? `${albumTitle} 사진 ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${albumTitle} 사진 보기`}
        onClose={handleClose}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
        }}
        className="m-0 p-0 w-screen h-screen max-w-none max-h-none bg-transparent backdrop:bg-black/90"
      >
        {current && (
          <div className="relative flex flex-col items-center justify-center w-full h-full px-4 py-14">
            <p className="sr-only" aria-live="polite">
              {index! + 1} / {total}
            </p>
            <Image
              key={current.full}
              src={current.full}
              alt={current.caption ?? `${albumTitle} 사진 ${index! + 1}`}
              width={current.width ?? FALLBACK_WIDTH}
              height={current.height ?? FALLBACK_HEIGHT}
              sizes="100vw"
              className="w-auto h-auto max-w-full max-h-full object-contain"
            />
            {current.caption && (
              <p className="mt-3 text-sm text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
                {current.caption}
              </p>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              autoFocus
              className="absolute top-4 right-4 flex items-center justify-center w-11 h-11 rounded-full"
              style={iconBtn}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="이전 사진"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full"
                  style={iconBtn}
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="다음 사진"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full"
                  style={iconBtn}
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-4 text-xs" style={{ color: "rgba(255,255,255,0.7)" }} aria-hidden="true">
                  {index! + 1} / {total}
                </span>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
