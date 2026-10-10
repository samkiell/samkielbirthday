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
      toast.success("Letter link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `Read this letter from ${wish.name} for samkiel at 20: "${wish.message}"\n\n${url}`
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
          <span>All letters</span>
        </Link>

        <span className="text-[11px] font-mono tracking-wider text-muted">
          /wish/{wish.code}
        </span>
      </div>

      {/* Main Letter Card */}
      <article className="relative p-7 sm:p-10 rounded-2xl border border-hairline bg-paper/85 backdrop-blur-xs shadow-lg space-y-8">
        {/* Card Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline/80 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent font-semibold">
              Chapter 20 · Personal Letter
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
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

        {/* Letter Body */}
        <div className="py-2">
          <p className="font-serif text-lg sm:text-2xl text-ink leading-relaxed italic whitespace-pre-wrap">
            &ldquo;{wish.message}&rdquo;
          </p>
        </div>

        {/* Share Link Banner */}
        <div className="p-3.5 rounded-xl border border-hairline bg-paper/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted truncate">
            <span className="text-[10px] uppercase tracking-wider text-accent">
              Share Link:
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
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>Copy link</span>
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
              <span>Download card</span>
            </button>

            <button
              type="button"
              onClick={() => shareLetterAsPng(wish)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share card</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-hairline bg-paper text-muted hover:text-ink text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span>WhatsApp</span>
          </button>
        </div>
      </article>

      {/* Prompts to Write / Explore */}
      <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <Link
          href="/wishes"
          className="inline-flex items-center gap-2 text-ink hover:text-accent transition-colors font-medium"
        >
          <PenLine className="w-4 h-4 text-accent" />
          <span>Write your own letter to samkiel →</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore journal & story</span>
        </Link>
      </div>
    </div>
  );
}
