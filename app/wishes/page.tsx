"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";
import { RELATIONSHIP_OPTIONS, WishResponse } from "@/types/wishes";
import {
  ArrowLeft,
  PenLine,
  Sparkles,
  Send,
  Loader2,
  X,
  Check,
  Download,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { downloadLetterAsPng, shareLetterAsPng } from "@/lib/letter-card-generator";
import { formatWishDateTime } from "@/lib/format-date";

export default function WishesPage() {
  const [wishes, setWishes] = useState<WishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedWish, setSelectedWish] = useState<WishResponse | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [createdWish, setCreatedWish] = useState<WishResponse | null>(null);

  const maxMessageLen = 280;

  const fetchWishes = async () => {
    try {
      const res = await fetch("/api/wishes?page=1&limit=50");
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes);
      }
    } catch (err) {
      console.error("Error loading wishes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("name is required");
      return;
    }
    if (!message.trim()) {
      toast.error("message is required");
      return;
    }

    setSubmitting(true);
    try {
      const finalRelationship =
        relationship.toLowerCase() === "other"
          ? customRelationship.trim()
            ? customRelationship.trim().toLowerCase()
            : "other"
          : relationship;

      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          relationship: finalRelationship || undefined,
          honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "could not post your wish");
        setSubmitting(false);
        return;
      }

      toast.success("thank you. your wish is on the wall.");
      triggerConfetti();

      // Reset
      setName("");
      setMessage("");
      setRelationship("");
      setCustomRelationship("");
      setHoneypot("");
      setCreatedWish(data);
      setSentSuccess(true);

      // Add to state
      setWishes((prev) => [data, ...prev]);
    } catch {
      toast.error("failed to connect. please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWishes =
    activeFilter === "all"
      ? wishes
      : wishes.filter((w) => {
          if (!w.relationship) return false;
          const rel = w.relationship.toLowerCase();
          if (activeFilter === "other") {
            const standard = ["family", "friend", "colleague", "fellow developer"];
            return (
              rel === "other" ||
              rel.startsWith("other:") ||
              rel.startsWith("other (") ||
              !standard.includes(rel)
            );
          }
          return rel === activeFilter.toLowerCase();
        });

  return (
    <div className="min-h-screen pb-12 sm:pb-24">
      {/* Top Banner / Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 space-y-6 border-b border-hairline">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>back to journal</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="#write"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-2xs"
            >
              <PenLine className="w-3 h-3" />
              <span>leave a wish</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>wishes for chapter 20</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl text-ink font-normal">
              the birthday wall
            </h1>
            <p className="text-muted text-sm sm:text-base font-serif italic max-w-xl">
              a living archive of notes, memories, advice, and prayers sent to samkiel as he turns 20.
            </p>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          {["all", ...RELATIONSHIP_OPTIONS].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setActiveFilter(opt)}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === opt
                  ? "bg-ink text-paper font-medium"
                  : "border border-hairline text-muted hover:text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas: The Floating Wall */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted text-xs font-mono">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span>gathering wishes on the wall...</span>
          </div>
        ) : filteredWishes.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="font-serif italic text-lg text-muted">
              no wishes yet in this section. be the first to leave one below.
            </p>
            <a
              href="#write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>write the first wish</span>
            </a>
          </div>
        ) : (
          /* Floating Wall Layout - spacious, unclustered 2-column distribution */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-14 items-start max-w-5xl mx-auto">
            {filteredWishes.map((w, idx) => {
              const isAlt = idx % 2 === 1;
              const rotation =
                idx % 4 === 0
                  ? "rotate-[0.6deg]"
                  : idx % 4 === 1
                  ? "-rotate-[0.8deg]"
                  : idx % 4 === 2
                  ? "rotate-[0.8deg]"
                  : "-rotate-[0.6deg]";

              return (
                <article
                  key={w.id}
                  onClick={() => setSelectedWish(w)}
                  className={`group relative p-7 sm:p-8 rounded-2xl border border-hairline bg-paper/90 backdrop-blur-xs transition-all duration-300 hover:border-accent hover:shadow-xl cursor-pointer ${
                    isAlt ? "animate-float-alt" : "animate-float-slow"
                  } ${rotation}`}
                  style={{ animationDelay: `${(idx % 4) * 1.2}s` }}
                >
                  {/* Subtle pin mark indicator */}
                  <div className="w-2.5 h-2.5 rounded-full border border-hairline bg-accent/30 mx-auto -mt-2.5 mb-5 group-hover:bg-accent transition-colors" />

                  <p className="text-ink text-base sm:text-lg leading-relaxed whitespace-pre-wrap line-clamp-6 font-editorial italic">
                    &ldquo;{w.message}&rdquo;
                  </p>

                  <div className="mt-6 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-ink">
                        {w.name}
                      </span>
                      {w.relationship && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-hairline bg-paper">
                          {w.relationship}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <time dateTime={w.createdAt} suppressHydrationWarning>
                        {formatWishDateTime(w.createdAt, { short: true })}
                      </time>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadLetterAsPng(w);
                        }}
                        title="Download card as PNG"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareLetterAsPng(w);
                        }}
                        title="Share wish"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Write a Birthday Wish Form Section */}
      <section
        id="write"
        className="max-w-2xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-hairline"
      >
        <div className="space-y-3 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            <PenLine className="w-3.5 h-3.5" />
            <span>your personal wish</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            send your birthday wish to samkiel
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            write your own words, a memory from our days together, words of advice, a prayer, or birthday wishes. it will be preserved on this wall.
          </p>
        </div>

        {sentSuccess ? (
          <div className="p-8 sm:p-12 rounded-2xl border border-hairline bg-paper/80 shadow-xs text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-accent-soft border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                thanks for the wishes!
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                thank you for contributing to chapter 20. your wish is now preserved and has a unique share link.
              </p>
            </div>

            {createdWish?.code && (
              <div className="max-w-md mx-auto p-4 rounded-xl border border-hairline bg-paper flex items-center justify-between gap-3 text-xs font-mono">
                <span className="text-muted truncate">
                  /wish/{createdWish.code}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/wish/${createdWish.code}`;
                      navigator.clipboard.writeText(url);
                      toast.success("wish link copied");
                    }}
                    className="px-2.5 py-1 rounded border border-hairline hover:border-ink text-ink text-[11px] uppercase transition-colors cursor-pointer"
                  >
                    copy link
                  </button>
                  <Link
                    href={`/wish/${createdWish.code}`}
                    className="px-2.5 py-1 rounded bg-accent text-paper text-[11px] uppercase transition-colors"
                  >
                    open card
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSentSuccess(false);
                  setCreatedWish(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs"
              >
                <PenLine className="w-3.5 h-3.5 text-accent" />
                <span>send another wish</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl border border-hairline bg-paper/80 shadow-xs space-y-6"
          >
          {/* Honeypot field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp-website">Website</label>
            <input
              id="hp-website"
              type="text"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="author-name"
                className="block text-xs font-mono uppercase tracking-wider text-muted"
              >
                your name <span className="text-accent">*</span>
              </label>
              <input
                id="author-name"
                type="text"
                required
                maxLength={60}
                placeholder="e.g. tobi or a classmate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-xs font-mono uppercase tracking-wider text-muted"
              >
                relationship <span className="text-muted/60 text-[10px]">(optional)</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {RELATIONSHIP_OPTIONS.map((opt) => {
                  const isSelected = relationship.toLowerCase() === opt.toLowerCase();
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRelationship("");
                          setCustomRelationship("");
                        } else {
                          setRelationship(opt);
                          if (opt !== "other") {
                            setCustomRelationship("");
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? "bg-accent text-paper font-semibold shadow-2xs"
                          : "border border-hairline bg-paper/60 text-muted hover:text-ink hover:border-accent/40 hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {relationship.toLowerCase() === "other" && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
                  <input
                    type="text"
                    maxLength={40}
                    autoFocus
                    placeholder="specify your relationship (e.g. mentor, church, sibling)..."
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-accent bg-paper text-ink text-xs font-mono placeholder:text-muted/60 focus:ring-1 focus:ring-accent outline-none transition-colors"
                    aria-label="Specify other relationship"
                  />
                  <p className="text-[10px] font-mono text-muted">
                    manually type how you know samkiel above
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="wish-content"
                className="block text-xs font-mono uppercase tracking-wider text-muted"
              >
                your wish <span className="text-accent">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  message.length > 260 ? "text-red-500 font-semibold" : "text-muted"
                }`}
              >
                {message.length} / {maxMessageLen}
              </span>
            </div>
            <textarea
              id="wish-content"
              required
              rows={4}
              maxLength={maxMessageLen}
              placeholder="dear samkiel, write your birthday wish, memory, advice, or prayer here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-paper text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>placing on wall...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>place wish on wall</span>
              </>
            )}
          </button>
        </form>
        )}
      </section>

      {/* Expanded Wish Reader Modal */}
      {selectedWish && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="relative max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-hairline bg-paper text-ink shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="space-y-0.5">
                <div className="font-serif text-lg font-medium text-ink">
                  {selectedWish.name}
                </div>
                {selectedWish.relationship && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                    {selectedWish.relationship}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedWish(null)}
                aria-label="Close wish"
                className="p-1.5 rounded-full hover:bg-hairline/40 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-editorial text-base sm:text-xl text-ink/90 leading-relaxed whitespace-pre-wrap italic">
              &ldquo;{selectedWish.message}&rdquo;
            </p>

            {/* Share Link Banner */}
            <div className="p-3 rounded-xl border border-hairline bg-paper/60 flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-muted truncate">
                /wish/{selectedWish.code}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/wish/${selectedWish.code}`;
                    navigator.clipboard.writeText(url);
                    toast.success("wish link copied");
                  }}
                  className="px-2.5 py-1 rounded border border-hairline hover:border-ink text-ink text-[11px] uppercase transition-colors cursor-pointer"
                >
                  copy link
                </button>
                <Link
                  href={`/wish/${selectedWish.code}`}
                  className="px-2.5 py-1 rounded bg-accent text-paper text-[11px] uppercase transition-colors"
                >
                  open page
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="text-muted">
                <span>wish for chapter 20 · </span>
                <time dateTime={selectedWish.createdAt} suppressHydrationWarning>
                  {formatWishDateTime(selectedWish.createdAt)}
                </time>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadLetterAsPng(selectedWish)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-2xs"
                  title="Download card as PNG"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>download card</span>
                </button>

                <button
                  type="button"
                  onClick={() => shareLetterAsPng(selectedWish)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer shadow-2xs"
                  title="Share wish card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
