"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/lib/actions/onboarding";

export default function RolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function chooseRole(role: "HELPER" | "ENTREPRENEUR") {
    setLoading(role);
    await setUserRole(role);
    router.push("/onboarding/profile");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Wie ben jij?</h1>
          <p className="mt-3 text-gray-600">
            Kies je rol om verder te gaan. Je kunt dit later niet meer wijzigen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Helper card */}
          <button
            onClick={() => chooseRole("HELPER")}
            disabled={!!loading}
            className="card p-8 text-left hover:border-blue-400 hover:shadow-md transition-all cursor-pointer disabled:opacity-60 group"
          >
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Kantoorwerker
            </h2>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">
              Jij werkt in een kantooromgeving en wil 1 dag per week je handen vuil maken.
              Leer een vak, help iemand verder, en beleef wat anders.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Browse hulpvragen
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Stel je beschikbaarheid in
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Stuur aanvragen
              </li>
            </ul>
            {loading === "HELPER" && (
              <div className="mt-4 text-sm text-blue-600 font-medium">Laden...</div>
            )}
          </button>

          {/* Entrepreneur card */}
          <button
            onClick={() => chooseRole("ENTREPRENEUR")}
            disabled={!!loading}
            className="card p-8 text-left hover:border-orange-400 hover:shadow-md transition-all cursor-pointer disabled:opacity-60 group"
          >
            <div className="text-5xl mb-4">🔨</div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              Praktische ondernemer
            </h2>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">
              Jij hebt een ambacht of klus­bedrijf en kunt goed een extra paar handen
              gebruiken. Post je hulpvraag en vind een enthousiaste helper.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Plaats hulpvragen
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Bekijk aanvragen
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Plan jouw dag samen
              </li>
            </ul>
            {loading === "ENTREPRENEUR" && (
              <div className="mt-4 text-sm text-orange-600 font-medium">Laden...</div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
