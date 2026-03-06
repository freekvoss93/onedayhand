import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "OneDayHand – Verbindt kantoor met klus",
  description: "Match als kantoorwerker met een praktische ondernemer voor 1 dag per week meehelpen.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="nl">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer style={{ backgroundColor: "#1a1208" }} className="mt-16">
            <div className="max-w-6xl mx-auto px-4 py-10 text-center">
              <p className="text-white font-black text-sm uppercase tracking-widest">OneDayHand</p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Verbindt kantoor met klus
              </p>
              <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                © {new Date().getFullYear()} OneDayHand
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
