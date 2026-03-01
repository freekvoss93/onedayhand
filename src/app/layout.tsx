import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "OneDayHand – Verbindt kantoor met klus",
  description:
    "Match als kantoorwerker met een praktische ondernemer voor 1 dag per week meehelpen.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="nl">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-gray-200 bg-white mt-16">
            <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} OneDayHand · Verbindt kantoor met klus
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
