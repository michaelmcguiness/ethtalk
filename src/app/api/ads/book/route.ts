import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publicClient } from "@/lib/ethereum";
import { getAdPriceInEth, toDateUTC, getTodayUTC } from "@/lib/pricing";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, title, url, txHash } = body;

  if (!date || !title || !url || !txHash) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (title.length > 100) {
    return NextResponse.json(
      { error: "Title too long (max 100 chars)" },
      { status: 400 }
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Check date is within allowed range
  const bookingDate = toDateUTC(date);
  const today = getTodayUTC();
  const maxDays = parseInt(process.env.AD_MAX_ADVANCE_DAYS || "30", 10);
  const maxDate = new Date(today);
  maxDate.setUTCDate(maxDate.getUTCDate() + maxDays);

  if (bookingDate < today) {
    return NextResponse.json({ error: "Cannot book past dates" }, { status: 400 });
  }
  if (bookingDate >= maxDate) {
    return NextResponse.json(
      { error: `Cannot book more than ${maxDays} days in advance` },
      { status: 400 }
    );
  }

  // Check buyer reputation (2+ flagged ads = blocked)
  const flaggedCount = await prisma.sponsoredLink.count({
    where: {
      buyerAddress: session.user.address,
      isFlagged: true,
    },
  });
  if (flaggedCount >= 2) {
    return NextResponse.json(
      { error: "Your account requires admin approval for ad bookings due to prior flags" },
      { status: 403 }
    );
  }

  // Verify payment on-chain
  const price = await getAdPriceInEth();
  const treasuryWallet = process.env.TREASURY_WALLET;
  if (!treasuryWallet) {
    return NextResponse.json(
      { error: "Treasury wallet not configured" },
      { status: 500 }
    );
  }

  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== "success") {
      return NextResponse.json(
        { error: "Transaction failed on-chain" },
        { status: 400 }
      );
    }

    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    if (tx.to?.toLowerCase() !== treasuryWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Payment was not sent to the correct address" },
        { status: 400 }
      );
    }

    // Allow 5% slippage
    const minAccepted = (price.priceWei * BigInt(95)) / BigInt(100);
    if (tx.value < minAccepted) {
      return NextResponse.json(
        { error: "Insufficient payment amount" },
        { status: 400 }
      );
    }

    // Create the sponsored link
    try {
      const sponsoredLink = await prisma.sponsoredLink.create({
        data: {
          title,
          url,
          domain: extractDomain(url),
          date: bookingDate,
          buyerAddress: session.user.address,
          txHash,
          pricePaidWei: tx.value.toString(),
        },
      });

      return NextResponse.json({ id: sponsoredLink.id }, { status: 201 });
    } catch (e: unknown) {
      // Unique constraint violation = date already booked
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        e.code === "P2002"
      ) {
        // Queue refund
        await prisma.pendingRefund.create({
          data: {
            txHash,
            buyerAddress: session.user.address,
            amountWei: tx.value.toString(),
            reason: "Date was booked by another user (race condition)",
          },
        });

        return NextResponse.json(
          {
            error:
              "This date was just booked by someone else. Your payment has been queued for a refund.",
          },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 400 }
    );
  }
}
