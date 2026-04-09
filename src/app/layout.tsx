import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "EthTalk — Token-Gated Forum for Ethereum Holders",
  description:
    "A token-gated web forum for Ethereum holders. Connect your wallet, verify your balance, and join the conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,wght@0,400;0,500;1,400&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text font-sans">
        <WalletProvider>
          <Nav />
          <main className="flex-1">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
