import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const flagged = await prisma.sponsoredLink.findMany({
    where: { isFlagged: true, isActive: true },
    orderBy: { flagCount: "desc" },
    include: {
      flags: {
        select: {
          flaggerAddress: true,
          reason: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json(
    flagged.map((ad) => ({
      id: ad.id,
      title: ad.title,
      url: ad.url,
      domain: ad.domain,
      date: ad.date.toISOString(),
      buyerAddress: ad.buyerAddress,
      flagCount: ad.flagCount,
      flags: ad.flags.map((f) => ({
        flaggerAddress: f.flaggerAddress,
        reason: f.reason,
        createdAt: f.createdAt.toISOString(),
      })),
    }))
  );
}
