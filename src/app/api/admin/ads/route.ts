import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ads = await prisma.sponsoredLink.findMany({
    orderBy: [{ isFlagged: "desc" }, { date: "desc" }],
    include: {
      _count: { select: { flags: true } },
    },
  });

  return NextResponse.json(
    ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      url: ad.url,
      domain: ad.domain,
      date: ad.date.toISOString(),
      isActive: ad.isActive,
      isFlagged: ad.isFlagged,
      flagCount: ad._count.flags,
      buyerAddress: ad.buyerAddress,
      impressions: ad.impressions,
      clicks: ad.clicks,
      pricePaidWei: ad.pricePaidWei,
      createdAt: ad.createdAt.toISOString(),
    }))
  );
}
