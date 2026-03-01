import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateShort } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const isHelper = session.user.role === "HELPER";

  let matches: {
    id: string;
    scheduledDate: Date;
    status: string;
    application: {
      preferredDay: string;
      listing: { title: string; city: string; entrepreneurId: string; entrepreneur: { name: string | null } };
      helper: { name: string | null };
    };
    _count: { messages: number; reviews: number };
  }[] = [];

  if (isHelper) {
    matches = await prisma.match.findMany({
      where: { application: { helperId: session.user.id } },
      include: {
        application: {
          include: {
            listing: {
              include: { entrepreneur: { select: { name: true } } },
            },
            helper: { select: { name: true } },
          },
        },
        _count: { select: { messages: true, reviews: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });
  } else {
    matches = await prisma.match.findMany({
      where: { application: { listing: { entrepreneurId: session.user.id } } },
      include: {
        application: {
          include: {
            listing: {
              include: { entrepreneur: { select: { name: true } } },
            },
            helper: { select: { name: true } },
          },
        },
        _count: { select: { messages: true, reviews: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });
  }

  // Also show pending/rejected applications for helpers
  const applications = isHelper
    ? await prisma.application.findMany({
        where: { helperId: session.user.id, status: { not: "accepted" } },
        include: {
          listing: { select: { id: true, title: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="page-title mb-8">Mijn matches & aanvragen</h1>

      {/* Matches */}
      <section className="mb-10">
        <h2 className="section-title mb-4">Matches ({matches.length})</h2>
        {matches.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-3">🤝</div>
            <p className="text-gray-600">Nog geen matches.</p>
            {isHelper && (
              <Link href="/listings" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Browse hulpvragen →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {match.application.listing.title}
                    </h3>
                    <StatusBadge status={match.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {isHelper
                      ? `Ondernemer: ${match.application.listing.entrepreneur.name ?? "?"}`
                      : `Helper: ${match.application.helper.name ?? "?"}`}
                    {" · "}
                    {match.application.listing.city}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Gepland op {formatDateShort(match.scheduledDate)}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 text-right">
                  <div className="text-xs text-gray-400">
                    {match._count.messages} berichten
                  </div>
                  {match._count.reviews < 2 && match.status === "scheduled" && (
                    <div className="text-xs text-orange-500 mt-0.5">Review verwacht</div>
                  )}
                  <div className="text-blue-600 text-sm mt-1">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pending/rejected applications for helpers */}
      {isHelper && applications.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Openstaande aanvragen</h2>
          <div className="space-y-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/listings/${app.listingId}`}
                className="card p-4 flex items-center justify-between hover:shadow-sm transition-shadow block"
              >
                <div>
                  <p className="font-medium text-gray-900">{app.listing.title}</p>
                  <p className="text-sm text-gray-500">{app.listing.city}</p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
