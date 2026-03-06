import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateShort } from "@/lib/utils";
import { StatusBadge, IntensityBadge } from "@/components/ui/Badge";
import { getDayLabel, getTradeLabel } from "@/lib/constants";
import Link from "next/link";

// Re-export parseDays from constants compatibility
function parseDaysLocal(json: string): string[] {
  try { return JSON.parse(json); } catch { return []; }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  if (!session.user.role) redirect("/onboarding/role");

  const isHelper = session.user.role === "HELPER";

  if (isHelper) {
    return <HelperDashboard userId={session.user.id} userName={session.user.name} />;
  } else {
    return <EntrepreneurDashboard userId={session.user.id} userName={session.user.name} />;
  }
}

async function HelperDashboard({ userId, userName }: { userId: string; userName?: string | null }) {
  const profile = await prisma.profileHelper.findUnique({ where: { userId } });

  const matches = await prisma.match.findMany({
    where: { application: { helperId: userId } },
    include: {
      application: {
        include: {
          listing: {
            include: { entrepreneur: { include: { profileEntrepreneur: true } } },
          },
        },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { scheduledDate: "asc" },
    take: 5,
  });

  const pendingApps = await prisma.application.count({
    where: { helperId: userId, status: "pending" },
  });

  const myApplicationIds = await prisma.application.findMany({
    where: { helperId: userId },
    select: { listingId: true },
  });
  const appliedListingIds = myApplicationIds.map((a) => a.listingId);

  // Suggested listings based on profile
  const suggestions = profile
    ? await prisma.listing.findMany({
        where: {
          isActive: true,
          city: { contains: profile.city },
          id: { notIn: appliedListingIds },
        },
        include: {
          entrepreneur: { include: { profileEntrepreneur: true } },
        },
        take: 3,
      })
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Welkom, {userName?.split(" ")[0] ?? "helper"}! 👋</h1>
          <p className="text-gray-600 mt-1">Jouw kantoorwerker dashboard</p>
        </div>
        {!profile && (
          <Link
            href="/onboarding/profile"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Profiel aanvullen →
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Matches</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600">{pendingApps}</div>
          <div className="text-sm text-gray-500 mt-0.5">Openstaand</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {profile?.city ?? "–"}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Jouw stad</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {profile ? parseDaysLocal(profile.availabilityDays).map(getDayLabel).join(", ").split(",")[0] : "–"}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Beschikbaar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Aankomende matches</h2>
            <Link href="/matches" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
              Alle matches →
            </Link>
          </div>
          {matches.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 text-sm">Nog geen matches.</p>
              <Link
                href="/listings"
                className="mt-2 inline-block text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}
              >
                Browse hulpvragen →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-sm transition-shadow block"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {match.application.listing.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateShort(match.scheduledDate)} ·{" "}
                      {match.application.listing.city}
                    </p>
                  </div>
                  <StatusBadge status={match.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Suggested listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Aanbevolen voor jou</h2>
            <Link href="/listings" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
              Alle hulpvragen →
            </Link>
          </div>
          {suggestions.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 text-sm">Geen aanbevelingen op dit moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="card p-4 hover:shadow-sm transition-shadow block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {listing.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {listing.entrepreneur.profileEntrepreneur
                          ? getTradeLabel(listing.entrepreneur.profileEntrepreneur.tradeType)
                          : ""}{" "}
                        · {listing.city}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {parseDaysLocal(listing.dayOptions)
                          .slice(0, 2)
                          .map((d) => (
                            <span
                              key={d}
                              className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded"
                            >
                              {getDayLabel(d)}
                            </span>
                          ))}
                      </div>
                    </div>
                    <IntensityBadge intensity={listing.intensity} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function EntrepreneurDashboard({
  userId,
  userName,
}: {
  userId: string;
  userName?: string | null;
}) {
  const profile = await prisma.profileEntrepreneur.findUnique({ where: { userId } });

  const listings = await prisma.listing.findMany({
    where: { entrepreneurId: userId },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
      applications: {
        where: { status: "pending" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPending = listings.reduce((s, l) => s + l.applications.length, 0);

  const recentMatches = await prisma.match.findMany({
    where: { application: { listing: { entrepreneurId: userId } } },
    include: {
      application: {
        include: {
          helper: { select: { name: true } },
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { scheduledDate: "asc" },
    take: 5,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">
            Welkom, {profile?.companyName ?? userName?.split(" ")[0] ?? "ondernemer"}! 🔨
          </h1>
          <p className="text-gray-600 mt-1">Jouw ondernemersdashboard</p>
        </div>
        <Link
          href="/listings/new"
          className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          + Nieuwe hulpvraag
        </Link>
      </div>

      {/* Notification banner */}
      {totalPending > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <p className="text-orange-800 font-medium">
              Je hebt {totalPending} nieuwe aanvra{totalPending === 1 ? "ag" : "gen"} te bekijken
            </p>
          </div>
          <Link
            href="/listings"
            className="text-sm text-orange-700 hover:underline font-medium"
          >
            Bekijken →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Hulpvragen</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-orange-600">{totalPending}</div>
          <div className="text-sm text-gray-500 mt-0.5">Nieuwe aanvragen</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-brand-500">{recentMatches.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Matches</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-gray-900">
            {listings.filter((l) => l.isActive).length}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">Actieve vragen</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Mijn hulpvragen</h2>
            <Link href="/listings/new" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
              + Nieuwe vraag
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Nog geen hulpvragen geplaatst.</p>
              <Link
                href="/listings/new"
                className="inline-block px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Eerste hulpvraag plaatsen
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-sm transition-shadow block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {listing.title}
                      </p>
                      {!listing.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Inactief
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{listing.city}</p>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    {listing.applications.length > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-500 rounded-full">
                        {listing.applications.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Aankomende werkdagen</h2>
            <Link href="/matches" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
              Alle matches →
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-500 text-sm">Nog geen matches.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="card p-4 flex items-center justify-between hover:shadow-sm transition-shadow block"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {match.application.listing.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {match.application.helper.name} · {formatDateShort(match.scheduledDate)}
                    </p>
                  </div>
                  <StatusBadge status={match.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
