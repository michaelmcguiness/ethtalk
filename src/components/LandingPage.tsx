"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function LandingPage() {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="inline-flex items-center gap-2 mb-6 font-mono text-xs text-accent bg-accent-soft px-3 py-1.5 rounded-full">
          <span className="tier-badge tier-badge-1" />
          Token-gated for ETH holders
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-medium text-text leading-tight mb-6">
          Where Ethereum<br />holders talk
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          EthTalk is a forum for people with skin in the game. Connect your
          wallet, prove you hold at least 0.1 ETH on mainnet, and join
          conversations that matter.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={openConnectModal}
            className="bg-accent text-white font-mono text-sm px-6 py-3 rounded-xl hover:bg-accent-hover transition-colors shadow-[0_4px_24px_rgba(98,126,234,0.25)]"
          >
            Connect Wallet to Enter
          </button>
          <a
            href="#how-it-works"
            className="font-mono text-sm text-text-secondary hover:text-text transition-colors px-4 py-3"
          >
            How it works &darr;
          </a>
        </div>
      </section>

      {/* Feed Preview */}
      <section className="mb-20">
        <div className="bg-surface border border-border rounded-[10px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="border-b border-border-light px-5 py-3 flex items-center gap-3">
            <span className="font-mono text-xs text-text-tertiary">FEED</span>
            <div className="flex gap-2 ml-auto">
              {["All", "Protocol", "DeFi", "L2s", "Dev", "General"].map(
                (tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-xs px-2 py-1 rounded ${
                      tag === "All"
                        ? "text-white bg-accent"
                        : "text-text-tertiary bg-background"
                    }`}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Mock threads - HN style */}
          {[
            {
              rank: 1,
              title: "Pectra upgrade: what changes for stakers?",
              author: "vitalik.eth",
              tier: 3,
              points: 142,
              comments: 47,
              time: "2h ago",
              tag: "Protocol",
            },
            {
              rank: 2,
              title: "Best L2 for deploying a new DEX in 2026?",
              author: "0x7a3B...9f2E",
              tier: 1,
              points: 89,
              comments: 23,
              time: "4h ago",
              tag: "L2s",
            },
            {
              rank: 3,
              title: "Unpopular opinion: ETH staking yield is fine as-is",
              author: "sassal.eth",
              tier: 2,
              points: 67,
              comments: 89,
              time: "6h ago",
              tag: "DeFi",
            },
            {
              rank: 4,
              title: "Solidity vs Vyper in 2026 — has the gap closed?",
              author: "0x1De4...c8A1",
              tier: 0,
              points: 45,
              comments: 31,
              time: "8h ago",
              tag: "Dev",
            },
            {
              rank: 5,
              title: "Welcome to EthTalk — introduce yourself",
              author: "ethtalk.eth",
              tier: 3,
              points: 231,
              comments: 156,
              time: "1d ago",
              tag: "General",
            },
          ].map((thread) => (
            <div
              key={thread.rank}
              className="flex items-start gap-1 px-4 py-1.5 border-b border-border-light last:border-0 hover:bg-accent-soft/50 transition-colors"
            >
              <span className="font-mono text-xs text-text-tertiary w-6 text-right pt-0.5">
                {thread.rank}.
              </span>
              <span className="pt-0.5 px-0.5">
                <svg width="10" height="10" viewBox="0 0 10 10" className="text-text-tertiary">
                  <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text font-medium">{thread.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-text-tertiary">
                    {thread.points} points
                  </span>
                  <span className="text-text-tertiary text-xs">|</span>
                  <span className={`tier-badge tier-badge-${thread.tier}`} />
                  <span className="font-mono text-xs text-text-secondary">
                    {thread.author}
                  </span>
                  <span className="text-text-tertiary text-xs">|</span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {thread.time}
                  </span>
                  <span className="text-text-tertiary text-xs">|</span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {thread.comments} comments
                  </span>
                  <span className="text-text-tertiary text-xs">|</span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {thread.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="px-5 py-3 bg-background text-center">
            <button
              onClick={openConnectModal}
              className="font-mono text-xs text-accent hover:text-accent-hover transition-colors"
            >
              Connect wallet to view all threads &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mb-20">
        <h2 className="font-serif text-3xl font-medium text-center mb-12">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Connect Wallet",
              description:
                "Use MetaMask, Rainbow, Coinbase Wallet, or any WalletConnect-compatible wallet to connect.",
            },
            {
              step: "02",
              title: "Verify Balance",
              description:
                "We check your Ethereum mainnet balance. You need at least 0.1 ETH to join — skin in the game.",
            },
            {
              step: "03",
              title: "Join the Feed",
              description:
                "Submit links and text posts, comment on discussions, and upvote content. Your balance tier is displayed as a badge.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-surface border border-border rounded-[10px] p-6"
            >
              <span className="font-mono text-xs text-accent">{item.step}</span>
              <h3 className="font-serif text-xl font-medium mt-2 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Balance tiers */}
      <section className="mb-20">
        <h2 className="font-serif text-3xl font-medium text-center mb-4">
          Balance tiers
        </h2>
        <p className="text-center text-text-secondary mb-10 max-w-xl mx-auto">
          Your on-chain balance earns you a tier badge, displayed next to your
          name in every post. No special privileges — just signal.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { tier: 0, label: "0.1–1 ETH", color: "tier-gray", desc: "Entry" },
            { tier: 1, label: "1–10 ETH", color: "tier-blue", desc: "Holder" },
            { tier: 2, label: "10–100 ETH", color: "tier-amber", desc: "Conviction" },
            { tier: 3, label: "100+ ETH", color: "tier-purple", desc: "Whale" },
          ].map((t) => (
            <div
              key={t.tier}
              className="bg-surface border border-border rounded-[10px] p-4 text-center"
            >
              <span className={`tier-badge tier-badge-${t.tier} mx-auto mb-2`} />
              <p className="font-mono text-sm font-medium">{t.label}</p>
              <p className="font-mono text-xs text-text-tertiary">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 mb-10">
        <h2 className="font-serif text-3xl font-medium mb-4">
          Ready to join?
        </h2>
        <p className="text-text-secondary mb-8">
          All you need is a wallet and 0.1 ETH on mainnet.
        </p>
        <button
          onClick={openConnectModal}
          className="bg-text text-surface font-mono text-sm px-8 py-3 rounded-xl hover:bg-text/90 transition-colors"
        >
          Connect Wallet
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="font-mono text-xs text-text-tertiary">
          EthTalk &mdash; a forum for Ethereum holders &mdash; identity is your wallet
        </p>
      </footer>
    </div>
  );
}
