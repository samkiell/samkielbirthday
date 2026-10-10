"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Download, Share2, MessageCircle } from "lucide-react";

interface PictureItem {
  id: string;
  filename: string;
  title: string;
  caption?: string;
}

const PICTURES: PictureItem[] = [
  {
    id: "pic-1",
    filename: "20260911_120118.jpg",
    title: "Moments in the journey",
  },
  {
    id: "pic-2",
    filename: "20260911_120358.jpg",
    title: "Reflecting",
  },
  {
    id: "pic-3",
    filename: "20260911_120533.jpg",
    title: "Chapter 20",
  },
  {
    id: "pic-4",
    filename: "20260911_120610.jpg",
    title: "On campus and beyond",
  },
  {
    id: "pic-5",
    filename: "20260911_120627.jpg",
    title: "Quiet confidence",
  },
  {
    id: "pic-6",
    filename: "20260911_120741.jpg",
    title: "Another year older",
  },
  {
    id: "pic-7",
    filename: "IMG_20260705_214842_677.jpg",
    title: "Memories",
  },
  {
    id: "pic-8",
    filename: "sheraton 1.jpg",
    title: "Dev events & community",
  },
  {
    id: "pic-9",
    filename: "cscon1.jpg",
    title: "Conference days",
  },
  {
    id: "pic-10",
    filename: "gdg web series .jpg",
    title: "GDG sessions",
  },
  {
    id: "pic-11",
    filename: "phenix 1.jpg",
    title: "Building",
  },
  {
    id: "pic-12",
    filename: "ssoh1.jpg",
    title: "Growth",
  },
];

export default function PicturesPage() {
  const handleShare = async (pic: PictureItem) => {
    const shareUrl = `${window.location.origin}/pictures#${pic.id}`;
    const shareData = {
      title: `samkiel turns 20 · ${pic.title}`,
      text: `Celebrating samkiel's 20th birthday: Another Year. Another Chapter.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Picture link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const getWhatsAppLink = (pic: PictureItem) => {
    const text = encodeURIComponent(
      `Celebrating samkiel's 20th birthday! Check this picture out: https://birthday.samkiel.dev/pictures#${pic.id}`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-hairline pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to journal</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-ink">
          Birthday Pictures
        </h1>
        <p className="text-muted text-sm sm:text-base font-serif italic max-w-xl">
          A glimpse into the journey. Download or share with friends on WhatsApp.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {PICTURES.map((pic) => {
          const encodedSrc = `/pictures/${encodeURIComponent(pic.filename)}`;
          return (
            <article
              key={pic.id}
              id={pic.id}
              className="group rounded-xl border border-hairline overflow-hidden bg-paper/60 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-hairline/20">
                <Image
                  src={encodedSrc}
                  alt={`samkiel birthday picture: ${pic.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-102"
                  loading="lazy"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="text-sm font-medium text-ink truncate">
                  {pic.title}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-hairline/60">
                  <a
                    href={encodedSrc}
                    download={`samkiel-20-${pic.id}.jpg`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
                    title="Download image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleShare(pic)}
                      className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-ink transition-colors cursor-pointer"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <a
                      href={getWhatsAppLink(pic)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-[#25D366] transition-colors"
                      title="Share on WhatsApp"
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
    </div>
  );
}
