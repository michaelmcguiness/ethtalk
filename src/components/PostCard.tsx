"use client";

import { timeAgo } from "@/lib/utils";
import UserBadge from "./UserBadge";
import VoteButton from "./VoteButton";
import MarkdownRenderer from "./MarkdownRenderer";

interface PostCardProps {
  id: string;
  body: string;
  createdAt: string;
  isEdited: boolean;
  voteCount: number;
  userVote?: number;
  author: {
    address: string;
    ensName?: string | null;
    balanceTier: number;
  };
  isOriginalPost?: boolean;
  threadTitle?: string;
  currentUserAddress?: string;
}

export default function PostCard({
  id,
  body,
  createdAt,
  isEdited,
  voteCount,
  userVote,
  author,
  isOriginalPost = false,
  threadTitle,
}: PostCardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-[10px] p-5 ${
        isOriginalPost ? "border-accent/20" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <VoteButton postId={id} currentVote={userVote} count={voteCount} />
        </div>
        <div className="min-w-0 flex-1">
          {isOriginalPost && threadTitle && (
            <h1 className="font-serif text-2xl font-medium text-text mb-3">
              {threadTitle}
            </h1>
          )}
          <div className="flex items-center gap-2 mb-3">
            <UserBadge
              address={author.address}
              ensName={author.ensName}
              balanceTier={author.balanceTier}
            />
            <span className="font-mono text-xs text-text-tertiary">
              {timeAgo(createdAt)}
            </span>
            {isEdited && (
              <span className="font-mono text-xs text-text-tertiary">(edited)</span>
            )}
          </div>
          <div className="markdown-content text-text leading-relaxed">
            <MarkdownRenderer content={body} />
          </div>
        </div>
      </div>
    </div>
  );
}
