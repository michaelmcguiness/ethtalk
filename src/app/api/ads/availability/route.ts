import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTodayUTC } from "@/lib/pricing";

export async function GET() {
  const today = getTodayUTC();
  const maxDays = parseInt(process.env.AD_MAX_ADVANCE_DAYS || "30", 10);

  const endDate = new Date(today);
  endDate.setUTCDate(endDate.getUTCDate() + maxDays);

  const booked = await prisma.sponsoredLink.findMany({
    where: {
      date: { gte: today, lt: endDate },
    },
    select: {
      date: true,
      title: true,
      isActive: true,
      isFlagged: true,
    },
    orderBy: { date: "asc" },
  });

  const days: {
    date: string;
    available: boolean;
    title?: string;
  }[] = [];

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString();

    const booking = booked.find(
      (b) => b.date.toISOString() === dateStr
    );

    if (booking && booking.isActive) {
      days.push({
        date: dateStr,
        available: false,
        title: booking.title,
      });
    } else {
      days.push({ date: dateStr, available: true });
    }
  }

  return NextResponse.json(days);
}
