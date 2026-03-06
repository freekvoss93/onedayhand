import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getDayLabel, getTradeLabel } from "@/lib/constants";
import { HelperProfileForm } from "@/app/onboarding/profile/HelperProfileForm";
import { EntrepreneurProfileForm } from "@/app/onboarding/profile/EntrepreneurProfileForm";
import { LogoutButton } from "./LogoutButton";

function parseDaysLocal(json: string): string[] {
  try { return JSON.parse(json); } catch { return []; }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profileHelper: true,
      profileEntrepreneur: true,
      reviewsReceived: {
        include: { reviewer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/auth/login");

  const avgRating =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((s, r) => s + r.rating, 0) /
        user.reviewsReceived.length
      : null;

  const isHelper = user.role === "HELPER";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">Mijn profiel</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Rating summary */}
      {avgRating !== null && (
        <div className="card p-5 mb-6 flex items-center gap-4">
          <div className="text-3xl font-bold text-gray-900">
            {avgRating.toFixed(1)}
          </div>
          <div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {user.reviewsReceived.length} review{user.reviewsReceived.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Profiel bewerken</h2>
        {isHelper && user.profileHelper ? (
          <HelperProfileForm
            defaultValues={{
              city: user.profileHelper.city,
              bio: user.profileHelper.bio ?? "",
              availabilityDays: user.profileHelper.availabilityDays,
              interests: user.profileHelper.interests ?? "",
              maxTravelMinutes: user.profileHelper.maxTravelMinutes.toString(),
              intensityPreference: user.profileHelper.intensityPreference,
              preferOutdoor: user.profileHelper.preferOutdoor.toString(),
            }}
          />
        ) : !isHelper && user.profileEntrepreneur ? (
          <EntrepreneurProfileForm
            defaultValues={{
              companyName: user.profileEntrepreneur.companyName,
              tradeType: user.profileEntrepreneur.tradeType,
              city: user.profileEntrepreneur.city,
              bio: user.profileEntrepreneur.bio ?? "",
              safetyInfo: user.profileEntrepreneur.safetyInfo ?? "",
              website: user.profileEntrepreneur.website ?? "",
            }}
          />
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500 text-sm">
              Profiel nog niet aangemaakt.{" "}
              <a href="/onboarding/profile" className="font-bold hover:underline" style={{ color: "#c4541a" }}>
                Aanmaken →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Reviews */}
      {user.reviewsReceived.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Ontvangen reviews</h2>
          <div className="space-y-3">
            {user.reviewsReceived.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">door {review.reviewer.name}</span>
                </div>
                {review.text && <p className="text-sm text-gray-700">{review.text}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
