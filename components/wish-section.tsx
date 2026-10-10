"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { triggerConfetti } from "@/lib/confetti";
import { RELATIONSHIP_OPTIONS, WishResponse } from "@/types/wishes";
import Link from "next/link";
import { Send, FileDown, Image as ImageIcon, Loader2 } from "lucide-react";

export function WishSection() {
  const [wishes, setWishes] = useState<WishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [relationship, setRelationship] = useState("");
  const [honeypot, setHoneypot] = useState("");

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
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          relationship: relationship || undefined,
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
      setHoneypot("");

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

      {/* Submission Form */}
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
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors cursor-pointer"
            >
              <option value="">Select how you know me</option>
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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
                  <time dateTime={w.createdAt}>
                    {new Date(w.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
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

        <a
          href="/api/wishes/pdf"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>Download all letters (PDF)</span>
        </a>
      </div>
    </div>
  );
}
