import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  let notificationCount = 0;
  if (session?.user?.id && session.user.role === "ENTREPRENEUR") {
    notificationCount = await prisma.application.count({
      where: {
        listing: { entrepreneurId: session.user.id },
        status: "pending",
      },
    });
  } else if (session?.user?.id && session.user.role === "HELPER") {
    notificationCount = await prisma.match.count({
      where: {
        application: { helperId: session.user.id },
        status: "scheduled",
      },
    });
  }

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: "#c4541a" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-white font-black text-xl sm:text-2xl tracking-widest uppercase">
              OneDayHand
            </span>
            <span className="text-white/70 text-[9px] font-semibold tracking-[0.25em] uppercase">
              Verbindt kantoor met klus
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 sm:gap-4">
            {session ? (
              <>
                <Link
                  href="/listings"
                  className="text-white/90 hover:text-white text-xs font-bold uppercase tracking-widest px-2 py-1.5 transition-colors hidden sm:block"
                >
                  Hulpvragen
                </Link>
                <Link
                  href="/matches"
                  className="text-white/90 hover:text-white text-xs font-bold uppercase tracking-widest px-2 py-1.5 transition-colors hidden sm:block"
                >
                  Matches
                </Link>
                <Link
                  href="/dashboard"
                  className="relative text-white/90 hover:text-white text-xs font-bold uppercase tracking-widest px-2 py-1.5 transition-colors hidden sm:block"
                >
                  Dashboard
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-white rounded-full" style={{ color: "#c4541a" }}>
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="ml-1 px-4 py-2 rounded-full bg-white font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors"
                  style={{ color: "#c4541a" }}
                >
                  {session.user.name?.split(" ")[0] ?? "Profiel"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white/90 hover:text-white text-xs font-bold uppercase tracking-widest px-3 py-2 transition-colors hidden sm:block"
                >
                  Inloggen
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 rounded-full bg-white font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors"
                  style={{ color: "#c4541a" }}
                >
                  Aanmelden
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
