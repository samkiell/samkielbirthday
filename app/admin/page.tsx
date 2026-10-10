"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WishResponse } from "@/types/wishes";
import { AdminAnalytics } from "@/components/admin-analytics";
import {
  Lock,
  LogOut,
  CheckCircle2,
  EyeOff,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [wishes, setWishes] = useState<WishResponse[]>([]);
  const [view, setView] = useState<"letters" | "analytics">("letters");
  const [filter, setFilter] = useState("all");
  const [loadingWishes, setLoadingWishes] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Restore saved view preference
  useEffect(() => {
    const savedView = localStorage.getItem("samkiel_admin_view");
    if (savedView === "analytics" || savedView === "letters") {
      setView(savedView);
    }
  }, []);

  const changeView = (newView: "letters" | "analytics") => {
    setView(newView);
    try {
      localStorage.setItem("samkiel_admin_view", newView);
    } catch {
      // ignore
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/session");
      if (res.ok) {
        setIsAuthenticated(true);
        loadWishes();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter the admin password");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoginLoading(false);
        return;
      }

      toast.success("Welcome back, samkiel");
      setIsAuthenticated(true);
      setPassword("");
      loadWishes(filter);
    } catch {
      toast.error("Connection error during login");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setWishes([]);
      toast.info("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  const loadWishes = async (statusFilter = filter) => {
    setLoadingWishes(true);
    try {
      const res = await fetch(`/api/admin/wishes?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch {
      toast.error("Failed to load wishes");
    } finally {
      setLoadingWishes(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "approved" | "hidden"
  ) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }

      toast.success(`Letter marked as ${newStatus}`);
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
      );
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, authorName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the letter from "${authorName}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete letter");
        return;
      }

      toast.success("Letter deleted");
      setWishes((prev) => prev.filter((w) => w.id !== id));
    } catch {
      toast.error("Delete action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted font-mono text-xs">
        Checking session...
      </div>
    );
  }

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-10 h-10 mx-auto rounded-full border border-hairline flex items-center justify-center text-muted">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="font-serif text-2xl text-ink">Journal Moderation</h1>
          <p className="text-xs text-muted font-mono">
            Enter admin password to review letters
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="p-6 rounded-xl border border-hairline bg-paper/60 space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-mono uppercase tracking-wider text-muted"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-hairline bg-paper text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-2.5 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h1 className="font-serif text-2xl text-ink">Letter Moderation</h1>
          </div>
          <p className="text-xs font-mono text-muted">
            Manage public visibility of letters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadWishes(filter)}
            disabled={loadingWishes}
            className="p-2 rounded-lg border border-hairline text-muted hover:text-ink transition-colors cursor-pointer"
            title="Refresh letters"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingWishes ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline text-xs font-mono text-muted hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-2">
        {(["letters", "analytics"] as const).map((v) => (
          <button
            key={v}
            onClick={() => changeView(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
              view === v ? "bg-ink text-paper font-semibold" : "text-muted hover:text-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "analytics" ? (
        <AdminAnalytics />
      ) : (
        <>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-hairline pb-3">
        {["all", "approved", "pending", "hidden"].map((st) => (
          <button
            key={st}
            onClick={() => {
              setFilter(st);
              loadWishes(st);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
              filter === st
                ? "bg-accent text-paper font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Letters List */}
      <div className="space-y-4">
        {loadingWishes ? (
          <div className="py-12 flex justify-center text-xs font-mono text-muted">
            Loading letters...
          </div>
        ) : wishes.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-muted">
            No letters found in this view.
          </div>
        ) : (
          wishes.map((w) => {
            const isLoading = actionLoadingId === w.id;
            return (
              <div
                key={w.id}
                className="p-5 rounded-xl border border-hairline bg-paper/70 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink">
                        {w.name}
                      </span>
                      {w.relationship && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-hairline text-muted">
                          {w.relationship}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                      <span>{new Date(w.createdAt).toLocaleString()}</span>
                      <span>·</span>
                      <a
                        href={`/wish/${w.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        /wish/{w.code}
                      </a>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      w.status === "approved"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : w.status === "pending"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 border border-red-500/20"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {w.message}
                </p>

                {/* Actions */}
                <div className="pt-3 border-t border-hairline/60 flex items-center justify-end gap-3 text-xs font-mono">
                  {w.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(w.id, "approved")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-accent hover:underline cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {w.status !== "hidden" && (
                    <button
                      onClick={() => handleStatusChange(w.id, "hidden")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-muted hover:text-ink cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}
    </div>
  );
}
