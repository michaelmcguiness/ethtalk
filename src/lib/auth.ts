import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "./db";
import { checkBalance, resolveENS } from "./ethereum";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      address: string;
      ensName?: string | null;
      balanceTier: number;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    address: string;
    ensName?: string | null;
    balanceTier: number;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) return null;

        try {
          const siwe = new SiweMessage(credentials.message);
          const result = await siwe.verify({ signature: credentials.signature });

          if (!result.success) return null;

          const address = siwe.address as `0x${string}`;

          // Check balance
          const { eligible, tier } = await checkBalance(address);
          if (!eligible) return null;

          // Resolve ENS
          const ensName = await resolveENS(address);

          // Upsert user
          const user = await prisma.user.upsert({
            where: { address },
            update: {
              lastVerifiedAt: new Date(),
              balanceTier: tier,
              ensName,
            },
            create: {
              address,
              ensName,
              balanceTier: tier,
            },
          });

          return {
            id: user.id,
            address: user.address,
            ensName: user.ensName,
            balanceTier: user.balanceTier,
            role: user.role,
          } as {
            id: string;
            address: string;
            ensName?: string | null;
            balanceTier: number;
            role: string;
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; address: string; ensName?: string | null; balanceTier: number; role: string };
        token.id = u.id;
        token.address = u.address;
        token.ensName = u.ensName;
        token.balanceTier = u.balanceTier;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        address: token.address,
        ensName: token.ensName,
        balanceTier: token.balanceTier,
        role: token.role,
      };
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
