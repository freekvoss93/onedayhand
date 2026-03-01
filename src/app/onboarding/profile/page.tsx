import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HelperProfileForm } from "./HelperProfileForm";
import { EntrepreneurProfileForm } from "./EntrepreneurProfileForm";

export default async function ProfileOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  if (!session.user.role) redirect("/onboarding/role");

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Stel je profiel in</h1>
          <p className="mt-1 text-gray-600">
            {session.user.role === "HELPER"
              ? "Vertel ondernemers wie je bent en wanneer je beschikbaar bent."
              : "Vertel helpers over jouw bedrijf en wat je zoekt."}
          </p>
        </div>

        {session.user.role === "HELPER" ? (
          <HelperProfileForm />
        ) : (
          <EntrepreneurProfileForm />
        )}
      </div>
    </div>
  );
}
