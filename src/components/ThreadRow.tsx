import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import UserBadge from "./UserBadge";

interface ThreadRowProps {
  rank: number;
  id: string;
  title: string;
  url: string | null;
  tag: string | null;
  createdAt: string;
  upvotes: number;
  commentCount: number;
  author: {
    address: string;
    ensName?: string | null;
    balanceTier: number;
  };
  userVoted: boolean;
  onVote: () => void;
  isAuthenticated: boolean;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const TAG_LABELS: Record<string, string> = {
  PROTOCOL: "Protocol",
  DEFI: "DeFi",
  L2S: "L2s",
  DEV: "Dev",
  GENERAL: "General",
};

export default function ThreadRow({
  rank,
  id,
  title,
  url,
  tag,
  createdAt,
  upvotes,
  commentCount,
  author,
  userVoted,
  onVote,
  isAuthenticated,
}: ThreadRowProps) {
  return (
    <div className="flex items-start gap-1 px-3 py-1.5 border-b border-border-light last:border-0 hover:bg-accent-soft/50 transition-colors">
      {/* Rank */}
      <span className="font-mono text-xs text-text-tertiary w-6 text-right pt-0.5 flex-shrink-0">
        {rank}.
      </span>

      {/* Vote button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (isAuthenticated) onVote();
        }}
        className={`flex-shrink-0 pt-0.5 px-0.5 ${
          isAuthenticated ? "cursor-pointer" : "cursor-default opacity-50"
        }`}
        title={isAuthenticated ? (userVoted ? "unvote" : "upvote") : "connect wallet to vote"}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={userVoted ? "text-accent" : "text-text-tertiary hover:text-accent"}
        >
          <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
        </svg>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <Link
            href={url ? url : `/thread/${id}`}
            className="text-sm text-text font-medium hover:text-accent transition-colors"
            {...(url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {title}
          </Link>
          {url && (
            <span className="font-mono text-xs text-text-tertiary">
              ({extractDomain(url)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="font-mono text-xs text-text-tertiary">
            {upvotes} point{upvotes !== 1 ? "s" : ""}
          </span>
          <span className="text-text-tertiary text-xs">|</span>
          <UserBadge
            address={author.address}
            ensName={author.ensName}
            balanceTier={author.balanceTier}
          />
          <span className="text-text-tertiary text-xs">|</span>
          <span className="font-mono text-xs text-text-tertiary">
            {timeAgo(createdAt)}
          </span>
          <span className="text-text-tertiary text-xs">|</span>
          <Link
            href={`/thread/${id}`}
            className="font-mono text-xs text-text-tertiary hover:text-accent transition-colors"
          >
            {commentCount} comment{commentCount !== 1 ? "s" : ""}
          </Link>
          {tag && (
            <>
              <span className="text-text-tertiary text-xs">|</span>
              <span className="font-mono text-xs text-text-tertiary">
                {TAG_LABELS[tag] || tag}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
