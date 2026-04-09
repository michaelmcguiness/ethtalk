"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import UserBadge from "@/components/UserBadge";
import { tierLabel, timeAgo } from "@/lib/utils";
import Link from "next/link";

const TAG_LABELS: Record<string, string> = {
  PROTOCOL: "Protocol",
  DEFI: "DeFi",
  L2S: "L2s",
  DEV: "Dev",
  GENERAL: "General",
};

interface UserProfile {
  address: string;
  ensName: string | null;
  balanceTier: number;
  bio: string | null;
  joinedAt: string;
  threadCount: number;
  postCount: number;
  recentThreads: {
    id: string;
    title: string;
    tag: string | null;
    createdAt: string;
  }[];
  recentPosts: {
    id: string;
    body: string;
    createdAt: string;
    thread: { id: string; title: string };
  }[];
}

export default function UserProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${address}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setUser(null);
        else setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-background-warm rounded w-48" />
          <div className="h-32 bg-surface border border-border rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-surface border border-border rounded-[10px] p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
            <span className={`tier-badge tier-badge-${user.balanceTier}`} style={{ margin: 0 }} />
          </div>
          <div className="flex-1 min-w-0">
            {user.ensName && (
              <h1 className="font-serif text-2xl font-medium">{user.ensName}</h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-text-secondary select-all">
                {user.address}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(user.address)}
                className="font-mono text-xs text-text-tertiary hover:text-accent transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="flex items-center gap-4 mt-3 font-mono text-xs text-text-tertiary">
              <span className={`inline-flex items-center gap-1`}>
                <span className={`tier-badge tier-badge-${user.balanceTier}`} />
                {tierLabel(user.balanceTier)}
              </span>
              <span>Joined {timeAgo(user.joinedAt)}</span>
              <span>{user.threadCount} threads</span>
              <span>{user.postCount} posts</span>
            </div>
            {user.bio && (
              <p className="text-sm text-text-secondary mt-3">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Threads */}
        <div>
          <h2 className="font-serif text-lg font-medium mb-3">Recent Threads</h2>
          <div className="bg-surface border border-border rounded-[10px] divide-y divide-border-light">
            {user.recentThreads.length === 0 ? (
              <p className="px-4 py-6 text-center text-text-tertiary text-sm">
                No threads yet
              </p>
            ) : (
              user.recentThreads.map((t) => (
                <Link
                  key={t.id}
                  href={`/thread/${t.id}`}
                  className="block px-4 py-3 hover:bg-accent-soft transition-colors"
                >
                  <p className="text-sm font-medium text-text truncate">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {t.tag && (
                      <span className="font-mono text-xs text-text-tertiary bg-background-warm px-1.5 py-0.5 rounded">
                        {TAG_LABELS[t.tag] || t.tag}
                      </span>
                    )}
                    <span className="font-mono text-xs text-text-tertiary">
                      {timeAgo(t.createdAt)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="font-serif text-lg font-medium mb-3">Recent Posts</h2>
          <div className="bg-surface border border-border rounded-[10px] divide-y divide-border-light">
            {user.recentPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-text-tertiary text-sm">
                No posts yet
              </p>
            ) : (
              user.recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/thread/${p.thread.id}`}
                  className="block px-4 py-3 hover:bg-accent-soft transition-colors"
                >
                  <p className="font-mono text-xs text-text-tertiary mb-1 truncate">
                    in: {p.thread.title}
                  </p>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {p.body}
                  </p>
                  <span className="font-mono text-xs text-text-tertiary mt-1 inline-block">
                    {timeAgo(p.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
