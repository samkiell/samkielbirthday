"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Share2,
  MessageCircle,
  LayoutGrid,
  Square,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";

interface PictureItem {
  id: string;
  filename: string;
  title: string;
}

const ALL_PICTURES: PictureItem[] = [
  { id: "pic-01", filename: "chowdeck 1.jpg", title: "Chapter 20 portrait" },
  { id: "pic-02", filename: "20260911_120118.jpg", title: "Reflections" },
  { id: "pic-03", filename: "20260911_120358.jpg", title: "Still becoming" },
  { id: "pic-04", filename: "20260911_120533.jpg", title: "Growth" },
  { id: "pic-05", filename: "20260911_120610.jpg", title: "On campus" },
  { id: "pic-06", filename: "20260911_120627.jpg", title: "Quiet focus" },
  { id: "pic-07", filename: "20260911_120741.jpg", title: "Moments" },
  { id: "pic-08", filename: "IMG_20260705_214842_677.jpg", title: "Memories" },
  { id: "pic-09", filename: "sheraton 1.jpg", title: "Dev community & events" },
  { id: "pic-10", filename: "cscon1.jpg", title: "CS conference" },
  { id: "pic-11", filename: "gdg web series .jpg", title: "GDG web sessions" },
  { id: "pic-12", filename: "phenix 1.jpg", title: "Hackathon & building" },
  { id: "pic-13", filename: "phenix 2.jpg", title: "Collaborating" },
  { id: "pic-14", filename: "ssoh1.jpg", title: "Community spaces" },
  { id: "pic-15", filename: "sucf 1.jpg", title: "Milestones" },
  { id: "pic-16", filename: "IMG-20260901-WA0371.jpg", title: "Walks & talks" },
  { id: "pic-17", filename: "IMG_20260905_003015_099.jpg", title: "Late night coding" },
  { id: "pic-18", filename: "lv_0_20260905090751.jpg", title: "Building momentum" },
  { id: "pic-19", filename: "IMG_20240201_182625_630.jpg", title: "Flashback" },
  { id: "pic-20", filename: "file_000000006c8481f4b1cfae34ba9e4d51.png", title: "Milestone moment" },
  { id: "pic-21", filename: "Snapchat-1652575318.jpg", title: "Casual memories" },
  { id: "pic-22", filename: "Snapchat-372889542.jpg", title: "Smiles along the way" },
];

export default function PicturesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePhoto =
    lightboxIndex !== null ? ALL_PICTURES[lightboxIndex] : null;

  const handleShare = async (pic: PictureItem) => {
    const shareUrl = `${window.location.origin}/pictures#${pic.id}`;
    const shareData = {
      title: `samkiel turns 20 · ${pic.title}`,
      text: `Celebrating samkiel's 20th birthday: Two Decades In. Still Becoming.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if dismissed
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Picture link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleCopyLink = (pic: PictureItem) => {
    const shareUrl = `${window.location.origin}/pictures#${pic.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const getWhatsAppLink = (pic: PictureItem) => {
    const text = encodeURIComponent(
      `Celebrating samkiel's 20th birthday! Check out this picture: https://birthday.samkiel.dev/pictures#${pic.id}`
    );
    return `https://wa.me/?text=${text}`;
  };

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % ALL_PICTURES.length);
    }
  }, [lightboxIndex]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + ALL_PICTURES.length) % ALL_PICTURES.length
      );
    }
  }, [lightboxIndex]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-hairline pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to journal</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-ink">
              Birthday Pictures
            </h1>
            <p className="text-muted text-sm sm:text-base font-serif italic max-w-xl">
              A visual archive of the journey into Chapter 20. Tap any photo to expand, download, or share across your favorite apps.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-hairline bg-paper self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-accent text-paper font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("large")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "large"
                  ? "bg-accent text-paper font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Large</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode (Thumbnails, tap to expand big) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {ALL_PICTURES.map((pic, idx) => {
            const encodedSrc = `/pictures/${encodeURIComponent(pic.filename)}`;
            return (
              <div
                key={pic.id}
                id={pic.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square rounded-lg border border-hairline overflow-hidden bg-hairline/20 cursor-pointer shadow-2xs hover:border-accent transition-all"
              >
                <Image
                  src={encodedSrc}
                  alt={pic.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2.5">
                  <span className="text-[11px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity truncate drop-shadow-xs">
                    {pic.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Large Feed Mode (Full card views) */}
      {viewMode === "large" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ALL_PICTURES.map((pic, idx) => {
            const encodedSrc = `/pictures/${encodeURIComponent(pic.filename)}`;
            return (
              <article
                key={pic.id}
                id={pic.id}
                className="group rounded-xl border border-hairline overflow-hidden bg-paper/70 flex flex-col justify-between shadow-2xs"
              >
                <div
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-hairline/20 cursor-pointer"
                >
                  <Image
                    src={encodedSrc}
                    alt={pic.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-102"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="text-sm font-medium text-ink">
                    {pic.title}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-hairline/60">
                    <a
                      href={encodedSrc}
                      download={`samkiel-20-${pic.id}.jpg`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleShare(pic)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>

                      <a
                        href={getWhatsAppLink(pic)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-[#25D366] transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal (Show Big Big) */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white/80 max-w-5xl mx-auto w-full">
            <span className="text-xs font-mono tracking-wider">
              {lightboxIndex + 1} / {ALL_PICTURES.length} · {activePhoto.title}
            </span>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo view"
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Main Image with Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center max-w-4xl mx-auto w-full my-3">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 sm:-left-12 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Expanded Image */}
            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src={`/pictures/${encodeURIComponent(activePhoto.filename)}`}
                alt={activePhoto.title}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 sm:-right-12 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto w-full text-white text-xs font-mono">
            <a
              href={`/pictures/${encodeURIComponent(activePhoto.filename)}`}
              download={`samkiel-20-${activePhoto.id}.jpg`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={() => handleShare(activePhoto)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-paper hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <a
              href={getWhatsAppLink(activePhoto)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(activePhoto)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
              title="Copy photo link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
