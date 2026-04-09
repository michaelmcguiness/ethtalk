import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTodayUTC } from "@/lib/pricing";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayUTC();

  try {
    await prisma.adEvent.create({
      data: {
        sponsoredLinkId: id,
        userAddress: session.user.address,
        eventType: "click",
        date: today,
      },
    });

    await prisma.sponsoredLink.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  } catch {
    // Duplicate — already recorded today, ignore
  }

  return NextResponse.json({ ok: true });
}
