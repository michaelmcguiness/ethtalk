import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create seed users (fake addresses)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
      update: {},
      create: {
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        ensName: "vitalik.eth",
        balanceTier: 3,
        bio: "Ethereum co-founder. Interested in mechanism design, public goods, and decentralized governance.",
      },
    }),
    prisma.user.upsert({
      where: { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
      update: {},
      create: {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        ensName: "sassal.eth",
        balanceTier: 2,
        bio: "The Daily Gwei. All things Ethereum.",
      },
    }),
    prisma.user.upsert({
      where: { address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C" },
      update: {},
      create: {
        address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
        ensName: "punk6529.eth",
        balanceTier: 3,
      },
    }),
    prisma.user.upsert({
      where: { address: "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12" },
      update: {},
      create: {
        address: "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
        ensName: "hayden.eth",
        balanceTier: 3,
        bio: "Uniswap.",
      },
    }),
    prisma.user.upsert({
      where: { address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97" },
      update: {},
      create: {
        address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97",
        ensName: null,
        balanceTier: 1,
      },
    }),
    prisma.user.upsert({
      where: { address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
      update: {},
      create: {
        address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        ensName: "stani.eth",
        balanceTier: 2,
        bio: "Aave & Lens Protocol",
      },
    }),
    prisma.user.upsert({
      where: { address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B" },
      update: {},
      create: {
        address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
        ensName: null,
        balanceTier: 0,
      },
    }),
    prisma.user.upsert({
      where: { address: "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c" },
      update: {},
      create: {
        address: "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c",
        ensName: "lightclient.eth",
        balanceTier: 2,
        bio: "Geth core dev. EIP editor.",
      },
    }),
  ]);

  const [vitalik, sassal, punk6529, hayden, anon1, stani, anon2, lightclient] = users;

  function hoursAgo(h: number) {
    return new Date(Date.now() - h * 60 * 60 * 1000);
  }

  // --- Threads ---

  const thread1 = await prisma.thread.upsert({
    where: { id: "seed-thread-1" },
    update: {},
    create: {
      id: "seed-thread-1",
      title: "Pectra upgrade: what actually changes for solo stakers?",
      body: "With Pectra going live soon, I want to get a clear picture of what solo stakers need to do. The EIP list is long but most of the discussion has been about blob throughput.\n\nFor solo stakers specifically:\n- EIP-7251 raises the max effective balance to 2048 ETH. Does this mean we can consolidate validators?\n- EIP-7002 adds execution layer triggerable exits. How does this change the withdrawal flow?\n- Any changes to hardware requirements?\n\nWould love to hear from other solo stakers who've been following the specs closely.",
      tag: "PROTOCOL",
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(1),
      authorId: vitalik.id,
      viewCount: 342,
    },
  });

  const thread2 = await prisma.thread.upsert({
    where: { id: "seed-thread-2" },
    update: {},
    create: {
      id: "seed-thread-2",
      title: "Best L2 for deploying a new DEX in 2026?",
      body: "Building a perpetuals DEX and trying to decide where to deploy. The landscape has changed a lot in the past year.\n\nMy priorities:\n1. Low latency (sub-second confirmations)\n2. Good liquidity bridging from mainnet\n3. Developer tooling that doesn't suck\n4. Enough users to bootstrap initial volume\n\nI've been looking at Base, Arbitrum, and a few of the newer zkEVM chains. Base has the distribution but Arbitrum has the DeFi ecosystem. Thoughts?",
      tag: "L2S",
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(2),
      authorId: anon1.id,
      viewCount: 187,
    },
  });

  const thread3 = await prisma.thread.upsert({
    where: { id: "seed-thread-3" },
    update: {},
    create: {
      id: "seed-thread-3",
      title: "Unpopular opinion: ETH staking yield is fine as-is",
      body: "I keep seeing people complain that ETH staking yields are too low at ~3.5%. Here's why I think they're actually fine:\n\n1. **It's real yield** — not inflationary token emissions, actual network revenue\n2. **Risk-adjusted it's excellent** — compare to T-bills minus smart contract risk\n3. **The low yield is a feature** — it means the network is secure without overpaying for security\n4. **Restaking is the answer** — if you want more yield, take more risk via EigenLayer etc.\n\nThe people who want 10%+ yields should go farm on DeFi, not demand the base layer subsidize higher returns. The base layer should be boring and safe.",
      tag: "DEFI",
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(4),
      authorId: sassal.id,
      viewCount: 523,
    },
  });

  const thread4 = await prisma.thread.upsert({
    where: { id: "seed-thread-4" },
    update: {},
    create: {
      id: "seed-thread-4",
      title: "Solidity vs Vyper in 2026 — has the gap closed?",
      body: "Curious what the current state of Vyper adoption looks like. A year ago it felt like Vyper was gaining momentum after the Curve audits brought more attention to it.\n\nHas anyone switched their stack from Solidity to Vyper for new projects? What's the tooling like now compared to Foundry/Hardhat?",
      tag: "DEV",
      createdAt: hoursAgo(14),
      updatedAt: hoursAgo(5),
      authorId: anon2.id,
      viewCount: 156,
    },
  });

  const thread5 = await prisma.thread.upsert({
    where: { id: "seed-thread-5" },
    update: {},
    create: {
      id: "seed-thread-5",
      title: "Welcome to EthTalk — introduce yourself",
      body: "Hey everyone, welcome to EthTalk. This is a space for people with skin in the game to discuss Ethereum.\n\nDrop a reply and introduce yourself — what got you into ETH, what are you working on, what do you want to see discussed here?",
      tag: "GENERAL",
      isPinned: true,
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(1),
      authorId: vitalik.id,
      viewCount: 1247,
    },
  });

  const thread6 = await prisma.thread.upsert({
    where: { id: "seed-thread-6" },
    update: {},
    create: {
      id: "seed-thread-6",
      title: "EIP-4844 one year later: did blobs deliver?",
      url: "https://ethereum.org/en/roadmap/danksharding/",
      body: "",
      tag: "PROTOCOL",
      createdAt: hoursAgo(8),
      updatedAt: hoursAgo(3),
      authorId: lightclient.id,
      viewCount: 289,
    },
  });

  const thread7 = await prisma.thread.upsert({
    where: { id: "seed-thread-7" },
    update: {},
    create: {
      id: "seed-thread-7",
      title: "The case for Ethereum as the global settlement layer",
      url: "https://ethereum.org/en/roadmap/",
      body: "",
      tag: "PROTOCOL",
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(8),
      authorId: punk6529.id,
      viewCount: 891,
    },
  });

  const thread8 = await prisma.thread.upsert({
    where: { id: "seed-thread-8" },
    update: {},
    create: {
      id: "seed-thread-8",
      title: "Uniswap v4 hooks: what's everyone building?",
      body: "v4 hooks are live and I'm seeing some interesting experiments. Drop what you're building or what hook ideas you want to see.\n\nI'm working on a dynamic fee hook that adjusts based on realized volatility of the pair. Early results are promising — LPs are getting better returns on volatile pairs.",
      tag: "DEFI",
      createdAt: hoursAgo(12),
      updatedAt: hoursAgo(3),
      authorId: hayden.id,
      viewCount: 445,
    },
  });

  const thread9 = await prisma.thread.upsert({
    where: { id: "seed-thread-9" },
    update: {},
    create: {
      id: "seed-thread-9",
      title: "What's your cold storage setup in 2026?",
      body: "Time to refresh my security setup. Currently using a Ledger Nano X with a steel seed backup.\n\nConsidering:\n- Multisig (Safe) for larger holdings\n- Distributed seed phrase backups (Shamir's)\n- Hardware wallet alternatives to Ledger\n\nWhat's everyone using? Especially interested in setups for 10+ ETH holders who aren't running institutions.",
      tag: "GENERAL",
      createdAt: hoursAgo(16),
      updatedAt: hoursAgo(6),
      authorId: anon1.id,
      viewCount: 312,
    },
  });

  const thread10 = await prisma.thread.upsert({
    where: { id: "seed-thread-10" },
    update: {},
    create: {
      id: "seed-thread-10",
      title: "Foundry tips that saved me hours this week",
      body: "Sharing some Foundry tricks I've picked up:\n\n**1. Fork testing with labels**\n```\nforge test --fork-url $RPC -vvv --match-test testSwap\n```\nUse `vm.label(address, \"USDC\")` to make traces readable.\n\n**2. Gas snapshots for CI**\n```\nforge snapshot --diff\n```\nCatch gas regressions in PRs.\n\n**3. Script broadcasting**\nUse `vm.startBroadcast()` in scripts instead of raw `cast send`. You get simulation + gas estimation for free.\n\n**4. Fuzz with bounds**\n```solidity\nfunction testDeposit(uint256 amount) public {\n    amount = bound(amount, 1e18, 100e18);\n    // ...\n}\n```\nWay more useful than unbounded fuzzing.\n\nDrop your own tips below.",
      tag: "DEV",
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(2),
      authorId: lightclient.id,
      viewCount: 234,
    },
  });

  // --- Comments (Posts) ---

  // Thread 1 comments
  await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      body: "The validator consolidation is the big one for solo stakers. Right now if you're running 2+ validators you need separate keys, separate deposits, separate monitoring. With EIP-7251 you can consolidate into one validator with a higher balance.\n\nThe execution layer exits (EIP-7002) are huge too — you can trigger a withdrawal from a smart contract, which opens up trustless staking pools without the current withdrawal credential complexity.",
      createdAt: hoursAgo(2.5),
      authorId: lightclient.id,
      threadId: thread1.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      body: "Hardware requirements shouldn't change meaningfully. The blob target increase is the main resource impact and that's more about bandwidth than CPU/storage for validators.\n\nThe bigger question is whether the increased max balance changes the economics enough to make consolidation worthwhile given the gas cost of the consolidation transaction itself.",
      createdAt: hoursAgo(2),
      authorId: sassal.id,
      threadId: thread1.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-3" },
    update: {},
    create: {
      id: "seed-post-3",
      body: "Solo staker here running 3 validators. I'll consolidate day one. The operational overhead of managing 3 separate validator keys is annoying even with systemd services. One validator at 96 ETH effective balance is much cleaner.",
      createdAt: hoursAgo(1.5),
      authorId: anon1.id,
      threadId: thread1.id,
    },
  });

  // Thread 2 comments
  await prisma.post.upsert({
    where: { id: "seed-post-4" },
    update: {},
    create: {
      id: "seed-post-4",
      body: "Base if you want users, Arbitrum if you want DeFi composability. For a perps DEX specifically, I'd lean Arbitrum — GMX, Gains, Vertex are all there and users already have habits around trading on Arbitrum.\n\nBase has more retail users but they're mostly doing memecoin stuff, not sophisticated DeFi.",
      createdAt: hoursAgo(5),
      authorId: stani.id,
      threadId: thread2.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-5" },
    update: {},
    create: {
      id: "seed-post-5",
      body: "Have you looked at any of the app-specific rollups? If you're building a perps DEX, something like a dedicated rollup with a custom sequencer could give you the latency you want without competing for blockspace with other apps.",
      createdAt: hoursAgo(4),
      authorId: hayden.id,
      threadId: thread2.id,
    },
  });

  // Thread 3 comments
  await prisma.post.upsert({
    where: { id: "seed-post-6" },
    update: {},
    create: {
      id: "seed-post-6",
      body: "Agree on all points. People comparing ETH staking to DeFi yields are comparing apples to oranges. ETH staking is the risk-free rate of the Ethereum economy. Everything else is risk premium on top.\n\nThe fact that it's \"only\" 3.5% is a sign of a mature, well-functioning system.",
      createdAt: hoursAgo(9),
      authorId: punk6529.id,
      threadId: thread3.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-7" },
    update: {},
    create: {
      id: "seed-post-7",
      body: "Counter: the low yield makes solo staking economically irrational for most people when you factor in hardware costs, electricity, and the opportunity cost of locked capital. This pushes staking toward Lido and other LSTs, which is a centralization vector.\n\nI'm not saying we need 10%, but the current level might be below the threshold where decentralized staking is viable long-term.",
      createdAt: hoursAgo(8),
      authorId: anon2.id,
      threadId: thread3.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-8" },
    update: {},
    create: {
      id: "seed-post-8",
      body: "The hardware costs argument doesn't hold up if you're already running a home server. My staking box cost $500 3 years ago and it's been printing ETH ever since. Electricity is like $5/month.\n\nThe real barrier to solo staking is the 32 ETH minimum, not the yield.",
      createdAt: hoursAgo(7),
      authorId: anon1.id,
      threadId: thread3.id,
    },
  });

  // Thread 5 comments (welcome thread)
  await prisma.post.upsert({
    where: { id: "seed-post-9" },
    update: {},
    create: {
      id: "seed-post-9",
      body: "Been in ETH since 2017. Working on DeFi infrastructure — specifically oracle networks and cross-chain messaging. Excited to see a forum that requires actual skin in the game to participate.",
      createdAt: hoursAgo(40),
      authorId: stani.id,
      threadId: thread5.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-10" },
    update: {},
    create: {
      id: "seed-post-10",
      body: "Smart contract developer here. Mostly Solidity, some Vyper. Building out MEV protection tooling. The token-gating is a nice filter — looking forward to discussions that aren't 99% noise.",
      createdAt: hoursAgo(36),
      authorId: anon2.id,
      threadId: thread5.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-11" },
    update: {},
    create: {
      id: "seed-post-11",
      body: "Long-time lurker on CT, first time posting in a proper forum. Solo staking since the merge. Interested in protocol development and governance discussions that go deeper than tweet threads.",
      createdAt: hoursAgo(24),
      authorId: anon1.id,
      threadId: thread5.id,
    },
  });

  // Thread 8 comments
  await prisma.post.upsert({
    where: { id: "seed-post-12" },
    update: {},
    create: {
      id: "seed-post-12",
      body: "Working on a TWAP hook that lets LPs set custom time-weighted average price orders. Basically turning LP positions into gradual DCA orders. The hook interface is surprisingly clean — Uniswap team did a great job with the architecture.",
      createdAt: hoursAgo(10),
      authorId: stani.id,
      threadId: thread8.id,
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-13" },
    update: {},
    create: {
      id: "seed-post-13",
      body: "The dynamic fee idea is really interesting. Have you looked at how Ambient (formerly CrocSwap) handles this? They have a similar concept but baked into the AMM itself rather than as a hook.\n\nI'd be curious to see how the gas overhead of the hook compares to a native implementation.",
      createdAt: hoursAgo(8),
      authorId: lightclient.id,
      threadId: thread8.id,
    },
  });

  // Thread 10 comments
  await prisma.post.upsert({
    where: { id: "seed-post-14" },
    update: {},
    create: {
      id: "seed-post-14",
      body: "Adding to the fuzz testing tip — `forge coverage` with `--ir-minimum` is great for finding untested branches in your fuzz campaigns. Run it after a fuzzing session to see what you're missing.\n\nAlso `forge doc` is underrated for generating docs from NatSpec comments.",
      createdAt: hoursAgo(4),
      authorId: anon2.id,
      threadId: thread10.id,
    },
  });

  // --- Thread Votes ---

  const voteData = [
    // Thread 1 votes (Pectra upgrade) — popular
    { userId: sassal.id, threadId: thread1.id },
    { userId: punk6529.id, threadId: thread1.id },
    { userId: hayden.id, threadId: thread1.id },
    { userId: anon1.id, threadId: thread1.id },
    { userId: stani.id, threadId: thread1.id },
    { userId: lightclient.id, threadId: thread1.id },
    { userId: anon2.id, threadId: thread1.id },
    // Thread 2 votes
    { userId: stani.id, threadId: thread2.id },
    { userId: hayden.id, threadId: thread2.id },
    { userId: anon2.id, threadId: thread2.id },
    // Thread 3 votes (staking yield — controversial, lots of votes)
    { userId: vitalik.id, threadId: thread3.id },
    { userId: punk6529.id, threadId: thread3.id },
    { userId: hayden.id, threadId: thread3.id },
    { userId: anon1.id, threadId: thread3.id },
    { userId: stani.id, threadId: thread3.id },
    // Thread 4 votes
    { userId: lightclient.id, threadId: thread4.id },
    { userId: anon1.id, threadId: thread4.id },
    // Thread 5 votes (welcome — lots)
    { userId: sassal.id, threadId: thread5.id },
    { userId: punk6529.id, threadId: thread5.id },
    { userId: hayden.id, threadId: thread5.id },
    { userId: anon1.id, threadId: thread5.id },
    { userId: stani.id, threadId: thread5.id },
    { userId: anon2.id, threadId: thread5.id },
    { userId: lightclient.id, threadId: thread5.id },
    // Thread 6 votes
    { userId: vitalik.id, threadId: thread6.id },
    { userId: sassal.id, threadId: thread6.id },
    { userId: punk6529.id, threadId: thread6.id },
    { userId: anon1.id, threadId: thread6.id },
    // Thread 7 votes
    { userId: vitalik.id, threadId: thread7.id },
    { userId: sassal.id, threadId: thread7.id },
    { userId: hayden.id, threadId: thread7.id },
    { userId: stani.id, threadId: thread7.id },
    { userId: lightclient.id, threadId: thread7.id },
    { userId: anon1.id, threadId: thread7.id },
    // Thread 8 votes
    { userId: vitalik.id, threadId: thread8.id },
    { userId: sassal.id, threadId: thread8.id },
    { userId: punk6529.id, threadId: thread8.id },
    { userId: anon1.id, threadId: thread8.id },
    { userId: lightclient.id, threadId: thread8.id },
    // Thread 9 votes
    { userId: sassal.id, threadId: thread9.id },
    { userId: anon2.id, threadId: thread9.id },
    { userId: stani.id, threadId: thread9.id },
    // Thread 10 votes
    { userId: vitalik.id, threadId: thread10.id },
    { userId: hayden.id, threadId: thread10.id },
    { userId: anon1.id, threadId: thread10.id },
    { userId: stani.id, threadId: thread10.id },
  ];

  for (const vote of voteData) {
    await prisma.threadVote.upsert({
      where: {
        userId_threadId: { userId: vote.userId, threadId: vote.threadId },
      },
      update: {},
      create: vote,
    });
  }

  console.log("Seeded 8 users, 10 threads, 14 comments, and 44 votes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
