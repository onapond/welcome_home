"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { NAV_CTA, NAV_ITEMS } from "@/lib/nav";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  /** 닫힐 때 포커스를 돌려줄 요소(머리글의 메뉴 열기 버튼) */
  returnFocusRef: RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** 데스크톱 메뉴가 펼쳐지는 폭(Header의 lg). 이 폭이 되면 열린 서랍을 닫는다. */
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function MobileNav({ isOpen, onClose, returnFocusRef }: MobileNavProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // 부모가 매 렌더마다 새 onClose를 넘겨도 아래 효과가 다시 돌지 않도록 ref로 들고 있는다.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 열림: 포커스를 서랍 안으로 옮기고, Tab을 서랍 안에 가두고, Esc로 닫고, 배경 스크롤을 막는다.
  // 닫힘: 메뉴 열기 버튼으로 포커스를 돌려준다.
  useEffect(() => {
    if (!isOpen) {
      if (wasOpen.current) returnFocusRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const items = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && drawerRef.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onViewport = (e: MediaQueryListEvent) => {
      if (e.matches) onCloseRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onViewport);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewport);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, returnFocusRef]);

  /*
    열림/닫힘을 CSS transform 전환으로 처리한다. 항상 마운트해 두고 화면 밖으로
    밀어두므로, 닫는 애니메이션도 자연스럽게 재생된다.
    닫힌 동안에는 inert로 키보드·스크린리더 접근을 막는다.
  */
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        id="mobile-nav"
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        aria-label="모바일 메뉴"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span
                className="font-serif text-lg font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                메뉴
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="메뉴 닫기"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "var(--color-dark)" }} aria-hidden="true" />
              </button>
            </div>

            {/* Nav Links */}
            <ul className="flex-1 overflow-y-auto py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center px-6 py-4 text-base font-medium border-b border-gray-50 transition-colors hover:bg-gray-50"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="bg-gray-50/60">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="flex items-center pl-10 pr-6 py-3 text-sm border-b border-gray-50 transition-colors hover:bg-gray-50"
                            style={{ color: "var(--color-dark-soft)" }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="p-6 border-t border-gray-100">
              <Link
                href={NAV_CTA.href}
                onClick={onClose}
                className="block w-full text-center px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {NAV_CTA.label}
              </Link>
            </div>
      </nav>
    </>
  );
}
