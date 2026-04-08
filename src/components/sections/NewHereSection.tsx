import Link from "next/link";
import { MapPin, Clock, Baby, ParkingSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

interface InfoItem {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    Icon: MapPin,
    title: "위치",
    description: "서울특별시 용산구 청파로73길 58 (서계동)",
  },
  {
    Icon: Clock,
    title: "주일예배",
    description: "오전 11시 — 매주 일요일 본당에서 드립니다",
  },
  {
    Icon: Baby,
    title: "키즈",
    description: "영아부터 청소년까지 연령별 예배와 교육이 준비되어 있습니다",
  },
  {
    Icon: ParkingSquare,
    title: "주차",
    description: "교회 인근 공영주차장 이용 가능 (주일 2시간 지원)",
  },
];

export default function NewHereSection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text (order-2 on mobile) ── */}
          <div className="order-2 lg:order-1 flex flex-col gap-8">
            <SectionHeader
              label="새가족 안내"
              title="처음 오시는 분을 환영합니다"
              align="left"
            />

            <p className="text-base leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
              청파중앙교회는 처음 오시는 모든 분을 온 마음으로 환영합니다.
              종교가 없으셔도, 교회가 처음이셔도 괜찮습니다.
              이곳에서 새로운 가족을 만나고, 함께 걸어가는 여정을 시작해보세요.
            </p>

            {/* Info List */}
            <ul className="flex flex-col gap-4">
              {INFO_ITEMS.map(({ Icon, title, description }) => (
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
                      className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div>
              <Link
                href="/visit/first-time"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                방문 예약하기
              </Link>
            </div>
          </div>

          {/* ── Right: Image (order-1 on mobile) ── */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden">
              <ImagePlaceholder
                label="교회 사진"
                aspectRatio="4/3"
                className="rounded-2xl"
              />

              {/* Welcome Badge — top-left */}
              <div
                className="absolute top-4 left-4 px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "rgba(43,58,140,0.85)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="text-xs font-bold tracking-[4px] uppercase"
                  style={{ color: "var(--color-accent)" }}
                >
                  WELCOME
                </p>
                <p className="text-xs text-white/80 mt-0.5">누구나 환영합니다</p>
              </div>

              {/* Bottom Gradient + Quote */}
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
                  &ldquo;우리는 한 가족입니다&rdquo;
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                  2024 청파중앙교회 표어
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
