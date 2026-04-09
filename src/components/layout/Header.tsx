"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import MobileNav from "./MobileNav";

export const NAV_LINKS = [
  { label: "교회소개", href: "/about" },
  { label: "예배안내", href: "/visit/service-times" },
  { label: "새가족", href: "/visit" },
  { label: "공동체", href: "/community" },
  { label: "설교", href: "/sermons" },
  { label: "소식", href: "/news" },
] as const;

const SCROLL_THRESHOLD = 60;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
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
              aria-label="청파중앙교회 홈으로"
            >
              <Image
                src="/images/logo.png"
                alt="청파중앙교회"
                width={120}
                height={36}
                className="h-9 w-auto transition-all duration-300"
                style={
                  scrolled
                    ? {}
                    : { filter: "brightness(0) invert(1)" }
                }
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-2"
              aria-label="주 메뉴"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-300",
                    scrolled
                      ? "text-dark hover:text-primary hover:bg-gray-50"
                      : "text-white/90 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              {/* CTA Button */}
              <Link
                href="/visit#reservation"
                className={[
                  "ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  scrolled
                    ? "bg-primary text-white hover:brightness-110"
                    : "bg-white text-primary hover:bg-white/90",
                ].join(" ")}
              >
                처음 오시나요?
              </Link>
            </nav>

            {/* Mobile Hamburger */}
            <button
              className={[
                "md:hidden p-2 rounded-lg transition-all duration-300",
                scrolled
                  ? "text-dark hover:bg-gray-100"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
