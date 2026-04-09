import { createPublicClient, http, formatEther } from "viem";
import { mainnet } from "viem/chains";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_RPC_URL),
});

export async function checkBalance(address: `0x${string}`) {
  const balance = await publicClient.getBalance({ address });
  const ethBalance = parseFloat(formatEther(balance));
  return {
    eligible: ethBalance >= 0.1,
    tier: ethBalance >= 100 ? 3 : ethBalance >= 10 ? 2 : ethBalance >= 1 ? 1 : 0,
    balance: ethBalance,
  };
}

export async function resolveENS(address: `0x${string}`) {
  try {
    const name = await publicClient.getEnsName({ address });
    return name;
  } catch {
    return null;
  }
}
