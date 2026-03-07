import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatDate, formatDateShort, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { MessageForm } from "./MessageForm";
import { ReviewForm } from "./ReviewForm";
import Link from "next/link";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          listing: {
            include: {
              entrepreneur: {
                include: { profileEntrepreneur: true },
              },
            },
          },
          helper: {
            include: { profileHelper: true },
          },
        },
      },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true } },
          reviewee: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!match) notFound();

  const isHelper = match.application.helperId === session.user.id;
  const isEntrepreneur =
    match.application.listing.entrepreneurId === session.user.id;

  if (!isHelper && !isEntrepreneur) redirect("/matches");

  const myReview = match.reviews.find((r) => r.reviewerId === session.user.id);
  const otherPersonName = isHelper
    ? match.application.listing.entrepreneur.profileEntrepreneur?.companyName ??
      match.application.listing.entrepreneur.name
    : match.application.helper.name;

  const isPast = match.scheduledDate < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-4">
        <Link href="/matches" className="text-sm font-semibold hover:underline" style={{ color: "#c4541a" }}>
          ← Terug naar matches
        </Link>
      </div>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {match.application.listing.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {match.application.listing.city}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Werkdag</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(match.scheduledDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {isHelper ? "Ondernemer" : "Helper"}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{otherPersonName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Link</p>
            <Link
              href={`/listings/${match.application.listingId}`}
              className="text-sm font-semibold hover:underline mt-1 block" style={{ color: "#c4541a" }}
            >
              Bekijk hulpvraag →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="section-title mb-4">Berichten</h2>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {match.messages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nog geen berichten. Stuur een berichtje!
                </p>
              ) : (
                match.messages.map((msg) => {
                  const isMine = msg.senderId === session.user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-brand-500 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        {!isMine && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {msg.sender.name}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? "text-brand-200" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <MessageForm matchId={match.id} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Review section */}
          {isPast && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Reviews</h2>

              {myReview ? (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    ✓ Jouw review is geplaatst
                  </p>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < myReview.rating ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {myReview.text && (
                    <p className="text-sm text-gray-600 mt-1">{myReview.text}</p>
                  )}
                </div>
              ) : (
                <ReviewForm matchId={match.id} revieweeName={otherPersonName ?? "de ander"} />
              )}

              {/* Other reviews */}
              {match.reviews
                .filter((r) => r.reviewerId !== session.user.id)
                .map((r) => (
                  <div key={r.id} className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Review van {r.reviewer.name}:</p>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < r.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {r.text && <p className="text-sm text-gray-600">{r.text}</p>}
                  </div>
                ))}
            </div>
          )}

          {!isPast && (
            <div className="card p-5 bg-brand-50 border-brand-200">
              <p className="text-sm text-brand-700 font-medium">
                Werkdag gepland op{" "}
                <strong>{formatDateShort(match.scheduledDate)}</strong>
              </p>
              <p className="text-xs text-brand-500 mt-1">
                Na afloop kun je een review achterlaten.
              </p>
            </div>
          )}

          {/* Info card */}
          <div className="card p-5 space-y-3">
            {isHelper && match.application.listing.entrepreneur.profileEntrepreneur?.safetyInfo && (
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Veiligheidsinfo
                </p>
                <p className="text-xs text-gray-600">
                  {match.application.listing.entrepreneur.profileEntrepreneur.safetyInfo}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Jouw motivatie
              </p>
              <p className="text-xs text-gray-600">{match.application.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
