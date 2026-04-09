import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const FLAG_THRESHOLD = parseInt(process.env.AD_FLAG_THRESHOLD || "3", 10);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ad = await prisma.sponsoredLink.findUnique({ where: { id } });
  if (!ad) {
    return NextResponse.json({ error: "Ad not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = body.reason || null;

  try {
    await prisma.adFlag.create({
      data: {
        sponsoredLinkId: id,
        flaggerAddress: session.user.address,
        reason,
      },
    });
  } catch {
    // Already flagged by this user
    return NextResponse.json({ error: "Already flagged" }, { status: 409 });
  }

  // Increment flag count and auto-pause if threshold reached
  const updated = await prisma.sponsoredLink.update({
    where: { id },
    data: {
      flagCount: { increment: 1 },
      ...(ad.flagCount + 1 >= FLAG_THRESHOLD ? { isFlagged: true } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    flagCount: updated.flagCount,
    paused: updated.isFlagged,
  });
}
