"use client";

import { useSession } from "next-auth/react";
import LandingPage from "@/components/LandingPage";
import ForumHome from "@/components/ForumHome";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-background-warm rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-background-warm rounded w-96 mx-auto" />
        </div>
      </div>
    );
  }

  if (session) {
    return <ForumHome />;
  }

  return <LandingPage />;
}
