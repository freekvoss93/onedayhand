import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDays, computeMatchScore } from "@/lib/utils";
import { getDayLabel, getTradeLabel } from "@/lib/constants";
import { IntensityBadge } from "@/components/ui/Badge";
import Link from "next/link";

interface SearchParams {
  city?: string;
  day?: string;
  intensity?: string;
  trade?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);

  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
      ...(sp.city
        ? { city: { contains: sp.city } }
        : {}),
      ...(sp.intensity ? { intensity: sp.intensity } : {}),
    },
    include: {
      entrepreneur: {
        include: { profileEntrepreneur: true },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter by day if specified
  let filtered = listings.filter((l) => {
    if (!sp.day) return true;
    const days = parseDays(l.dayOptions);
    return days.includes(sp.day);
  });

  // Filter by trade type
  if (sp.trade) {
    filtered = filtered.filter(
      (l) => l.entrepreneur.profileEntrepreneur?.tradeType === sp.trade
    );
  }

  // Compute match scores for logged-in helpers
  let helperProfile: { city: string; availabilityDays: string; intensityPreference: string } | null = null;
  if (session?.user?.role === "HELPER") {
    helperProfile = await prisma.profileHelper.findUnique({
      where: { userId: session.user.id },
      select: { city: true, availabilityDays: true, intensityPreference: true },
    });
  }

  const scored = filtered.map((listing) => {
    let score = 0;
    if (helperProfile) {
      score = computeMatchScore({
        helperCity: helperProfile.city,
        listingCity: listing.city,
        helperDays: parseDays(helperProfile.availabilityDays),
        listingDays: parseDays(listing.dayOptions),
        helperIntensity: helperProfile.intensityPreference,
        listingIntensity: listing.intensity,
      });
    }
    return { ...listing, score };
  });

  if (helperProfile) {
    scored.sort((a, b) => b.score - a.score);
  }

  const TRADE_TYPES = [
    { value: "flooring", label: "Vloerleggen" },
    { value: "painting", label: "Schilderen" },
    { value: "plumbing", label: "Loodgieterswerk" },
    { value: "electrical", label: "Elektra" },
    { value: "carpentry", label: "Timmeren" },
    { value: "roofing", label: "Dakdekken" },
    { value: "general", label: "Algemeen klus" },
    { value: "landscaping", label: "Tuinieren" },
    { value: "cleaning", label: "Schoonmaak" },
    { value: "moving", label: "Verhuizen" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Hulpvragen</h1>
          <p className="text-gray-600 mt-1">
            {scored.length} hulpvra{scored.length === 1 ? "ag" : "gen"} beschikbaar
            {helperProfile && " · gesorteerd op match score"}
          </p>
        </div>
        {session?.user?.role === "ENTREPRENEUR" && (
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
          >
            + Nieuwe hulpvraag
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="GET" className="card p-4 mb-8 flex flex-wrap gap-3">
        <input
          name="city"
          type="text"
          placeholder="Stad..."
          defaultValue={sp.city}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <select
          name="day"
          defaultValue={sp.day}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="">Alle dagen</option>
          <option value="monday">Maandag</option>
          <option value="tuesday">Dinsdag</option>
          <option value="wednesday">Woensdag</option>
          <option value="thursday">Donderdag</option>
          <option value="friday">Vrijdag</option>
          <option value="saturday">Zaterdag</option>
        </select>
        <select
          name="intensity"
          defaultValue={sp.intensity}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="">Alle intensiteiten</option>
          <option value="low">Licht</option>
          <option value="medium">Gemiddeld</option>
          <option value="high">Zwaar</option>
        </select>
        <select
          name="trade"
          defaultValue={sp.trade}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="">Alle vakgebieden</option>
          {TRADE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-1.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          Filteren
        </button>
        {(sp.city || sp.day || sp.intensity || sp.trade) && (
          <a
            href="/listings"
            className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Wis filters
          </a>
        )}
      </form>

      {scored.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-gray-900">Geen hulpvragen gevonden</h2>
          <p className="text-gray-600 mt-2">Probeer andere filters of kom later terug.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scored.map((listing) => (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{listing.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {listing.entrepreneur.profileEntrepreneur
                      ? getTradeLabel(listing.entrepreneur.profileEntrepreneur.tradeType)
                      : ""}{" "}
                    · {listing.city}
                  </p>
                </div>
                {helperProfile && listing.score > 0 && (
                  <span className="flex-shrink-0 text-xs font-medium bg-brand-50 text-brand-600 px-2 py-1 rounded-full">
                    {listing.score}% match
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {listing.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <IntensityBadge intensity={listing.intensity} />
                {parseDays(listing.dayOptions).slice(0, 2).map((d) => (
                  <span key={d} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                    {getDayLabel(d)}
                  </span>
                ))}
                {parseDays(listing.dayOptions).length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{parseDays(listing.dayOptions).length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {listing.compensationType === "none"
                    ? "Onbetaald"
                    : listing.compensationType === "expenses"
                    ? "Onkostenvergoeding"
                    : listing.compensationAmount
                    ? `€${listing.compensationAmount}/dag`
                    : "Dagvergoeding"}
                </span>
                <span>{listing._count.applications} aanvrage{listing._count.applications === 1 ? "" : "n"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
