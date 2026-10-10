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
  LayoutGrid,
  Waves,
  Check,
  Download,
  Share2,
} from "lucide-react";
import { downloadLetterAsPng, shareLetterAsPng } from "@/lib/letter-card-generator";

export default function WishesPage() {
  const [wishes, setWishes] = useState<WishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"floating" | "grid">("floating");
  const [selectedWish, setSelectedWish] = useState<WishResponse | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

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
      toast.error("Please enter your name");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write your letter");
      return;
    }

    setSubmitting(true);
    try {
      const finalRelationship =
        relationship === "Other"
          ? customRelationship.trim()
            ? `Other: ${customRelationship.trim()}`
            : "Other"
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
        toast.error(data.error || "Could not post your letter");
        setSubmitting(false);
        return;
      }

      toast.success("Thank you. Your letter is on the wall!");
      triggerConfetti();

      // Reset
      setName("");
      setMessage("");
      setRelationship("");
      setCustomRelationship("");
      setHoneypot("");
      setSentSuccess(true);

      // Add to state
      setWishes((prev) => [data, ...prev]);
    } catch {
      toast.error("Failed to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWishes =
    activeFilter === "All"
      ? wishes
      : wishes.filter((w) => {
          if (!w.relationship) return false;
          if (activeFilter === "Other") {
            return (
              w.relationship === "Other" ||
              w.relationship.startsWith("Other:") ||
              w.relationship.startsWith("Other (")
            );
          }
          return w.relationship === activeFilter;
        });

  return (
    <div className="min-h-screen pb-24">
      {/* Top Banner / Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-8 space-y-6 border-b border-hairline">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to journal</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="#write"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-2xs"
            >
              <PenLine className="w-3 h-3" />
              <span>Write a Letter</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Letters for Chapter 20</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl text-ink font-normal">
              The Birthday Wall
            </h1>
            <p className="text-muted text-sm sm:text-base font-serif italic max-w-xl">
              A living archive of notes, memories, advice, and prayers sent to samkiel as he turns 20.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-hairline bg-paper self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("floating")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "floating"
                  ? "bg-accent text-paper font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Floating</span>
            </button>
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
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          {["All", ...RELATIONSHIP_OPTIONS].map((opt) => (
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
            <span>Gathering letters on the wall...</span>
          </div>
        ) : filteredWishes.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="font-serif italic text-lg text-muted">
              No letters yet in this section. Be the first to leave one below.
            </p>
            <a
              href="#write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write the first letter</span>
            </a>
          </div>
        ) : viewMode === "floating" ? (
          /* Floating Wall Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {filteredWishes.map((w, idx) => {
              // Staggered float animation and subtle rotations
              const isAlt = idx % 2 === 1;
              const rotation =
                idx % 4 === 0
                  ? "rotate-0.5"
                  : idx % 4 === 1
                  ? "-rotate-1"
                  : idx % 4 === 2
                  ? "rotate-1"
                  : "-rotate-0.5";

              return (
                <article
                  key={w.id}
                  onClick={() => setSelectedWish(w)}
                  className={`group relative p-6 rounded-2xl border border-hairline bg-paper/90 backdrop-blur-xs transition-all duration-300 hover:border-accent hover:shadow-lg cursor-pointer ${
                    isAlt ? "animate-float-alt" : "animate-float-slow"
                  } ${rotation}`}
                  style={{ animationDelay: `${(idx % 5) * 0.8}s` }}
                >
                  {/* Pin mark indicator */}
                  <div className="w-2.5 h-2.5 rounded-full border border-hairline bg-accent/30 mx-auto -mt-2 mb-4 group-hover:bg-accent transition-colors" />

                  <p className="text-ink text-sm sm:text-base leading-relaxed whitespace-pre-wrap line-clamp-6 font-serif">
                    &ldquo;{w.message}&rdquo;
                  </p>

                  <div className="mt-5 pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-muted">
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
                      <time dateTime={w.createdAt}>
                        {new Date(w.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadLetterAsPng(w);
                        }}
                        title="Download letter as PNG"
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
                        title="Share letter"
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
        ) : (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredWishes.map((w) => (
              <article
                key={w.id}
                onClick={() => setSelectedWish(w)}
                className="p-5 rounded-xl border border-hairline bg-paper/70 hover:border-accent transition-all cursor-pointer flex flex-col justify-between gap-4"
              >
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap font-serif">
                  &ldquo;{w.message}&rdquo;
                </p>

                <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-xs font-mono text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-medium text-ink">
                      {w.name}
                    </span>
                    {w.relationship && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-hairline bg-paper">
                        {w.relationship}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <time dateTime={w.createdAt}>
                      {new Date(w.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadLetterAsPng(w);
                      }}
                      title="Download letter as PNG"
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
                      title="Share letter"
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Write a Letter Form Section */}
      <section
        id="write"
        className="max-w-2xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-hairline"
      >
        <div className="space-y-3 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            <PenLine className="w-3.5 h-3.5" />
            <span>Your Personal Message</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            Write your letter to samkiel
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Write your own words, a memory from our days together, words of advice, a prayer, or birthday wishes. It will be preserved on this wall.
          </p>
        </div>

        {sentSuccess ? (
          <div className="p-8 sm:p-12 rounded-2xl border border-hairline bg-paper/80 shadow-xs text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-accent-soft border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                Letter placed on the wall
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                Thank you for contributing to Chapter 20. Your note is now preserved on the wall.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs"
              >
                <PenLine className="w-3.5 h-3.5 text-accent" />
                <span>Send another letter</span>
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
                Your name <span className="text-accent">*</span>
              </label>
              <input
                id="author-name"
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Tobi or A classmate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="author-relationship"
                className="block text-xs font-mono uppercase tracking-wider text-muted"
              >
                Relationship <span className="text-muted/60 text-[10px]">(optional)</span>
              </label>
              <select
                id="author-relationship"
                value={relationship}
                onChange={(e) => {
                  setRelationship(e.target.value);
                  if (e.target.value !== "Other") {
                    setCustomRelationship("");
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors cursor-pointer"
              >
                <option value="">Select how you know me</option>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {relationship === "Other" && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="Please specify (e.g. Mentor, Secondary school, Church)..."
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    aria-label="Specify other relationship"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="letter-content"
                className="block text-xs font-mono uppercase tracking-wider text-muted"
              >
                Your letter <span className="text-accent">*</span>
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
              id="letter-content"
              required
              rows={4}
              maxLength={maxMessageLen}
              placeholder="Dear samkiel, write your letter, memory, advice, or birthday wish here..."
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
                <span>Placing on wall...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Place letter on wall</span>
              </>
            )}
          </button>
        </form>
        )}
      </section>

      {/* Expanded Letter Reader Modal */}
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
                aria-label="Close letter"
                className="p-1.5 rounded-full hover:bg-hairline/40 text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-serif text-base sm:text-lg text-ink/90 leading-relaxed whitespace-pre-wrap italic">
              &ldquo;{selectedWish.message}&rdquo;
            </p>

            <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="text-muted">
                <span>Letter for Chapter 20 · </span>
                <time dateTime={selectedWish.createdAt}>
                  {new Date(selectedWish.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadLetterAsPng(selectedWish)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-2xs"
                  title="Download letter as PNG"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => shareLetterAsPng(selectedWish)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-all cursor-pointer shadow-2xs"
                  title="Share letter image"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
