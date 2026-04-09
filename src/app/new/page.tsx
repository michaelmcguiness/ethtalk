"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";

const TAGS = [
  { value: "", label: "None" },
  { value: "PROTOCOL", label: "Protocol" },
  { value: "DEFI", label: "DeFi" },
  { value: "L2S", label: "L2s" },
  { value: "DEV", label: "Dev" },
  { value: "GENERAL", label: "General" },
];

export default function NewThreadPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-background-warm rounded w-48 mb-6" />
            <div className="h-12 bg-surface border border-border rounded-[10px] mb-4" />
            <div className="h-48 bg-surface border border-border rounded-[10px]" />
          </div>
        </div>
      }
    >
      <NewThreadContent />
    </Suspense>
  );
}

function NewThreadContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [postType, setPostType] = useState<"link" | "text">("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    if (postType === "link" && !url.trim()) return;
    if (postType === "text" && !body.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          ...(postType === "link" ? { url: url.trim() } : { content: body.trim() }),
          ...(tag ? { tag } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/thread/${data.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create thread");
      }
    } catch {
      setError("Failed to create thread");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-background-warm rounded w-48 mb-6" />
          <div className="h-12 bg-surface border border-border rounded-[10px] mb-4" />
          <div className="h-48 bg-surface border border-border rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const canSubmit =
    title.trim() &&
    (postType === "link" ? url.trim() : body.trim()) &&
    !submitting;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-medium mb-6">Submit</h1>

      {/* Post type toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPostType("link")}
          className={`font-mono text-xs px-4 py-2 rounded-lg transition-colors ${
            postType === "link"
              ? "bg-accent text-white"
              : "text-text-tertiary hover:bg-background-warm"
          }`}
        >
          Link
        </button>
        <button
          onClick={() => setPostType("text")}
          className={`font-mono text-xs px-4 py-2 rounded-lg transition-colors ${
            postType === "text"
              ? "bg-accent text-white"
              : "text-text-tertiary hover:bg-background-warm"
          }`}
        >
          Text
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-mono text-xs text-text-secondary block mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 500))}
            placeholder="Thread title"
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-[10px] text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
          <span className="font-mono text-xs text-text-tertiary mt-1 block text-right">
            {title.length}/500
          </span>
        </div>

        {postType === "link" ? (
          <div>
            <label className="font-mono text-xs text-text-secondary block mb-1.5">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-[10px] text-text font-mono text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent"
            />
          </div>
        ) : (
          <div>
            <label className="font-mono text-xs text-text-secondary block mb-1.5">
              Body
            </label>
            <MarkdownEditor value={body} onChange={setBody} />
          </div>
        )}

        <div>
          <label className="font-mono text-xs text-text-secondary block mb-1.5">
            Tag (optional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                className={`font-mono text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  tag === t.value
                    ? "bg-accent text-white"
                    : "text-text-tertiary bg-surface border border-border hover:border-accent/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 font-mono text-xs">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="font-mono text-sm text-text-tertiary px-4 py-2 hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="font-mono text-sm bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
