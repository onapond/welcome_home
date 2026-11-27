import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { getSite } from "@/lib/content";
import { getHomePage } from "@/lib/content/pages";
import { getIcon } from "@/lib/icons";
import { mediaUrl } from "@/lib/media";

export default function NewHereSection() {
  const { newHere } = getHomePage();
  const quote = getSite().mottos.find((m) => m.year === newHere.quote.year);

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text (order-2 on mobile) ── */}
          <div className="order-2 lg:order-1 flex flex-col gap-8">
            <SectionHeader
              label={newHere.label}
              title={newHere.title}
              align="left"
            />

            <p className="text-base leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
              {newHere.intro}
            </p>

            {/* Info List */}
            <ul className="flex flex-col gap-4">
              {newHere.items.map(({ icon, title, text }) => {
                const Icon = getIcon(icon);
                return (
                <li key={title} className="flex items-start gap-4">
                  {/* Icon Box */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl"
                    style={{ backgroundColor: "var(--color-bg-warm)" }}
                  >
                    <Icon
                      className="w-5 h-5"
                      strokeWidth={1.75}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <p
                      className="text-xs font-semibold mb-0.5"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                      {text}
                    </p>
                  </div>
                </li>
                );
              })}
            </ul>

            {/* CTA */}
            <div>
              <Link
                href={newHere.cta.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {newHere.cta.label}
              </Link>
            </div>
          </div>

          {/* ── Right: Image (order-1 on mobile) ── */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden">
              {newHere.image.src ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={mediaUrl(newHere.image.src)}
                    alt={newHere.image.label}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover rounded-2xl"
                  />
                </div>
              ) : (
                <ImagePlaceholder
                  label={newHere.image.label}
                  aspectRatio="4/3"
                  className="rounded-2xl"
                />
              )}

              {/* Welcome Badge — top-left */}
              <div
                className="absolute top-4 left-4 px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "var(--color-primary)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--color-accent)" }}
                >
                  {newHere.badge.label}
                </p>
                <p className="text-xs text-white/80 mt-0.5">{newHere.badge.text}</p>
              </div>

              {/* Bottom Gradient + Quote */}
              {quote && (
              <div
                className="absolute bottom-0 left-0 right-0 px-5 py-5"
                style={{
                  background:
                    "linear-gradient(to top, rgba(26,30,44,0.85) 0%, transparent 100%)",
                }}
              >
                <p
                  className="font-serif text-base font-bold text-white"
                >
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {quote.year} {newHere.quote.caption}
                </p>
              </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
