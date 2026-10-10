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
  Shuffle,
} from "lucide-react";

interface PictureItem {
  id: string;
  filename: string;
  title: string;
}

const ALL_PICTURES: PictureItem[] = [
  { id: "pic-01", filename: "samkielbday01.jpg", title: "Two decades in portrait" },
  { id: "pic-02", filename: "samkielbday02.jpg", title: "Chapter 20 portrait" },
  { id: "pic-03", filename: "samkielbday03.jpg", title: "Reflections" },
  { id: "pic-04", filename: "samkielbday04.jpg", title: "Still becoming" },
  { id: "pic-05", filename: "samkielbday05.jpg", title: "Growth" },
  { id: "pic-06", filename: "samkielbday06.jpg", title: "On campus" },
  { id: "pic-07", filename: "samkielbday07.jpg", title: "Quiet focus" },
  { id: "pic-08", filename: "samkielbday08.jpg", title: "Moments" },
  { id: "pic-09", filename: "samkielbday09.jpg", title: "Memories" },
  { id: "pic-10", filename: "samkielbday10.jpg", title: "Dev community & events" },
  { id: "pic-11", filename: "samkielbday11.jpg", title: "CS conference" },
  { id: "pic-12", filename: "samkielbday12.jpg", title: "GDG web sessions" },
  { id: "pic-13", filename: "samkielbday13.jpg", title: "Hackathon & building" },
  { id: "pic-14", filename: "samkielbday14.jpg", title: "Collaborating" },
  { id: "pic-15", filename: "samkielbday15.jpg", title: "Community spaces" },
  { id: "pic-16", filename: "samkielbday16.jpg", title: "Milestones" },
  { id: "pic-17", filename: "samkielbday17.jpg", title: "Walks & talks" },
  { id: "pic-18", filename: "samkielbday18.jpg", title: "Late night coding" },
  { id: "pic-19", filename: "samkielbday19.jpg", title: "Building momentum" },
  { id: "pic-20", filename: "samkielbday20.jpg", title: "Flashback" },
  { id: "pic-21", filename: "samkielbday21.png", title: "Milestone moment" },
  { id: "pic-22", filename: "samkielbday22.jpg", title: "Casual memories" },
  { id: "pic-23", filename: "samkielbday23.jpg", title: "Smiles along the way" },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PicturesPage() {
  const [pictures, setPictures] = useState<PictureItem[]>(ALL_PICTURES);
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePhoto =
    lightboxIndex !== null ? pictures[lightboxIndex] : null;

  const handleShuffle = useCallback(() => {
    setPictures((prev) => shuffleArray(prev));
  }, []);

  // Shuffle photos on every load / visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setPictures(shuffleArray(ALL_PICTURES));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async (pic: PictureItem) => {
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
      toast.success("Picture downloaded");
    } catch {
      const a = document.createElement("a");
      a.href = `/pictures/${encodeURIComponent(filename)}`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
      setLightboxIndex((lightboxIndex + 1) % pictures.length);
    }
  }, [lightboxIndex, pictures.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + pictures.length) % pictures.length
      );
    }
  }, [lightboxIndex, pictures.length]);

  // Lock body scroll when viewing full-screen photo
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
              A visual archive of the journey into Chapter 20. Tap any photo to view in full screen, download, or share.
            </p>
          </div>

          {/* Controls: Shuffle & View Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleShuffle}
              title="Shuffle photo order"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-paper text-xs font-mono tracking-wider text-muted hover:text-ink hover:border-ink transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5 text-accent" />
              <span>Shuffle</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-lg border border-hairline bg-paper">
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
      </div>

      {/* Grid Mode (Thumbnails, tap to expand big) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {pictures.map((pic, idx) => {
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
                  quality={90}
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
          {pictures.map((pic, idx) => {
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
                    quality={95}
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
                    <button
                      type="button"
                      onClick={() => handleDownload(pic)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        data-track="picture_share"
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

      {/* Full-Screen Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxIndex(null);
            }
          }}
        >
          {/* Top Bar with Title, Download Button, and Close X Button */}
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full px-2 pt-1 pb-2">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono tracking-wider text-white/60 uppercase">
                {lightboxIndex + 1} / {pictures.length}
              </span>
              <h2 className="text-sm sm:text-base font-serif font-medium text-white truncate max-w-[180px] sm:max-w-md">
                {activePhoto.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Prominent Download Button */}
              <button
                type="button"
                onClick={() => handleDownload(activePhoto)}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-mono uppercase tracking-wider border border-white/20 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Download photo"
              >
                <Download className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Prominent Close X Button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close full screen view"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer active:scale-95"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center: Full-Screen Image Container */}
          <div
            className="relative flex-1 flex items-center justify-center w-full my-2 sm:my-3"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setLightboxIndex(null);
              }
            }}
          >
            {/* Previous Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Previous photo (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo */}
            <div className="relative w-full h-[70vh] sm:h-[78vh] md:h-[82vh] max-w-5xl">
              <Image
                src={`/pictures/${encodeURIComponent(activePhoto.filename)}`}
                alt={activePhoto.title}
                fill
                priority
                quality={100}
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Next photo (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Bar: Action options */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto w-full text-white text-xs font-mono pb-2">
            <button
              type="button"
              onClick={() => handleDownload(activePhoto)}
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Download</span>
            </button>

            <button
              type="button"
              data-track="picture_share"
              onClick={() => handleShare(activePhoto)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <a
              href={getWhatsAppLink(activePhoto)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#4ADE80] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopyLink(activePhoto)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Copy photo link"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
