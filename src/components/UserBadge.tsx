"use client";

import { displayName, tierLabel } from "@/lib/utils";
import Link from "next/link";

export default function UserBadge({
  address,
  ensName,
  balanceTier,
  showTierTooltip = true,
  linked = true,
}: {
  address: string;
  ensName?: string | null;
  balanceTier: number;
  showTierTooltip?: boolean;
  linked?: boolean;
}) {
  const name = displayName(address, ensName);
  const content = (
    <span className="inline-flex items-center gap-0">
      <span
        className={`tier-badge tier-badge-${balanceTier}`}
        title={showTierTooltip ? tierLabel(balanceTier) : undefined}
      />
      <span className="font-mono text-sm text-text hover:text-accent transition-colors">
        {name}
      </span>
    </span>
  );

  if (linked) {
    return <Link href={`/user/${address}`}>{content}</Link>;
  }
  return content;
}
