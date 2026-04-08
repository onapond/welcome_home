"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Home, Footprints, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

interface TimelineNode {
  year: string;
  slogan: string;
  subtitle: string;
  Icon: LucideIcon;
  active: boolean;
}

const NODES: TimelineNode[] = [
  {
    year: "2024",
    slogan: "우리는 한 가족입니다",
    subtitle: "소속감과 뿌리를 찾아서",
    Icon: Home,
    active: false,
  },
  {
    year: "2025",
    slogan: "우리는 여행하는 사람들입니다",
    subtitle: "순례의 여정, 함께 걷는 길",
    Icon: Footprints,
    active: false,
  },
  {
    year: "2026",
    slogan: "일어나 함께가자",
    subtitle: "행동하는 공동체, 동행의 시작",
    Icon: ArrowUpRight,
    active: true,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25 },
  },
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" } as object,
  },
};

export default function JourneyTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="우리의 여정"
          title="3년의 발걸음, 하나의 이야기"
          align="center"
          className="mb-16 lg:mb-20"
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* ── Desktop: Horizontal ── */}
          <div className="hidden md:flex items-start">
            {NODES.map((node, i) => (
              <div key={node.year} className="flex items-start flex-1">
                {/* Node + Label */}
                <motion.div
                  variants={nodeVariants}
                  className="flex flex-col items-center flex-1"
                >
                  {/* Circle */}
                  <div
                    className="relative flex items-center justify-center w-14 h-14 rounded-full mb-5 transition-all"
                    style={
                      node.active
                        ? {
                            backgroundColor: "var(--color-primary)",
                            boxShadow: "0 0 0 12px color-mix(in srgb, var(--color-primary) 10%, transparent)",
                          }
                        : {
                            backgroundColor: "var(--color-white)",
                            border: "2px solid var(--color-primary)",
                          }
                    }
                  >
                    <node.Icon
                      className="w-6 h-6"
                      strokeWidth={1.75}
                      style={{
                        color: node.active
                          ? "white"
                          : "var(--color-primary)",
                      }}
                    />
                  </div>

                  {/* Year */}
                  <p
                    className="text-xs font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {node.year}
                  </p>

                  {/* Slogan */}
                  <p
                    className="font-serif text-sm font-bold text-center leading-snug mb-1.5 px-2"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {node.slogan}
                  </p>

                  {/* Subtitle */}
                  <p
                    className="text-xs text-center px-3 leading-relaxed"
                    style={{ color: "var(--color-dark-soft)" }}
                  >
                    {node.subtitle}
                  </p>
                </motion.div>

                {/* Connector Line (between nodes) */}
                {i < NODES.length - 1 && (
                  <div
                    className="flex-shrink-0 mt-7 h-0.5 w-16"
                    style={{
                      background:
                        "linear-gradient(to right, var(--color-bg-warm), var(--color-primary), var(--color-primary-light))",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Mobile: Vertical ── */}
          <div className="flex flex-col md:hidden gap-0">
            {NODES.map((node, i) => (
              <div key={node.year} className="flex gap-5">
                {/* Left: Circle + Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <motion.div
                    variants={nodeVariants}
                    className="flex items-center justify-center w-12 h-12 rounded-full z-10"
                    style={
                      node.active
                        ? {
                            backgroundColor: "var(--color-primary)",
                            boxShadow:
                              "0 0 0 10px color-mix(in srgb, var(--color-primary) 10%, transparent)",
                          }
                        : {
                            backgroundColor: "var(--color-white)",
                            border: "2px solid var(--color-primary)",
                          }
                    }
                  >
                    <node.Icon
                      className="w-5 h-5"
                      strokeWidth={1.75}
                      style={{
                        color: node.active ? "white" : "var(--color-primary)",
                      }}
                    />
                  </motion.div>

                  {/* Vertical connector */}
                  {i < NODES.length - 1 && (
                    <div
                      className="w-0.5 flex-1 my-1"
                      style={{
                        minHeight: "3rem",
                        background:
                          "linear-gradient(to bottom, var(--color-primary), var(--color-primary-light))",
                      }}
                    />
                  )}
                </div>

                {/* Right: Content */}
                <motion.div
                  variants={nodeVariants}
                  className="flex-1 pb-8"
                >
                  <p
                    className="text-xs font-bold tracking-widest mb-1.5"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {node.year}
                  </p>
                  <p
                    className="font-serif text-base font-bold leading-snug mb-1"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {node.slogan}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-dark-soft)" }}
                  >
                    {node.subtitle}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
