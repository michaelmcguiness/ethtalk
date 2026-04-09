import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  const user = await prisma.user.findUnique({
    where: { address },
    include: {
      _count: {
        select: { threads: true, posts: true },
      },
      threads: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          tag: true,
          createdAt: true,
        },
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          body: true,
          createdAt: true,
          thread: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    address: user.address,
    ensName: user.ensName,
    balanceTier: user.balanceTier,
    bio: user.bio,
    joinedAt: user.joinedAt.toISOString(),
    threadCount: user._count.threads,
    postCount: user._count.posts,
    recentThreads: user.threads.map((t) => ({
      id: t.id,
      title: t.title,
      tag: t.tag,
      createdAt: t.createdAt.toISOString(),
    })),
    recentPosts: user.posts.map((p) => ({
      id: p.id,
      body: p.body.slice(0, 200),
      createdAt: p.createdAt.toISOString(),
      thread: p.thread,
    })),
  });
}
