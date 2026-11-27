"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Youtube, Instagram, Mail } from "lucide-react";
import { useSite } from "./SiteProvider";
import { footerLinkGroups } from "@/lib/nav";

const noSubscribe = () => () => {};

/**
 * 서버 HTML과 첫 클라이언트 렌더는 빌드한 해(buildYear)를 쓰고, 하이드레이션 뒤에
 * 지금 연도로 바꾼다. 연말에 만든 HTML을 새해에 열어도 하이드레이션이 어긋나지 않는다.
 */
function useCurrentYear(buildYear: number): number {
  return useSyncExternalStore(noSubscribe, () => new Date().getFullYear(), () => buildYear);
}

export default function Footer({ buildYear }: { buildYear: number }) {
  const site = useSite();
  const currentYear = useCurrentYear(buildYear);

  // 주소·SNS는 site.yaml에 값이 있는 것만 보인다.
  const snsLinks = [
    site.youtube && { label: "유튜브 채널", href: site.youtube, Icon: Youtube },
    site.instagram && { label: "인스타그램", href: site.instagram, Icon: Instagram },
    site.email && { label: "이메일 문의", href: `mailto:${site.email}`, Icon: Mail },
  ].filter((l): l is { label: string; href: string; Icon: typeof Mail } => Boolean(l));

  return (
    <footer style={{ backgroundColor: "var(--color-dark)" }}>
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1 — Church Info */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" aria-label={`${site.name} 홈으로`}>
              <Image
                src="/images/logo-mark-h80.webp"
                alt={site.name}
                width={214}
                height={80}
                className="h-9 w-auto mb-5"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {site.vision}.
              <br />
              {site.latestMotto}.
            </p>

            <address
              className="not-italic text-sm space-y-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <p>{site.address}</p>
              <p>Tel. {site.phone}</p>
              {site.fax && <p>Fax. {site.fax}</p>}
            </address>

            {/* SNS Icons */}
            <div className="flex items-center gap-3 mt-6">
              {snsLinks.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                  }
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2–4 — Link Groups */}
          {footerLinkGroups(site.communityLinks).map(
            ({ title: category, links }) => (
              <div key={category}>
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--color-secondary)" }}
                >
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors duration-200"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "rgba(255,255,255,1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.55)")
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            &copy; {currentYear} {site.name} ({site.nameEn}). All rights reserved.
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {site.denomination}
          </p>
        </div>
      </div>
    </footer>
  );
}
