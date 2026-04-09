import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (thread.isLocked) {
    return NextResponse.json({ error: "Thread is locked" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || content.length > 10000) {
    return NextResponse.json(
      { error: "Post body required (max 10000 chars)" },
      { status: 400 }
    );
  }

  // Rate limit: 10 posts per 10 minutes
  const recentPosts = await prisma.post.count({
    where: {
      authorId: session.user.id,
      createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });

  if (recentPosts >= 10) {
    return NextResponse.json(
      { error: "Rate limit: max 10 posts per 10 minutes" },
      { status: 429 }
    );
  }

  const post = await prisma.post.create({
    data: {
      body: content,
      authorId: session.user.id,
      threadId: id,
    },
    include: {
      author: {
        select: { address: true, ensName: true, balanceTier: true },
      },
    },
  });

  // Update thread's updatedAt
  await prisma.thread.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(
    {
      id: post.id,
      body: post.body,
      createdAt: post.createdAt.toISOString(),
      isEdited: false,
      author: post.author,
      voteCount: 0,
      userVote: 0,
    },
    { status: 201 }
  );
}
