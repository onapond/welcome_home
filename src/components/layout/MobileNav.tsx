"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "./Header";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col"
            aria-label="모바일 메뉴"
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
                onClick={onClose}
                aria-label="메뉴 닫기"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "var(--color-dark)" }} />
              </button>
            </div>

            {/* Nav Links */}
            <ul className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center px-6 py-4 text-base font-medium border-b border-gray-50 transition-colors hover:bg-gray-50"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="p-6 border-t border-gray-100">
              <Link
                href="/visit#reservation"
                onClick={onClose}
                className="block w-full text-center px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                처음 오시나요?
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
