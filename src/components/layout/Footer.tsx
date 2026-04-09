import Link from "next/link";
import Image from "next/image";
import { Youtube, Instagram, Mail } from "lucide-react";

const FOOTER_LINKS = {
  예배: [
    { label: "새가족 안내", href: "/visit" },
    { label: "방문 예약", href: "/visit#reservation" },
    { label: "오시는 길", href: "/visit#location" },
    { label: "예배 시간", href: "/visit#service-times" },
  ],
  공동체: [
    { label: "청년부 United", href: "/community#youth" },
    { label: "청소년부", href: "/community#students" },
    { label: "선교", href: "/community#mission" },
    { label: "소그룹 / 구역", href: "/community#groups" },
  ],
  미디어: [
    { label: "설교 아카이브", href: "/sermons" },
    { label: "소식 & 공지", href: "/news" },
    { label: "문의하기", href: "/contact" },
    { label: "교회소개", href: "/about" },
  ],
} as const;

const SNS_LINKS = [
  {
    label: "유튜브 채널",
    href: "https://www.youtube.com/channel/UC7Fk-mpsIQlgykLK4lW3t7g",
    Icon: Youtube,
  },
  {
    label: "청년부 인스타그램",
    href: "https://www.instagram.com/chungpa_united",
    Icon: Instagram,
  },
  {
    label: "이메일 문의",
    href: "mailto:church@chungpa21.org",
    Icon: Mail,
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "var(--color-dark)" }}>
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1 — Church Info */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="청파중앙교회 홈으로">
              <Image
                src="/images/logo.png"
                alt="청파중앙교회"
                width={120}
                height={36}
                className="h-9 w-auto mb-5"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>

            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              21세기 지도자를 길러내는 교회.
              <br />
              일어나 함께가자.
            </p>

            <address
              className="not-italic text-sm space-y-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <p>서울특별시 용산구 청파로73길 58</p>
              <p>Tel. 02-714-0041~3</p>
              <p>Fax. 02-711-8166</p>
            </address>

            {/* SNS Icons */}
            <div className="flex items-center gap-3 mt-6">
              {SNS_LINKS.map(({ label, href, Icon }) => (
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
          {(Object.entries(FOOTER_LINKS) as [string, readonly { label: string; href: string }[]][]).map(
            ([category, links]) => (
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
            &copy; {currentYear} 청파중앙교회 (Chungpa JoongAng Church). All rights reserved.
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            대한예수교 장로회
          </p>
        </div>
      </div>
    </footer>
  );
}
