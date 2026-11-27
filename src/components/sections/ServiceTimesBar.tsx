import { getSite } from "@/lib/content";
import { getIcon } from "@/lib/icons";

export default function ServiceTimesBar() {
  const services = getSite().services.filter((s) => s.showOnHome);

  return (
    <section
      aria-label="예배 시간 안내"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {services.map((service, i) => {
            const Icon = getIcon(service.icon);
            const isLastInRow2Mobile = i === 3;
            const isLastDesktop = i === services.length - 1;

            return (
              <div
                key={service.id}
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
                  aria-hidden="true"
                />

                {/* Text */}
                <div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-0.5"
                    style={{ color: "var(--color-secondary-light)" }}
                  >
                    {service.short ?? service.name}
                  </p>
                  <p
                    className="font-serif text-lg text-white leading-none"
                  >
                    {service.time}
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
