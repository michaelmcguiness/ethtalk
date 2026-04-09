const AD_PRICE_USD = parseInt(process.env.AD_PRICE_USD || "5", 10);
const COINGECKO_API_URL =
  process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3";

let cachedPrice: { ethUsd: number; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchEthPrice(): Promise<number> {
  if (cachedPrice && Date.now() - cachedPrice.fetchedAt < CACHE_TTL) {
    return cachedPrice.ethUsd;
  }

  const res = await fetch(
    `${COINGECKO_API_URL}/simple/price?ids=ethereum&vs_currencies=usd`,
    { next: { revalidate: 300 } }
  );
  const data = await res.json();
  const ethUsd = data.ethereum.usd as number;

  cachedPrice = { ethUsd, fetchedAt: Date.now() };
  return ethUsd;
}

export async function getAdPriceInEth(): Promise<{
  priceWei: bigint;
  priceEth: string;
  ethUsdRate: number;
  priceUsd: number;
}> {
  const ethPrice = await fetchEthPrice();
  const priceInEth = AD_PRICE_USD / ethPrice;
  const priceWei = BigInt(Math.ceil(priceInEth * 1e18));
  return {
    priceWei,
    priceEth: priceInEth.toFixed(6),
    ethUsdRate: ethPrice,
    priceUsd: AD_PRICE_USD,
  };
}

export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function toDateUTC(date: Date | string): Date {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
