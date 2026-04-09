"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function VoteButton({
  postId,
  currentVote,
  count,
}: {
  postId: string;
  currentVote?: number;
  count: number;
}) {
  const { data: session } = useSession();
  const [vote, setVote] = useState(currentVote ?? 0);
  const [voteCount, setVoteCount] = useState(count);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: number) {
    if (!session || loading) return;

    const newValue = vote === value ? 0 : value;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });

      if (res.ok) {
        const diff = newValue - vote;
        setVoteCount((prev) => prev + diff);
        setVote(newValue);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={!session}
        className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${
          vote === 1
            ? "text-accent bg-accent-soft"
            : "text-text-tertiary hover:text-accent hover:bg-accent-soft"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`font-mono text-sm font-medium ${
          voteCount > 0
            ? "text-accent"
            : voteCount < 0
            ? "text-red-500"
            : "text-text-tertiary"
        }`}
      >
        {voteCount}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={!session}
        className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${
          vote === -1
            ? "text-red-500 bg-red-50"
            : "text-text-tertiary hover:text-red-500 hover:bg-red-50"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
