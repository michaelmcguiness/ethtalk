"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import PostCard from "@/components/PostCard";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";
import { timeAgo } from "@/lib/utils";

interface PostData {
  id: string;
  body: string;
  createdAt: string;
  isEdited: boolean;
  author: { address: string; ensName: string | null; balanceTier: number };
  voteCount: number;
  userVote: number;
}

interface ThreadData {
  id: string;
  title: string;
  url: string | null;
  body: string;
  tag: string | null;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  upvotes: number;
  userVoted: boolean;
  author: { address: string; ensName: string | null; balanceTier: number };
  posts: PostData[];
}

const TAG_LABELS: Record<string, string> = {
  PROTOCOL: "Protocol",
  DEFI: "DeFi",
  L2S: "L2s",
  DEV: "Dev",
  GENERAL: "General",
};

export default function ThreadPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/threads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setThread(null);
        } else {
          setThread(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!session || !thread) return;
    const res = await fetch(`/api/threads/${id}/vote`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setThread((prev) =>
        prev ? { ...prev, upvotes: data.upvotes, userVoted: data.voted } : prev
      );
    }
  };

  const handleReply = async () => {
    if (!replyBody.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/threads/${id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyBody }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setThread((prev) =>
          prev ? { ...prev, posts: [...prev.posts, newPost] } : prev
        );
        setReplyBody("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post reply");
      }
    } catch {
      setError("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-background-warm rounded w-2/3" />
          <div className="h-40 bg-surface border border-border rounded-[10px]" />
          <div className="h-24 bg-surface border border-border rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Thread not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="font-mono text-xs text-text-tertiary hover:text-accent transition-colors"
        >
          &larr; Feed
        </Link>
      </div>

      {/* Thread header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={handleVote}
            className={`flex-shrink-0 mt-1 ${
              session ? "cursor-pointer" : "cursor-default opacity-50"
            }`}
            title={session ? (thread.userVoted ? "unvote" : "upvote") : "connect wallet to vote"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 10 10"
              className={thread.userVoted ? "text-accent" : "text-text-tertiary hover:text-accent"}
            >
              <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
            </svg>
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-text">
              {thread.title}
            </h1>
            {thread.url && (
              <a
                href={thread.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent hover:text-accent-hover transition-colors"
              >
                {thread.url}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="font-mono text-xs text-text-tertiary">
            {thread.upvotes} point{thread.upvotes !== 1 ? "s" : ""}
          </span>
          <span className="text-text-tertiary text-xs">|</span>
          <UserBadge
            address={thread.author.address}
            ensName={thread.author.ensName}
            balanceTier={thread.author.balanceTier}
          />
          <span className="text-text-tertiary text-xs">|</span>
          <span className="font-mono text-xs text-text-tertiary">
            {timeAgo(thread.createdAt)}
          </span>
          <span className="text-text-tertiary text-xs">|</span>
          <span className="font-mono text-xs text-text-tertiary">
            {thread.posts.length} comment{thread.posts.length !== 1 ? "s" : ""}
          </span>
          <span className="text-text-tertiary text-xs">|</span>
          <span className="font-mono text-xs text-text-tertiary">
            {thread.viewCount} views
          </span>
          {thread.tag && (
            <>
              <span className="text-text-tertiary text-xs">|</span>
              <span className="font-mono text-xs text-text-tertiary">
                {TAG_LABELS[thread.tag] || thread.tag}
              </span>
            </>
          )}
          {thread.isPinned && (
            <span className="font-mono text-xs text-accent bg-accent-soft px-1.5 py-0.5 rounded">
              PINNED
            </span>
          )}
          {thread.isLocked && (
            <span className="font-mono text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              LOCKED
            </span>
          )}
        </div>
      </div>

      {/* Thread body (text posts) */}
      {thread.body && (
        <div className="bg-surface border border-border rounded-[10px] p-5 mb-6">
          <div className="markdown-content text-text leading-relaxed">
            <MarkdownRenderer content={thread.body} />
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3">
        {thread.posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            body={post.body}
            createdAt={post.createdAt}
            isEdited={post.isEdited}
            voteCount={post.voteCount}
            userVote={post.userVote}
            author={post.author}
          />
        ))}
      </div>

      {/* Reply box */}
      {session && !thread.isLocked && (
        <div className="mt-8">
          <h3 className="font-serif text-lg font-medium mb-3">Add Comment</h3>
          <MarkdownEditor
            value={replyBody}
            onChange={setReplyBody}
            placeholder="Write your comment... (Markdown supported)"
          />
          {error && (
            <p className="text-red-500 font-mono text-xs mt-2">{error}</p>
          )}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleReply}
              disabled={!replyBody.trim() || submitting}
              className="font-mono text-sm bg-accent text-white px-5 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Add Comment"}
            </button>
          </div>
        </div>
      )}

      {!session && (
        <div className="mt-8 text-center py-8 bg-surface border border-border rounded-[10px]">
          <p className="text-text-secondary font-mono text-sm">
            Connect your wallet to comment on this thread.
          </p>
        </div>
      )}
    </div>
  );
}
