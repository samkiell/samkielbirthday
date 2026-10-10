"use client";

import { useEffect, useState } from "react";

const CHAPTERS = [
  { id: "chapter-01", num: "01", label: "Opening" },
  { id: "chapter-02", num: "02", label: "Story" },
  { id: "chapter-03", num: "03", label: "Learning" },
  { id: "chapter-04", num: "04", label: "Letters" },
  { id: "chapter-05", num: "05", label: "Manifesto" },
];

export function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState("chapter-01");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-30% 0px -40% 0px",
        threshold: 0,
      }
    );

    CHAPTERS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Mobile Top Progress Line */}
      <div
        className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-transparent md:hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Sticky Chapter Index (Left Rail) */}
      <nav
        aria-label="Chapter navigation"
        className="hidden md:flex fixed left-6 lg:left-12 top-1/2 -translate-y-1/2 z-40 flex-col gap-5 text-xs font-mono"
      >
        {CHAPTERS.map((ch) => {
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => scrollToChapter(ch.id)}
              className="group flex items-center gap-3 text-left transition-colors cursor-pointer"
              aria-label={`Jump to ${ch.num} ${ch.label}`}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={`transition-all duration-200 tracking-wider ${
                  isActive
                    ? "text-accent font-semibold scale-110"
                    : "text-muted group-hover:text-ink"
                }`}
              >
                {ch.num}
              </span>
              <span
                className={`text-[10px] uppercase tracking-widest transition-opacity duration-200 ${
                  isActive
                    ? "opacity-100 text-ink"
                    : "opacity-0 group-hover:opacity-70 text-muted"
                }`}
              >
                {ch.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
