"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";

interface Ad {
  id: string;
  title: string;
  url: string;
  domain: string;
  date: string;
  isActive: boolean;
  isFlagged: boolean;
  flagCount: number;
  buyerAddress: string;
  impressions: number;
  clicks: number;
  pricePaidWei: string;
  createdAt: string;
}

export default function AdminAdsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    fetch("/api/admin/ads")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then(setAds)
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [status, router]);

  const handleAction = async (id: string, action: "restore" | "kill") => {
    const res = await fetch(`/api/admin/ads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setAds((prev) =>
        prev.map((ad) =>
          ad.id === id
            ? {
                ...ad,
                ...(action === "restore" ? { isFlagged: false } : { isActive: false }),
              }
            : ad
        )
      );
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

  const statusLabel = (ad: Ad) => {
    if (!ad.isActive) return "killed";
    if (ad.isFlagged) return "flagged";
    return "active";
  };

  const statusColor = (ad: Ad) => {
    if (!ad.isActive) return "text-text-tertiary";
    if (ad.isFlagged) return "text-red-500";
    return "text-green-600";
  };

  if (loading || status === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-background-warm rounded w-48 mb-6" />
          <div className="h-64 bg-surface border border-border rounded-[10px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-medium mb-6">Ad Management</h1>

      {ads.length === 0 ? (
        <p className="text-text-secondary font-mono text-sm">No ads yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-[10px] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-text-tertiary font-mono text-xs uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Imp</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  className={`border-b border-border-light ${
                    ad.isFlagged ? "bg-red-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {formatDate(ad.date)}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text hover:text-accent transition-colors"
                    >
                      {ad.title}
                    </a>
                    <span className="font-mono text-xs text-text-tertiary ml-1">
                      ({ad.domain})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {ad.buyerAddress.slice(0, 6)}...{ad.buyerAddress.slice(-4)}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${statusColor(ad)}`}>
                    {statusLabel(ad)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {ad.flagCount}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {ad.impressions}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {ad.clicks}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(1) + "%"
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {ad.isFlagged && ad.isActive && (
                        <button
                          onClick={() => handleAction(ad.id, "restore")}
                          className="font-mono text-xs text-accent hover:text-accent-hover transition-colors"
                        >
                          Restore
                        </button>
                      )}
                      {ad.isActive && (
                        <button
                          onClick={() => handleAction(ad.id, "kill")}
                          className="font-mono text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                          Kill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
