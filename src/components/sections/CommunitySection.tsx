import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { getCommunityPage, getHomePage } from "@/lib/content/pages";
import { mediaUrl } from "@/lib/media";

export default function CommunitySection() {
  const { community } = getHomePage();
  const cards = getCommunityPage().groups.filter((g) => g.showOnHome);

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={community.label}
          title={community.title}
          align="center"
          className="mb-12 lg:mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={`/community#${card.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid rgba(43,58,140,0.05)",
              }}
            >
              {/* Image Area */}
              <div className="relative h-44 flex-shrink-0">
                {card.image ? (
                  <Image
                    src={mediaUrl(card.image)}
                    alt={`${card.title} 사진`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label={`${card.title} 사진`}
                    aspectRatio="16/9"
                    className="w-full h-full rounded-none"
                  />
                )}

                {/* Tag — bottom-right overlay */}
                <span
                  className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(43,58,140,0.85)" }}
                >
                  {card.tag}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 p-5 gap-2">
                <h3
                  className="font-serif text-base font-bold leading-snug"
                  style={{ color: "var(--color-dark)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--color-dark-soft)" }}
                >
                  {card.summary}
                </p>
                <div
                  className="flex items-center gap-1 text-xs font-semibold mt-2 transition-colors duration-200"
                  style={{ color: "var(--color-primary)" }}
                >
                  {community.linkLabel}
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
