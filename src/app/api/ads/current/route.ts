import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTodayUTC } from "@/lib/pricing";

export async function GET() {
  const todayStart = getTodayUTC();

  const ad = await prisma.sponsoredLink.findFirst({
    where: {
      date: todayStart,
      isActive: true,
      isFlagged: false,
    },
  });

  if (!ad) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: ad.id,
    title: ad.title,
    url: ad.url,
    domain: ad.domain,
  });
}
