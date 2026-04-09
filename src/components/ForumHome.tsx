"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ThreadRow from "./ThreadRow";
import SponsoredRow from "./SponsoredRow";

interface SponsoredAd {
  id: string;
  title: string;
  url: string;
  domain: string;
}

const TAGS = [
  { value: "", label: "All" },
  { value: "PROTOCOL", label: "Protocol" },
  { value: "DEFI", label: "DeFi" },
  { value: "L2S", label: "L2s" },
  { value: "DEV", label: "Dev" },
  { value: "GENERAL", label: "General" },
];

interface ThreadItem {
  id: string;
  title: string;
  url: string | null;
  tag: string | null;
  createdAt: string;
  isPinned: boolean;
  upvotes: number;
  commentCount: number;
  author: {
    address: string;
    ensName: string | null;
    balanceTier: number;
  };
  userVoted: boolean;
}

export default function ForumHome() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [sponsoredAd, setSponsoredAd] = useState<SponsoredAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("");

  // Fetch sponsored ad once
  useEffect(() => {
    fetch("/api/ads/current")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setSponsoredAd(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeTag ? `/api/threads?tag=${activeTag}` : "/api/threads";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setThreads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTag]);

  const handleVote = async (threadId: string) => {
    if (!session) return;
    const res = await fetch(`/api/threads/${threadId}/vote`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, upvotes: data.upvotes, userVoted: data.voted }
            : t
        )
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Tag filter bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {TAGS.map((tag) => (
          <button
            key={tag.value}
            onClick={() => setActiveTag(tag.value)}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTag === tag.value
                ? "bg-accent text-white"
                : "text-text-tertiary hover:bg-background-warm"
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-0">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-10 bg-background-warm rounded mb-px animate-pulse" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-text-tertiary font-mono text-sm">
          No threads yet. Be the first to submit.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[10px]">
          {sponsoredAd && (
            <SponsoredRow
              id={sponsoredAd.id}
              title={sponsoredAd.title}
              url={sponsoredAd.url}
              domain={sponsoredAd.domain}
            />
          )}
          {threads.map((thread, i) => (
            <ThreadRow
              key={thread.id}
              rank={i + 1}
              id={thread.id}
              title={thread.title}
              url={thread.url}
              tag={thread.tag}
              createdAt={thread.createdAt}
              upvotes={thread.upvotes}
              commentCount={thread.commentCount}
              author={thread.author}
              userVoted={thread.userVoted}
              onVote={() => handleVote(thread.id)}
              isAuthenticated={!!session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
