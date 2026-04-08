import { MapPin, Phone, Printer, Train } from "lucide-react";

const TRANSPORT_ITEMS = [
  {
    Icon: Train,
    label: "지하철",
    description: "1호선 남영역 3번 출구 도보 8분",
  },
  {
    Icon: MapPin,
    label: "버스",
    description: "청파동 정류장 하차 후 도보 3분",
  },
];

export default function LocationSection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-[5px] mb-3"
            style={{ color: "var(--color-secondary)" }}
          >
            오시는 길
          </p>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            청파중앙교회
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            서울특별시 용산구 청파로73길 58 (서계동)
          </p>
        </div>

        {/* Map Placeholder */}
        <div
          className="rounded-2xl overflow-hidden mb-8 flex flex-col items-center justify-center py-16 gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            minHeight: "280px",
          }}
        >
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <MapPin
              className="w-6 h-6"
              style={{ color: "var(--color-secondary)" }}
              strokeWidth={1.75}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white mb-1">
              카카오맵 연동 영역
            </p>
            <p
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              실제 구현 시 Kakao Maps JavaScript API로 교체됩니다
            </p>
          </div>
          <a
            href="https://map.kakao.com/?q=서울+용산구+청파로73길+58"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
            }}
          >
            카카오맵에서 보기
          </a>
        </div>

        {/* Transport + Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Transport */}
          {TRANSPORT_ITEMS.map(({ Icon, label, description }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-xl px-5 py-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "var(--color-secondary)" }}
                  strokeWidth={1.75}
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                  style={{ color: "var(--color-accent)" }}
                >
                  {label}
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {description}
                </p>
              </div>
            </div>
          ))}

          {/* Phone */}
          <div
            className="flex items-start gap-4 rounded-xl px-5 py-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Phone
                className="w-4 h-4"
                style={{ color: "var(--color-secondary)" }}
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                style={{ color: "var(--color-accent)" }}
              >
                전화
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                02-714-0041~3
              </p>
            </div>
          </div>

          {/* Fax */}
          <div
            className="flex items-start gap-4 rounded-xl px-5 py-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Printer
                className="w-4 h-4"
                style={{ color: "var(--color-secondary)" }}
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                style={{ color: "var(--color-accent)" }}
              >
                FAX
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                02-711-8166
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
