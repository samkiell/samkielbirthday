"use client";

import Link from "next/link";
import { triggerConfetti } from "@/lib/confetti";
import { Home, Sparkles, HeartHandshake, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const handlePretend = () => {
    triggerConfetti();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-paper/90 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-accent font-medium">
            404 · route lost in motion
          </span>
        </div>

        {/* Big Editorial 404 & Headline */}
        <div className="space-y-3">
          <p className="font-serif text-7xl sm:text-8xl md:text-9xl font-light text-ink/80 tracking-tighter leading-none select-none">
            404
          </p>
          <h1 className="font-serif text-2xl sm:text-4xl text-ink font-normal leading-tight">
            omo, you don miss road.
          </h1>
          <p className="font-editorial text-lg sm:text-xl text-muted italic max-w-md mx-auto">
            &ldquo;two decades in, still on motion... but this page refused to move with us.&rdquo;
          </p>
        </div>

        {/* Funny Casual Explanation Card */}
        <div className="relative p-6 sm:p-7 rounded-2xl border border-hairline bg-paper/60 backdrop-blur-xs space-y-5 text-left shadow-xs">
          <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-sans">
            Whatever you were looking for doesn&apos;t live at this URL. Maybe you
            typed something experimental, maybe the route went offline to celebrate
            Samkiel&apos;s 20th birthday, or maybe you just took a wrong turn on the internet.
          </p>

          {/* Interactive Easter Egg Button */}
          <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-hairline/80">
            <button
              type="button"
              onClick={handlePretend}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-hairline bg-paper text-xs font-mono text-muted hover:text-ink hover:border-accent hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>press this to pretend nothing happened</span>
            </button>

            <span className="text-[11px] font-mono text-muted/70">
              +1 api credit for getting lost 😹
            </span>
          </div>
        </div>

        {/* Quick Recovery Navigation */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
            safe routes back home
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-ink text-paper text-xs font-mono uppercase tracking-wider hover:bg-ink/90 transition-all shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>back to home</span>
            </Link>

            <Link
              href="/wishes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-2xs"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-accent" />
              <span>drop a wish instead</span>
            </Link>

            <Link
              href="/pictures"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-accent" />
              <span>see the pictures</span>
            </Link>
          </div>
        </div>

        {/* Minimalist Editorial Colophon */}
        <div className="pt-6 flex items-center justify-center gap-3 opacity-50 select-none">
          <div className="h-px w-12 bg-hairline" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
            samkiel · chapter 20
          </span>
          <div className="h-px w-12 bg-hairline" />
        </div>
      </div>
    </div>
  );
}
