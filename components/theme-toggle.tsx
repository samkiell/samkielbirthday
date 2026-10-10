"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-muted"
        aria-hidden="true"
      >
        <Monitor className="w-4 h-4 opacity-50" />
      </div>
    );
  }

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getLabel = () => {
    if (theme === "system") return "Theme: Device (System). Tap for light.";
    if (theme === "light") return "Theme: Light. Tap for dark.";
    return "Theme: Dark. Tap for device default.";
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className="group relative flex items-center justify-center w-8 h-8 rounded-full border border-hairline text-muted hover:text-ink hover:border-ink transition-colors"
    >
      {theme === "system" && (
        <Monitor className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
      )}
      {theme === "light" && (
        <Sun className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
      )}
      {theme === "dark" && (
        <Moon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
      )}
    </button>
  );
}
