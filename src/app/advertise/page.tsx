"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

interface DaySlot {
  date: string;
  available: boolean;
  title?: string;
}

interface PriceInfo {
  priceWei: string;
  priceEth: string;
  ethUsdRate: number;
  priceUsd: number;
}

export default function AdvertisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [days, setDays] = useState<DaySlot[]>([]);
  const [price, setPrice] = useState<PriceInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"select" | "write" | "pay" | "done">("select");
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { data: txHash, sendTransaction, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch availability and price
  useEffect(() => {
    fetch("/api/ads/availability")
      .then((r) => r.json())
      .then(setDays)
      .catch(() => {});
    fetch("/api/ads/price")
      .then((r) => r.json())
      .then(setPrice)
      .catch(() => {});
  }, []);

  // When tx confirms, submit booking to backend
  useEffect(() => {
    if (isConfirmed && txHash && selectedDate && step === "pay") {
      submitBooking(txHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const submitBooking = async (hash: string) => {
    setError("");
    try {
      const res = await fetch("/api/ads/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          title: title.trim(),
          url: url.trim(),
          txHash: hash,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingId(data.id);
        setStep("done");
      } else {
        const data = await res.json();
        setError(data.error || "Booking failed");
      }
    } catch {
      setError("Booking failed");
    }
  };

  const handlePay = () => {
    if (!price) return;
    setError("");
    sendTransaction({
      to: process.env.NEXT_PUBLIC_TREASURY_WALLET as `0x${string}`,
      value: BigInt(price.priceWei),
    });
  };

  const extractDomain = (u: string) => {
    try {
      return new URL(u).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const isToday = (iso: string) => {
    const now = new Date();
    const d = new Date(iso);
    return (
      d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth() &&
      d.getUTCDate() === now.getUTCDate()
    );
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-background-warm rounded w-64 mb-4" />
          <div className="h-40 bg-surface border border-border rounded-[10px]" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Pitch */}
      <h1 className="font-serif text-3xl font-medium mb-2">
        Buy the top spot for $5
      </h1>
      <p className="text-text-secondary mb-8 leading-relaxed">
        One sponsored link per day, seen by every verified ETH holder on
        EthTalk. Pick a date, pay in ETH, write your headline.
      </p>

      {step === "done" ? (
        <div className="bg-surface border border-accent/30 rounded-[10px] p-8 text-center">
          <h2 className="font-serif text-2xl font-medium mb-2">You&apos;re booked!</h2>
          <p className="text-text-secondary mb-6">
            Your sponsored link will appear at the top of the feed on{" "}
            <strong>{selectedDate && formatDate(selectedDate)}</strong>.
          </p>
          {/* Final preview */}
          <div className="bg-background rounded-[10px] border border-border p-4 text-left max-w-md mx-auto">
            <p className="text-sm text-text font-medium">{title}</p>
            <p className="font-mono text-xs text-text-tertiary mt-0.5">
              ({extractDomain(url)}) &middot; sponsored
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="mb-8">
            <h2 className="font-mono text-xs text-text-tertiary uppercase mb-3">
              Select a date
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
              {days.map((day) => {
                const today = isToday(day.date);
                const selected = selectedDate === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      if (day.available) {
                        setSelectedDate(day.date);
                        setStep("write");
                        setError("");
                      }
                    }}
                    disabled={!day.available}
                    className={`p-2 rounded-lg text-center transition-colors border ${
                      selected
                        ? "border-accent bg-accent-soft"
                        : today
                        ? "border-accent/40 bg-surface"
                        : day.available
                        ? "border-border bg-surface hover:border-accent/30"
                        : "border-border bg-background-warm opacity-60 cursor-not-allowed"
                    }`}
                    title={
                      day.available
                        ? `Available — ${formatDate(day.date)}`
                        : `Booked: ${day.title}`
                    }
                  >
                    <span className="font-mono text-xs block text-text-tertiary">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        timeZone: "UTC",
                      })}
                    </span>
                    <span
                      className={`font-mono text-sm block ${
                        day.available ? "text-text" : "text-text-tertiary"
                      }`}
                    >
                      {new Date(day.date).getUTCDate()}
                    </span>
                    {!day.available && (
                      <span className="font-mono text-[10px] text-text-tertiary block truncate">
                        booked
                      </span>
                    )}
                    {day.available && price && (
                      <span className="font-mono text-[10px] text-text-tertiary block">
                        {price.priceEth.slice(0, 6)} ETH
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking flow */}
          {(step === "write" || step === "pay") && selectedDate && (
            <div className="border-t border-border pt-6">
              <h2 className="font-mono text-xs text-text-tertiary uppercase mb-4">
                {step === "write" ? "Write your ad" : "Pay & book"}
                {" — "}
                {formatDate(selectedDate)}
              </h2>

              {step === "write" && (
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-text-secondary block mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                      placeholder="Your headline (max 100 chars)"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-[10px] text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                    />
                    <span className="font-mono text-xs text-text-tertiary mt-1 block text-right">
                      {title.length}/100
                    </span>
                  </div>

                  <div>
                    <label className="font-mono text-xs text-text-secondary block mb-1.5">
                      URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-[10px] text-text font-mono text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Live preview */}
                  {title && url && (
                    <div className="bg-background rounded-[10px] border border-border p-4">
                      <p className="font-mono text-xs text-text-tertiary uppercase mb-2">
                        Preview
                      </p>
                      <p className="text-sm text-text font-medium">{title}</p>
                      <p className="font-mono text-xs text-text-tertiary mt-0.5">
                        ({extractDomain(url)}) &middot; sponsored
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep("pay")}
                      disabled={!title.trim() || !url.trim()}
                      className="font-mono text-sm bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {step === "pay" && price && (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="bg-background rounded-[10px] border border-border p-4">
                    <p className="text-sm text-text font-medium">{title}</p>
                    <p className="font-mono text-xs text-text-tertiary mt-0.5">
                      ({extractDomain(url)}) &middot; sponsored
                    </p>
                  </div>

                  <div className="bg-surface border border-border rounded-[10px] p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-sm text-text-secondary">
                        Sponsored link for {formatDate(selectedDate)}
                      </span>
                      <span className="font-mono text-lg font-medium text-text">
                        {price.priceEth} ETH
                      </span>
                    </div>
                    <p className="font-mono text-xs text-text-tertiary mb-4">
                      ~${price.priceUsd} USD at {price.ethUsdRate.toLocaleString()}{" "}
                      ETH/USD
                    </p>

                    {isConfirming ? (
                      <div className="text-center py-4">
                        <p className="font-mono text-sm text-text-secondary animate-pulse">
                          Confirming transaction...
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handlePay}
                        disabled={isSending}
                        className="w-full font-mono text-sm bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? "Sending..." : `Pay ${price.priceEth} ETH & Book`}
                      </button>
                    )}

                    <button
                      onClick={() => setStep("write")}
                      className="w-full font-mono text-xs text-text-tertiary mt-3 hover:text-text transition-colors"
                    >
                      &larr; Edit ad
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-500 font-mono text-xs">{error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content guidelines */}
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="font-serif text-lg font-medium mb-4">Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono text-xs text-text-tertiary uppercase mb-2">
                  What&apos;s welcome
                </h3>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>Side projects, blog posts, open-source tools</li>
                  <li>ETH ecosystem protocols, apps, infrastructure</li>
                  <li>Jobs and hiring in the Ethereum space</li>
                  <li>Events, hackathons, meetups</li>
                  <li>Jokes, memes, community shoutouts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-xs text-text-tertiary uppercase mb-2">
                  What gets flagged
                </h3>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>Scam links, phishing, or malware</li>
                  <li>Token presales, pump-and-dump schemes</li>
                  <li>&quot;Guaranteed yield&quot; or misleading financial claims</li>
                  <li>Hate speech, harassment, or NSFW content</li>
                  <li>Anything illegal</li>
                </ul>
              </div>
            </div>
            <p className="font-mono text-xs text-text-tertiary mt-4">
              This is a community billboard. Post something the community will
              appreciate. If enough people flag your ad, it gets pulled — no
              refund.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
