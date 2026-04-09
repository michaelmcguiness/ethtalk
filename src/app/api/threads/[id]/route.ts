import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      author: {
        select: { address: true, ensName: true, balanceTier: true },
      },
      _count: { select: { threadVotes: true } },
      threadVotes: session
        ? { where: { userId: session.user.id }, take: 1 }
        : false,
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { address: true, ensName: true, balanceTier: true },
          },
          votes: true,
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // Increment view count
  await prisma.thread.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  // Calculate vote counts and user's votes for posts
  const posts = thread.posts.map((post) => {
    const voteCount = post.votes.reduce((sum, v) => sum + v.value, 0);
    const userVote = session
      ? post.votes.find((v) => v.userId === session.user.id)?.value ?? 0
      : 0;
    return {
      id: post.id,
      body: post.body,
      createdAt: post.createdAt.toISOString(),
      isEdited: post.isEdited,
      author: post.author,
      voteCount,
      userVote,
    };
  });

  return NextResponse.json({
    id: thread.id,
    title: thread.title,
    url: thread.url,
    body: thread.body,
    tag: thread.tag,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    isPinned: thread.isPinned,
    isLocked: thread.isLocked,
    viewCount: thread.viewCount + 1,
    upvotes: thread._count.threadVotes,
    userVoted: thread.threadVotes ? thread.threadVotes.length > 0 : false,
    author: thread.author,
    posts,
  });
}
