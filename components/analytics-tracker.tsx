"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Payload = {
  type: "pageview" | "ping" | "chapter" | "scroll" | "click";
  sid: string;
  path: string;
  ref?: string;
  chapter?: string;
  depth?: number;
  label?: string;
};

function send(p: Payload) {
  const body = JSON.stringify(p);
  try {
    if (
      navigator.sendBeacon &&
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
    ) {
      return;
    }
  } catch {}
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function getSid() {
  try {
    let s = sessionStorage.getItem("sk_sid");
    if (!s) {
      s =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("sk_sid", s);
    }
    return s;
  } catch {
    return "nostorage-" + Math.random().toString(36).slice(2, 12);
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (navigator.doNotTrack === "1") return;

    const sid = getSid();
    let ref = "";
    try {
      const u = new URL(document.referrer);
      if (u.host !== location.host) ref = u.host;
    } catch {}

    send({ type: "pageview", sid, path: pathname, ref });

    const ping = setInterval(() => {
      if (document.visibilityState === "visible") send({ type: "ping", sid, path: pathname });
    }, 15000);

    const seenChapters = new Set<string>();
    let io: IntersectionObserver | undefined;
    const observe = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (en.isIntersecting && !seenChapters.has(en.target.id)) {
              seenChapters.add(en.target.id);
              send({ type: "chapter", sid, path: pathname, chapter: en.target.id });
            }
          }
        },
        { threshold: 0.3 }
      );
      document.querySelectorAll('section[id^="chapter-"]').forEach((el) => io!.observe(el));
    };
    const t1 = setTimeout(observe, 400);
    const t2 = setTimeout(observe, 2500);

    const seenDepth = new Set<number>();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const h = document.documentElement;
        const pct = ((window.scrollY + window.innerHeight) / h.scrollHeight) * 100;
        for (const d of [25, 50, 75, 100]) {
          if (pct >= (d === 100 ? 98 : d) && !seenDepth.has(d)) {
            seenDepth.add(d);
            send({ type: "scroll", sid, path: pathname, depth: d });
          }
        }
      });
    };

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track], a[download], a[href]");
      if (!el) return;
      let label = el.getAttribute("data-track");
      if (!label && el instanceof HTMLAnchorElement) {
        if (el.hasAttribute("download")) label = "picture_download";
        else if (el.href.startsWith("https://wa.me")) label = "whatsapp_share";
        else {
          try {
            const u = new URL(el.href);
            if (u.host !== location.host) label = "outbound:" + u.host;
          } catch {}
        }
      }
      if (label) send({ type: "click", sid, path: pathname, label });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      clearInterval(ping);
      clearTimeout(t1);
      clearTimeout(t2);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}
