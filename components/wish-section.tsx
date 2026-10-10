"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";
import { RELATIONSHIP_OPTIONS, WishResponse } from "@/types/wishes";
import Link from "next/link";
import { Send, Image as ImageIcon, Loader2, Check, PenLine, Download, Share2 } from "lucide-react";
import { downloadLetterAsPng, shareLetterAsPng } from "@/lib/letter-card-generator";

export function WishSection() {
  const [wishes, setWishes] = useState<WishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const maxMessageLen = 280;

  const fetchWishes = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      const res = await fetch(`/api/wishes?page=${pageNum}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setWishes((prev) => [...prev, ...data.wishes]);
        } else {
          setWishes(data.wishes);
        }
        setTotal(data.total);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Error loading wishes:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWishes(1, false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write a short note");
      return;
    }
    if (message.length > maxMessageLen) {
      toast.error("Note is too long (maximum 280 characters)");
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
        toast.error(data.error || "Could not send your letter");
        setSubmitting(false);
        return;
      }

      // Success
      toast.success("Thank you. This one is going in the journal.");
      triggerConfetti();

      // Reset form
      setName("");
      setMessage("");
      setRelationship("");
      setCustomRelationship("");
      setHoneypot("");
      setSentSuccess(true);

      // Refresh wishes list
      fetchWishes(1, false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="font-serif text-2xl text-ink font-medium">
          Write a letter to samkiel
        </h3>
        <p className="text-muted text-sm leading-relaxed">
          This is your space to write your own letter for Chapter 20. Share a memory from our journey together, a word of advice, a prayer, or birthday wishes. I will be reading every single note long after October 11.
        </p>
      </div>

      {/* Submission Form or Sent State */}
      {sentSuccess ? (
        <div className="p-8 sm:p-10 rounded-xl border border-hairline bg-paper/70 backdrop-blur-xs text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-accent-soft border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="font-serif text-2xl text-ink font-normal">
              Letter placed on the wall
            </h4>
            <p className="text-muted text-sm leading-relaxed">
              Thank you for writing. Your note is now part of Chapter 20 and will be kept in the journal.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setSentSuccess(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-xs font-mono uppercase tracking-wider hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5 text-accent" />
              <span>Send another note</span>
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-xl border border-hairline bg-paper/60 space-y-6"
        >
        {/* Honeypot field (hidden from genuine users) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website-hp">Website</label>
          <input
            id="website-hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="wish-name"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Your name <span className="text-accent">*</span>
            </label>
            <input
              id="wish-name"
              type="text"
              required
              maxLength={60}
              placeholder="e.g. Tobi or A classmate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="wish-relationship"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Relationship <span className="text-muted/70 text-[10px]">(optional)</span>
            </label>
            <select
              id="wish-relationship"
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
              htmlFor="wish-message"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Your letter <span className="text-accent">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                message.length > 260
                  ? "text-red-500 font-semibold"
                  : "text-muted"
              }`}
            >
              {message.length} / {maxMessageLen}
            </span>
          </div>
          <textarea
            id="wish-message"
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
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-paper text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing note...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send letter to samkiel</span>
            </>
          )}
        </button>
        </form>
      )}

      {/* Wishes Wall */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h3 className="font-serif text-lg text-ink">Letters on the wall</h3>
          <span className="text-xs font-mono text-muted">
            {total} {total === 1 ? "letter" : "letters"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-muted text-sm font-mono">
            Reading letters...
          </div>
        ) : wishes.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm italic">
            No notes posted yet. Be the first to leave one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishes.map((w) => (
              <article
                key={w.id}
                className="p-5 rounded-lg border border-hairline bg-paper/70 flex flex-col justify-between gap-4 transition-all hover:border-accent/40"
              >
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                  {w.message}
                </p>

                <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-xs text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-ink font-sans font-medium">
                      {w.name}
                    </span>
                    {w.relationship && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-hairline bg-paper">
                        {w.relationship}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <time dateTime={w.createdAt}>
                      {new Date(w.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <div className="flex items-center gap-1 border-l border-hairline/60 pl-2">
                      <button
                        type="button"
                        onClick={() => downloadLetterAsPng(w)}
                        title="Download letter as PNG"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => shareLetterAsPng(w)}
                        title="Share letter"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-ink transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load more button */}
        {wishes.length < total && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => fetchWishes(page + 1, true)}
              disabled={loadingMore}
              className="px-5 py-2 rounded-lg border border-hairline text-xs font-mono uppercase tracking-wider text-muted hover:text-ink hover:border-ink transition-colors cursor-pointer"
            >
              {loadingMore ? "Loading more..." : "Load more letters"}
            </button>
          </div>
        )}
      </div>

      {/* Links under the wall */}
      <div className="pt-8 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <Link
          href="/pictures"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Birthday pictures to share</span>
        </Link>

        <Link
          href="/wishes"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors"
        >
          <span>Open full floating wall →</span>
        </Link>
      </div>
    </div>
  );
}
