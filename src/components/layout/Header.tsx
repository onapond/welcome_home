"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import MobileNav from "./MobileNav";
import { useSite } from "./SiteProvider";
import { NAV_CTA, NAV_ITEMS } from "@/lib/nav";

const SCROLL_THRESHOLD = 60;

/**
 * 맨 위가 어두운 머리글(사진 · 남색 배경)로 시작하는 경로.
 * 이 경로에서만 머리글이 투명 + 흰 글자로 시작한다. 그 밖의 경로(설교 · 소식 ·
 * 주보 · 갤러리 상세, 404 등 밝은 배경으로 시작하는 화면)는 처음부터 흰 머리글이다.
 * 어두운 머리글을 가진 새 페이지를 만들면 여기에 경로를 더한다.
 */
const DARK_HERO_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/about",
  "/community",
  "/contact",
  "/visit",
  "/visit/service-times",
  "/sermons",
  "/sermons/praise",
  "/news",
  "/news/bulletin",
  "/news/gallery",
]);

export default function Header() {
  const site = useSite();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Solid (white) header once scrolled, or from the start on light pages.
  const solid = scrolled || !DARK_HERO_ROUTES.has(pathname);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          solid
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0"
              aria-label={`${site.name} 홈으로`}
            >
              <Image
                src="/images/logo-mark.png"
                alt={site.name}
                width={262}
                height={98}
                className="h-9 w-auto transition-all duration-300"
                style={
                  solid
                    ? {}
                    : { filter: "brightness(0) invert(1)" }
                }
                priority
              />
            </Link>

            {/*
              Desktop Nav — 메뉴 7개 + 강조 버튼이 768~1023px 폭에는 다 들어가지 않으므로
              lg(1024px) 이상에서만 펼치고, 그보다 좁으면 모바일 메뉴를 쓴다.
            */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2"
              aria-label="주 메뉴"
            >
              {NAV_ITEMS.map((item) => {
                const linkClass = [
                  "px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-300",
                  solid
                    ? "text-dark hover:text-primary hover:bg-gray-50"
                    : "text-white/90 hover:text-white hover:bg-white/10",
                ].join(" ");

                if (!item.children) {
                  return (
                    <Link key={item.href} href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div key={item.href} className="relative group">
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                    {/* 하위 메뉴: 마우스를 올리거나 키보드로 들어오면 열린다 */}
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-200 absolute left-0 top-full min-w-36 pt-1">
                      <ul className="rounded-lg bg-white py-1.5 shadow-lg ring-1 ring-black/5">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2 text-sm text-dark whitespace-nowrap hover:bg-gray-50 hover:text-primary"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {/* CTA Button */}
              <Link
                href={NAV_CTA.href}
                className={[
                  "ml-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300",
                  solid
                    ? "bg-primary text-white hover:brightness-110"
                    : "bg-white text-primary hover:bg-white/90",
                ].join(" ")}
              >
                {NAV_CTA.label}
              </Link>
            </nav>

            {/* Mobile / tablet Hamburger */}
            <button
              ref={menuButtonRef}
              type="button"
              className={[
                "lg:hidden p-2 rounded-lg transition-all duration-300",
                solid
                  ? "text-dark hover:bg-gray-100"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
