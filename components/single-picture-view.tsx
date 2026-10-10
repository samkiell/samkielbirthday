"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PictureItem } from "@/lib/pictures-data";
import { ArrowLeft, Download, Share2, MessageCircle, Copy, Loader2, Heart } from "lucide-react";

interface SinglePictureViewProps {
  pic: PictureItem;
}

export function SinglePictureView({ pic }: SinglePictureViewProps) {
  const [sharing, setSharing] = useState(false);
  const [waSharing, setWaSharing] = useState(false);

  const handleDownload = async () => {
    const filename = pic.filename;
    const cleanName = pic.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const ext = filename.split(".").pop() || "jpg";
    const downloadName = `samkiel-20-${cleanName}.${ext}`;

    try {
      const src = `/pictures/${encodeURIComponent(filename)}`;
      const res = await fetch(src);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("picture downloaded");
    } catch {
      const a = document.createElement("a");
      a.href = `/pictures/${encodeURIComponent(filename)}`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);

    const shareUrl = `${window.location.origin}/pictures/${pic.id}`;
    const cleanTitle = pic.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const shareImgSrc = `/share-images/${pic.id}.jpg`;

    try {
      let file: File | null = null;
      try {
        const res = await fetch(shareImgSrc);
        if (res.ok) {
          const blob = await res.blob();
          file = new File([blob], `samkiel-${cleanTitle}.jpg`, { type: "image/jpeg" });
        }
      } catch {
        // Fallback to text
      }

      if (file && typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `samkiel turns 20 · ${pic.title}`,
            text: `celebrating samkiel's 20th birthday: two decades in. still dey on motion.\n${shareUrl}`,
          });
          return;
        } catch (shareErr: unknown) {
          if ((shareErr as { name?: string })?.name === "AbortError") {
            return;
          }
        }
      }

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: `samkiel turns 20 · ${pic.title}`,
            text: `celebrating samkiel's 20th birthday: two decades in. still dey on motion.`,
            url: shareUrl,
          });
          return;
        } catch (shareErr: unknown) {
          if ((shareErr as { name?: string })?.name === "AbortError") {
            return;
          }
        }
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("picture link copied to clipboard");
    } catch {
      toast.error("could not share picture");
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsApp = async () => {
    if (waSharing) return;
    setWaSharing(true);

    const shareUrl = `${window.location.origin}/pictures/${pic.id}`;
    const cleanTitle = pic.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const shareImgSrc = `/share-images/${pic.id}.jpg`;

    try {
      const res = await fetch(shareImgSrc);
      let file: File | null = null;
      let blob: Blob | null = null;
      if (res.ok) {
        blob = await res.blob();
        file = new File([blob], `samkiel-${cleanTitle}.jpg`, { type: "image/jpeg" });
      }

      // Mobile: Native share sheet with real image attached
      if (file && typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `samkiel turns 20 · ${pic.title}`,
            text: `celebrating samkiel's 20th birthday: two decades in. still dey on motion.\n${shareUrl}`,
          });
          return;
        } catch (shareErr: unknown) {
          if ((shareErr as { name?: string })?.name === "AbortError") {
            return;
          }
        }
      }

      // Desktop: Copy image to clipboard so Ctrl+V pastes directly into WhatsApp Web
      if (blob && typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
        try {
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 1200;
          canvas.height = img.naturalHeight || 1200;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            await new Promise<void>((resolve) => {
              canvas.toBlob(async (pngBlob) => {
                if (pngBlob) {
                  try {
                    await navigator.clipboard.write([
                      new ClipboardItem({ "image/png": pngBlob }),
                    ]);
                    toast.success("Photo copied to clipboard! Paste (Ctrl+V) directly in WhatsApp", {
                      duration: 6000,
                    });
                  } catch {
                    // Clipboard write failed
                  }
                }
                resolve();
              }, "image/png");
            });
          }
        } catch {
          // Ignore
        }
      }

      const waText = encodeURIComponent(
        `celebrating samkiel's 20th birthday! check out this photo: ${shareUrl}`
      );
      window.open(`https://wa.me/?text=${waText}`, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("could not open whatsapp");
    } finally {
      setWaSharing(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/pictures/${pic.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("link copied to clipboard");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/pictures#${pic.id}`}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>all pictures</span>
        </Link>
        <span className="text-xs font-mono text-muted uppercase tracking-wider">
          {pic.id}
        </span>
      </div>

      <div className="rounded-2xl border border-hairline overflow-hidden bg-paper/80 shadow-sm backdrop-blur-xs">
        <div className="relative aspect-[4/5] sm:aspect-[16/10] w-full bg-black/5 dark:bg-black/30">
          <Image
            src={`/pictures/${encodeURIComponent(pic.filename)}`}
            alt={pic.title}
            fill
            priority
            quality={100}
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-contain"
          />
        </div>

        <div className="p-5 sm:p-7 space-y-5 border-t border-hairline">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted">
              Chapter 20 Archive
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-normal text-ink mt-1">
              {pic.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={waSharing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono font-medium transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
            >
              {waSharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              <span>{waSharing ? "preparing image..." : "share to whatsapp"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-hairline hover:border-ink/30 bg-paper hover:bg-hairline/20 text-ink text-xs font-mono transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {sharing ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <Share2 className="w-4 h-4 text-accent" />
              )}
              <span>{sharing ? "attaching..." : "share photo"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-hairline hover:border-ink/30 bg-paper hover:bg-hairline/20 text-ink text-xs font-mono transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>download</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-hairline hover:border-ink/30 bg-paper hover:bg-hairline/20 text-ink text-xs font-mono transition-all cursor-pointer active:scale-98"
              title="Copy photo link"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">copy link</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-hairline text-xs font-mono text-muted">
        <Link
          href="/pictures"
          className="hover:text-ink transition-colors underline underline-offset-4"
        >
          ← view all 19 pictures
        </Link>
        <Link
          href="/wishes"
          className="hover:text-ink transition-colors inline-flex items-center gap-1.5"
        >
          <Heart className="w-3.5 h-3.5 text-accent" />
          <span>write samkiel a birthday wish →</span>
        </Link>
      </div>
    </div>
  );
}
