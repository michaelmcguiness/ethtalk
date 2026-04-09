import { NextResponse } from "next/server";
import { getAdPriceInEth } from "@/lib/pricing";

export async function GET() {
  try {
    const price = await getAdPriceInEth();
    return NextResponse.json({
      priceWei: price.priceWei.toString(),
      priceEth: price.priceEth,
      ethUsdRate: price.ethUsdRate,
      priceUsd: price.priceUsd,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch ETH price" },
      { status: 500 }
    );
  }
}
