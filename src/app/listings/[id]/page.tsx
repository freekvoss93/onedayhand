import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { parseDays, formatDateShort } from "@/lib/utils";
import { getDayLabel, getTradeLabel, COMPENSATION_TYPES } from "@/lib/constants";
import { IntensityBadge, StatusBadge } from "@/components/ui/Badge";
import { ApplyForm } from "./ApplyForm";
import { ApplicationCard } from "./ApplicationCard";
import Link from "next/link";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      entrepreneur: {
        include: { profileEntrepreneur: true },
      },
      applications: {
        include: {
          helper: { select: { id: true, name: true } },
          match: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!listing) notFound();

  const days = parseDays(listing.dayOptions);
  const isOwner = session?.user?.id === listing.entrepreneurId;
  const isHelper = session?.user?.role === "HELPER";

  const myApplication = isHelper
    ? listing.applications.find((a) => a.helperId === session?.user?.id)
    : null;

  const compensation = COMPENSATION_TYPES.find((c) => c.value === listing.compensationType);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/listings" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
          ← Terug naar hulpvragen
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <p className="text-gray-500 mt-1">
                  {listing.entrepreneur.profileEntrepreneur
                    ? getTradeLabel(listing.entrepreneur.profileEntrepreneur.tradeType)
                    : "Ondernemer"}{" "}
                  · {listing.city}
                </p>
              </div>
              <IntensityBadge intensity={listing.intensity} />
            </div>

            <div className="mt-6 prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>

            {listing.requirements && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Vereisten</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{listing.requirements}</p>
              </div>
            )}
          </div>

          {/* Applications for owner */}
          {isOwner && (
            <div className="card p-6">
              <h2 className="section-title mb-4">
                Aanvragen ({listing.applications.length})
              </h2>
              {listing.applications.length === 0 ? (
                <p className="text-gray-500 text-sm">Nog geen aanvragen ontvangen.</p>
              ) : (
                <div className="space-y-4">
                  {listing.applications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      days={days}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My application status for helpers */}
          {myApplication && (
            <div className="card p-6">
              <h2 className="section-title mb-3">Jouw aanvraag</h2>
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={myApplication.status} />
                <span className="text-sm text-gray-500">
                  Voorkeur: {getDayLabel(myApplication.preferredDay)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{myApplication.message}</p>
              {myApplication.match && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Ingepland op {formatDateShort(myApplication.match.scheduledDate)}
                  </p>
                  <Link
                    href={`/matches/${myApplication.match.id}`}
                    className="text-sm text-green-700 hover:underline mt-1 block"
                  >
                    Ga naar match → berichten & details
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Listing info card */}
          <div className="card p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Beschikbare dagen</p>
              <div className="flex flex-wrap gap-1.5">
                {days.map((d) => (
                  <span key={d} className="px-2 py-1 bg-brand-50 text-brand-600 rounded text-xs font-medium">
                    {getDayLabel(d)}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vergoeding</p>
              <p className="text-sm font-medium text-gray-900">
                {listing.compensationType === "daily_rate" && listing.compensationAmount
                  ? `€${listing.compensationAmount} per dag`
                  : compensation?.label ?? listing.compensationType}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aanvragen</p>
              <p className="text-sm font-medium text-gray-900">{listing.applications.length}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Geplaatst op</p>
              <p className="text-sm text-gray-900">{formatDateShort(listing.createdAt)}</p>
            </div>
          </div>

          {/* Entrepreneur info */}
          <div className="card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Ondernemer</p>
            <p className="font-semibold text-gray-900">
              {listing.entrepreneur.profileEntrepreneur?.companyName ?? listing.entrepreneur.name}
            </p>
            {listing.entrepreneur.profileEntrepreneur?.tradeType && (
              <p className="text-sm text-gray-500 mt-0.5">
                {getTradeLabel(listing.entrepreneur.profileEntrepreneur.tradeType)}
              </p>
            )}
            {listing.entrepreneur.profileEntrepreneur?.bio && (
              <p className="text-sm text-gray-600 mt-3">
                {listing.entrepreneur.profileEntrepreneur.bio}
              </p>
            )}
            {listing.entrepreneur.profileEntrepreneur?.safetyInfo && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs font-semibold text-yellow-800 mb-1">Veiligheidsinfo</p>
                <p className="text-xs text-yellow-700">
                  {listing.entrepreneur.profileEntrepreneur.safetyInfo}
                </p>
              </div>
            )}
          </div>

          {/* Apply form */}
          {isHelper && !myApplication && listing.isActive && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Aanvragen</h2>
              <ApplyForm listingId={listing.id} days={days} />
            </div>
          )}

          {!session && (
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">Log in om te reageren</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Inloggen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
