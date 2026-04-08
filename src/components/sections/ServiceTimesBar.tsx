import { Sun, Moon, Heart, Sunrise } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceTime {
  label: string;
  time: string;
  Icon: LucideIcon;
}

const SERVICE_TIMES: ServiceTime[] = [
  { label: "주일예배", time: "오전 11:00", Icon: Sun },
  { label: "수요예배", time: "오후 7:30",  Icon: Moon },
  { label: "금요기도", time: "오후 9:00",  Icon: Heart },
  { label: "새벽기도", time: "오전 5:30",  Icon: Sunrise },
];

export default function ServiceTimesBar() {
  return (
    <section
      aria-label="예배 시간 안내"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {SERVICE_TIMES.map(({ label, time, Icon }, i) => {
            const isLastInRow2Mobile = i === 3;
            const isLastDesktop = i === SERVICE_TIMES.length - 1;

            return (
              <div
                key={label}
                className={[
                  "flex items-center gap-4 px-6 py-4",
                  // mobile: right border except last in each row
                  i % 2 === 0 ? "border-r border-white/10" : "",
                  // mobile: bottom border for first row
                  i < 2 ? "border-b border-white/10 md:border-b-0" : "",
                  // desktop: right border except last
                  !isLastDesktop ? "md:border-r md:border-white/10" : "",
                  isLastInRow2Mobile ? "md:border-r-0" : "",
                ].join(" ")}
              >
                {/* Icon */}
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                  strokeWidth={1.5}
                />

                {/* Text */}
                <div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="font-serif text-lg text-white leading-none"
                  >
                    {time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
