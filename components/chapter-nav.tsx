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
        if (window.scrollY < 240) {
          setActiveChapter("chapter-01");
        } else if (progress > 90) {
          setActiveChapter("chapter-05");
        }
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

      {/* Desktop Sticky Chapter Index (Left Dock) */}
      <nav
        aria-label="Chapter navigation"
        className="hidden md:flex fixed left-3 lg:left-5 xl:left-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center bg-paper/90 dark:bg-paper/90 backdrop-blur-md border border-hairline rounded-full py-3 px-1.5 shadow-sm transition-all"
      >
        <div className="flex flex-col items-center">
          {CHAPTERS.map((ch, index) => {
            const isActive = activeChapter === ch.id;
            return (
              <div key={ch.id} className="flex flex-col items-center">
                {index > 0 && (
                  <div
                    className={`w-px h-2.5 transition-colors duration-200 ${
                      isActive || activeChapter === CHAPTERS[index - 1]?.id
                        ? "bg-accent/40"
                        : "bg-hairline"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => scrollToChapter(ch.id)}
                  className="group relative flex items-center justify-center p-0.5 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Jump to Chapter ${ch.num}: ${ch.label}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono tracking-wider transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-paper font-semibold shadow-xs scale-105"
                        : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {ch.num}
                  </span>

                  {/* Chapter Label Tooltip on hover */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-md bg-ink text-paper text-[10px] uppercase tracking-widest font-mono shadow-md whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5"
                  >
                    <span className="font-semibold text-accent dark:text-accent-hover">
                      {ch.num}
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{ch.label}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
