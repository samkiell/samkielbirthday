"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, PenLine } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/#chapter-01" },
  { label: "My Story", href: "/#chapter-02" },
  { label: "Reflections", href: "/#chapter-03" },
  { label: "Wish Wall", href: "/wishes" },
  { label: "Pictures", href: "/pictures" },
  { label: "Next Chapter", href: "/#chapter-05" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-paper/90 border-b border-hairline transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link
          href="/"
          className="font-serif tracking-[0.2em] uppercase text-sm sm:text-base font-semibold text-ink hover:text-accent transition-colors"
        >
          SAMKIEL
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono tracking-wider"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => handleLinkClick(item.href)}
              className="text-muted hover:text-ink transition-colors relative py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* "Leave a Wish" Button */}
            <Link
              href="/wishes#write"
              onClick={() => handleLinkClick("/wishes#write")}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer shadow-xs"
          >
            <PenLine className="w-3 h-3" />
            <span>Leave a Wish</span>
          </Link>

          {/* Device/Light/Dark Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border border-hairline text-muted hover:text-ink cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-hairline bg-paper/98 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-wider">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => handleLinkClick(item.href)}
                className="py-2 text-ink hover:text-accent border-b border-hairline/40 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2">
            <Link
              href="/wishes#write"
              onClick={() => handleLinkClick("/wishes#write")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Leave a Wish</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
