import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function hnScore(upvotes: number, createdAt: Date): number {
  const hours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return upvotes / Math.pow(hours + 2, 1.8);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get("tag");
  const cursor = searchParams.get("cursor");
  const take = 30;

  const session = await getServerSession(authOptions);

  const where = tag ? { tag: tag as never } : {};

  const threads = await prisma.thread.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200, // fetch a pool to rank
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: { address: true, ensName: true, balanceTier: true },
      },
      _count: { select: { posts: true, threadVotes: true } },
      threadVotes: session
        ? { where: { userId: session.user.id }, take: 1 }
        : false,
    },
  });

  // Rank by HN algorithm
  const ranked = threads
    .map((t) => ({
      id: t.id,
      title: t.title,
      url: t.url,
      tag: t.tag,
      createdAt: t.createdAt.toISOString(),
      isPinned: t.isPinned,
      upvotes: t._count.threadVotes,
      commentCount: t._count.posts,
      author: t.author,
      userVoted: t.threadVotes ? t.threadVotes.length > 0 : false,
      score: hnScore(t._count.threadVotes, t.createdAt),
    }))
    .sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.score - a.score;
    })
    .slice(0, take);

  return NextResponse.json(ranked);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, url, tag } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (title.length > 500) {
    return NextResponse.json({ error: "Title too long (max 500 chars)" }, { status: 400 });
  }

  // Link posts need a URL, text posts need a body
  if (!url && !content) {
    return NextResponse.json({ error: "URL or body is required" }, { status: 400 });
  }

  if (content && content.length > 10000) {
    return NextResponse.json({ error: "Body too long (max 10000 chars)" }, { status: 400 });
  }

  const validTags = ["PROTOCOL", "DEFI", "L2S", "DEV", "GENERAL"];
  if (tag && !validTags.includes(tag)) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  // Rate limit: 1 thread per 10 minutes
  const recentThread = await prisma.thread.findFirst({
    where: {
      authorId: session.user.id,
      createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });

  if (recentThread) {
    return NextResponse.json(
      { error: "Rate limit: you can create one thread every 10 minutes" },
      { status: 429 }
    );
  }

  const thread = await prisma.thread.create({
    data: {
      title,
      body: content || "",
      url: url || null,
      tag: tag || null,
      authorId: session.user.id,
    },
  });

  // Auto-upvote own submission
  await prisma.threadVote.create({
    data: {
      userId: session.user.id,
      threadId: thread.id,
    },
  });

  return NextResponse.json({ id: thread.id }, { status: 201 });
}
