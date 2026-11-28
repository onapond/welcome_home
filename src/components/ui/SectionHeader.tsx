import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  align?: "center" | "left";
  className?: string;
  /** Set on navy/dark sections: light label and white title instead of navy/black. */
  onDark?: boolean;
}

export default function SectionHeader({
  label,
  title,
  align = "center",
  className,
  onDark = false,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      <p
        className="text-xs font-semibold mb-3"
        style={{ color: onDark ? "var(--color-secondary)" : "var(--color-primary)" }}
      >
        {label}
      </p>
      <h2
        className="font-serif text-3xl font-bold"
        style={{ color: onDark ? "var(--color-white)" : "var(--color-dark)" }}
      >
        {title}
      </h2>
    </div>
  );
}
