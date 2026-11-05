import { useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from "react";

export function useRevealAll() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not([data-in])");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <Tag ref={ref} data-reveal="" className={className} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function SplitWords({ text, delay = 0, step = 70 }: { text: string; delay?: number; step?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="word">
          <span style={{ "--d": `${delay + i * step}ms` } as CSSProperties}>{w}&nbsp;</span>
        </span>
      ))}
    </>
  );
}
