import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  align = "center",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      <p
        className="text-xs font-semibold uppercase tracking-[5px] mb-3"
        style={{ color: "var(--color-primary)" }}
      >
        {label}
      </p>
      <h2
        className="font-serif text-3xl font-bold"
        style={{ color: "var(--color-dark)" }}
      >
        {title}
      </h2>
    </div>
  );
}
