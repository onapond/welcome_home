import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const aspectRatioStyles = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
} as const;

interface ImagePlaceholderProps {
  label?: string;
  aspectRatio?: keyof typeof aspectRatioStyles;
  className?: string;
}

export default function ImagePlaceholder({
  label = "사진 준비 중",
  aspectRatio = "16/9",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "rounded-2xl",
        aspectRatioStyles[aspectRatio],
        className
      )}
      style={{ backgroundColor: "var(--color-bg-warm)" }}
      aria-label={label}
      role="img"
    >
      <ImageIcon
        className="w-8 h-8"
        style={{ color: "var(--color-dark-soft)", opacity: 0.4 }}
        strokeWidth={1.5}
      />
      {label && (
        <p
          className="text-xs font-medium"
          style={{ color: "var(--color-dark-soft)", opacity: 0.5 }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
