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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span className="font-bold text-gray-900 text-lg">OneDayHand</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {session ? (
              <>
                <Link
                  href="/listings"
                  className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Hulpvragen
                </Link>
                <Link
                  href="/matches"
                  className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Matches
                </Link>
                <Link
                  href="/dashboard"
                  className="relative text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {session.user.name?.split(" ")[0] ?? "Profiel"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
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
