"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface SponsoredRowProps {
  id: string;
  title: string;
  url: string;
  domain: string;
}

export default function SponsoredRow({
  id,
  title,
  url,
  domain,
}: SponsoredRowProps) {
  const { data: session } = useSession();
  const [flagged, setFlagged] = useState(false);

  // Track impression on mount
  useEffect(() => {
    if (session) {
      fetch(`/api/ads/${id}/impression`, { method: "POST" }).catch(() => {});
    }
  }, [id, session]);

  const handleClick = () => {
    if (session) {
      fetch(`/api/ads/${id}/click`, { method: "POST" }).catch(() => {});
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFlag = async () => {
    if (!session || flagged) return;
    const ok = window.confirm("Flag this sponsored link as inappropriate?");
    if (!ok) return;
    const res = await fetch(`/api/ads/${id}/flag`, { method: "POST" });
    if (res.ok) setFlagged(true);
  };

  return (
    <div className="flex items-start gap-1 px-3 py-1.5 border-b border-border-light hover:bg-accent-soft/50 transition-colors">
      {/* Empty rank column */}
      <span className="font-mono text-xs text-transparent w-6 text-right pt-0.5 flex-shrink-0">
        &nbsp;
      </span>

      {/* Empty vote column */}
      <span className="flex-shrink-0 pt-0.5 px-0.5 invisible">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
        </svg>
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <button
            onClick={handleClick}
            className="text-sm text-text font-medium hover:text-accent transition-colors text-left"
          >
            {title}
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-mono text-xs text-text-tertiary">
            ({domain})
          </span>
          <span className="text-text-tertiary text-xs">&middot;</span>
          <span className="font-mono text-xs text-text-tertiary">
            sponsored
          </span>
          {session && (
            <>
              <span className="text-text-tertiary text-xs">&middot;</span>
              <button
                onClick={handleFlag}
                className={`font-mono text-xs transition-colors ${
                  flagged
                    ? "text-text-tertiary cursor-default"
                    : "text-text-tertiary hover:text-red-500"
                }`}
                disabled={flagged}
              >
                {flagged ? "flagged" : "flag"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
