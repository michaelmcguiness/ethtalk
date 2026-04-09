import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // Toggle: if already voted, remove. Otherwise, add.
  const existing = await prisma.threadVote.findUnique({
    where: { userId_threadId: { userId: session.user.id, threadId } },
  });

  if (existing) {
    await prisma.threadVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.threadVote.create({
      data: { userId: session.user.id, threadId },
    });
  }

  const count = await prisma.threadVote.count({ where: { threadId } });

  return NextResponse.json({ ok: true, upvotes: count, voted: !existing });
}
