"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { signIn } from "next-auth/react";
import { getCsrfToken } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import UserBadge from "./UserBadge";

export default function Nav() {
  const { data: session, status } = useSession();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [signingIn, setSigningIn] = useState(false);

  const handleSIWE = useCallback(async () => {
    if (!address || signingIn) return;
    setSigningIn(true);

    try {
      const nonce = await getCsrfToken();
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to EthTalk",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
    } catch {
      // User rejected or error
    } finally {
      setSigningIn(false);
    }
  }, [address, signMessageAsync, signingIn]);

  useEffect(() => {
    if (isConnected && !session && status !== "loading" && !signingIn) {
      handleSIWE();
    }
  }, [isConnected, session, status, handleSIWE, signingIn]);

  const handleDisconnect = () => {
    signOut({ redirect: false });
    disconnect();
  };

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-medium text-text">
            EthTalk
          </span>
          <span className="font-mono text-xs text-accent bg-accent-soft px-1.5 py-0.5 rounded">
            ETH
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/new"
                className="font-mono text-xs bg-text text-surface px-3 py-1.5 rounded-lg hover:bg-text/90 transition-colors"
              >
                Submit
              </Link>
              <UserBadge
                address={session.user.address}
                ensName={session.user.ensName}
                balanceTier={session.user.balanceTier}
              />
              <button
                onClick={handleDisconnect}
                className="font-mono text-xs text-text-tertiary hover:text-text transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={openConnectModal}
              className="font-mono text-xs bg-accent text-white px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
            >
              {signingIn ? "Signing in..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
