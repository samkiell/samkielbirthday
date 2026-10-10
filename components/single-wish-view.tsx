"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { WishResponse } from "@/types/wishes";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Share2,
  PenLine,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import {
  downloadLetterAsPng,
  shareLetterAsPng,
} from "@/lib/letter-card-generator";

interface SingleWishViewProps {
  wish: WishResponse;
}

export function SingleWishView({ wish }: SingleWishViewProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/wish/${wish.code}`;
    }
    return `https://birthday.samkiel.dev/wish/${wish.code}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("wish link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("could not copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `read this birthday wish from ${wish.name} for samkiel at 20: "${wish.message}"\n\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const formattedDate = new Date(wish.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-10">
      {/* Navigation */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <Link
          href="/wishes"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>all wishes</span>
        </Link>

        <span className="text-[11px] font-mono tracking-wider text-muted">
          /wish/{wish.code}
        </span>
      </div>

      {/* Main Wish Card */}
      <article className="relative p-7 sm:p-10 rounded-2xl border border-hairline bg-paper/85 backdrop-blur-xs shadow-lg space-y-8">
        {/* Card Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline/80 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent font-semibold">
              chapter 20 · birthday wish
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-medium text-ink">
              {wish.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {wish.relationship && (
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-hairline bg-paper text-muted">
                {wish.relationship}
              </span>
            )}
            <time
              dateTime={wish.createdAt}
              className="text-[11px] font-mono text-muted/80"
            >
              {formattedDate}
            </time>
          </div>
        </div>

        {/* Wish Body with Editorial Typography */}
        <div className="py-2 space-y-4">
          <p className="font-editorial text-xl sm:text-3xl text-ink leading-relaxed italic whitespace-pre-wrap">
            &ldquo;{wish.message}&rdquo;
          </p>

          {/* Dropped Fountain Pen Design ("pen dropped, as per done writing") */}
          <div
            className="flex items-center justify-end pt-3 pb-1 pr-2 opacity-80 select-none"
            aria-hidden="true"
          >
            <svg
              width="140"
              height="26"
              viewBox="0 0 140 26"
              fill="none"
              className="rotate-[-5deg] drop-shadow-xs"
            >
              {/* Soft ground shadow */}
              <ellipse
                cx="66"
                cy="21"
                rx="62"
                ry="3"
                fill="currentColor"
                className="text-black/15 dark:text-black/40 blur-[2px]"
              />
              {/* Pen finial */}
              <rect x="5" y="8.5" width="3.5" height="9" rx="1.5" fill="#C8A14E" />
              {/* Pen barrel */}
              <rect
                x="8.5"
                y="7.5"
                width="72"
                height="11"
                rx="3"
                className="fill-[#1A3024] dark:fill-[#223B2D]"
              />
              {/* Center gold band */}
              <rect x="80.5" y="7" width="4" height="12" fill="#E0BF62" />
              {/* Contoured grip section */}
              <path
                d="M84.5 8 L102 9.5 L102 16.5 L84.5 18 Z"
                className="fill-[#2B2926] dark:fill-[#1C1A17]"
              />
              {/* Nib collar */}
              <rect x="102" y="9" width="2.5" height="8" fill="#E0BF62" />
              {/* Spade fountain nib */}
              <path
                d="M104.5 9 Q111.5 7.5 116 9.5 L127 13 L116 16.5 Q111.5 18.5 104.5 17 Z"
                fill="#DFC26C"
              />
              {/* Slit & breather hole */}
              <line
                x1="112"
                y1="13"
                x2="127"
                y2="13"
                stroke="#1B1711"
                strokeWidth="0.8"
              />
              <circle cx="112" cy="13" r="1.1" fill="#1B1711" />
              {/* Fresh ink drop at nib point */}
              <circle cx="131" cy="14" r="1.8" className="fill-accent" />
            </svg>
          </div>
        </div>

        {/* Share Link Banner */}
        <div className="p-3.5 rounded-xl border border-hairline bg-paper/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted truncate">
            <span className="text-[10px] uppercase tracking-wider text-accent">
              share link:
            </span>
            <span className="text-ink truncate">/wish/{wish.code}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-paper hover:border-ink text-ink text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>copy link</span>
              </>
            )}
          </button>
        </div>

        {/* Card Actions */}
        <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadLetterAsPng(wish)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>download card</span>
            </button>

            <button
              type="button"
              onClick={() => shareLetterAsPng(wish)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>share card</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-hairline bg-paper text-muted hover:text-ink text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span>whatsapp</span>
          </button>
        </div>
      </article>

      {/* Prompts to Write / Explore */}
      <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <Link
          href="/wishes#write"
          className="inline-flex items-center gap-2 text-ink hover:text-accent transition-colors font-medium"
        >
          <PenLine className="w-4 h-4 text-accent" />
          <span>write your own wish to samkiel →</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>explore journal & story</span>
        </Link>
      </div>
    </div>
  );
}

