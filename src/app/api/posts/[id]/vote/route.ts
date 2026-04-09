import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { value } = body;

  if (value !== 1 && value !== -1 && value !== 0) {
    return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (value === 0) {
    // Remove vote
    await prisma.vote.deleteMany({
      where: { userId: session.user.id, postId },
    });
  } else {
    // Upsert vote
    await prisma.vote.upsert({
      where: {
        userId_postId: { userId: session.user.id, postId },
      },
      update: { value },
      create: {
        value,
        userId: session.user.id,
        postId,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
