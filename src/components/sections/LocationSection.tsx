import { ExternalLink, Phone, Printer } from "lucide-react";
import { getSite } from "@/lib/content";
import { getLocationInfo } from "@/lib/content/pages";
import { getIcon } from "@/lib/icons";
import { googleMapEmbedUrl, kakaoDirectionsUrl, naverMapUrl } from "@/lib/directions";
import { fullAddress, telHref } from "@/lib/site-summary";

export default function LocationSection() {
  const site = getSite();
  const location = getLocationInfo();
  // 카카오맵은 좌표(site.yaml geo)가 있으면 교회를 목적지로 둔 길찾기, 없으면 주소 검색으로 연다.
  const directions = [
    { label: location.mapButton, href: kakaoDirectionsUrl(site) },
    { label: location.naverMapButton, href: naverMapUrl(site) },
  ];

  return (
    <section id="location" className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold mb-3"
            style={{ color: "var(--color-secondary)" }}
          >
            {location.label}
          </p>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">
            {site.name}
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            {fullAddress(site.address)}
          </p>
        </div>

        {/* Map + directions — 화면 속 지도는 구글(키 없음), 길찾기는 카카오 · 네이버 앱으로 연결한다 */}
        <div
          className="rounded-2xl mb-8 overflow-hidden"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <iframe
            src={googleMapEmbedUrl(site)}
            title={`${site.name} 위치 지도`}
            className="block w-full h-72 sm:h-96 border-0"
            style={{ backgroundColor: "var(--color-bg-warm)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col items-center justify-center px-6 py-8 gap-5 text-center">
            <div>
              <p className="text-sm font-medium text-white mb-1">{location.directions.title}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                {location.directions.text}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {directions.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 hover:brightness-110"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  {label}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">(새 창)</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Transport + Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Transport */}
          {location.transport.map(({ id, icon, label, text }) => {
            const Icon = getIcon(icon);
            return (
            <div
              key={id}
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
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "var(--color-secondary-light)" }}
                >
                  {label}
                </p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {text}
                </p>
              </div>
            </div>
            );
          })}

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
                className="text-xs font-semibold mb-0.5"
                style={{ color: "var(--color-secondary-light)" }}
              >
                전화
              </p>
              <a
                href={telHref(site.phone)}
                className="text-sm underline underline-offset-4 decoration-white/30 hover:text-white"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {site.phone}
              </a>
            </div>
          </div>

          {/* Fax */}
          {site.fax && (
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
                className="text-xs font-semibold mb-0.5"
                style={{ color: "var(--color-secondary-light)" }}
              >
                FAX
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                {site.fax}
              </p>
            </div>
          </div>
          )}
        </div>

      </div>
    </section>
  );
}
