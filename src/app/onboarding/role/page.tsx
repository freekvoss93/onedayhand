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
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4541a" }}>
            Stap 1 van 2
          </p>
          <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900">Wie ben jij?</h1>
          <p className="mt-3 text-gray-600 text-sm">
            Kies je rol om verder te gaan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => chooseRole("HELPER")}
            disabled={!!loading}
            className="card p-8 text-left hover:shadow-md transition-all cursor-pointer disabled:opacity-60 group border-t-4"
            style={{ borderTopColor: loading === "HELPER" ? "#c4541a" : "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.borderTopColor = "#c4541a")}
            onMouseLeave={e => (e.currentTarget.style.borderTopColor = loading === "HELPER" ? "#c4541a" : "transparent")}
          >
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-base font-black uppercase tracking-wide text-gray-900 mb-3">
              Kantoorwerker
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Jij werkt in een kantooromgeving en wil 1 dag per week je handen vuil maken.
            </p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              {["Browse hulpvragen", "Stel beschikbaarheid in", "Stuur aanvragen"].map(i => (
                <li key={i} className="flex items-center gap-2">
                  <span style={{ color: "#c4541a" }} className="font-bold">✓</span> {i}
                </li>
              ))}
            </ul>
            {loading === "HELPER" && (
              <div className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#c4541a" }}>Laden...</div>
            )}
          </button>

          <button
            onClick={() => chooseRole("ENTREPRENEUR")}
            disabled={!!loading}
            className="card p-8 text-left hover:shadow-md transition-all cursor-pointer disabled:opacity-60 group border-t-4"
            style={{ borderTopColor: loading === "ENTREPRENEUR" ? "#c4541a" : "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.borderTopColor = "#c4541a")}
            onMouseLeave={e => (e.currentTarget.style.borderTopColor = loading === "ENTREPRENEUR" ? "#c4541a" : "transparent")}
          >
            <div className="text-5xl mb-4">🔨</div>
            <h2 className="text-base font-black uppercase tracking-wide text-gray-900 mb-3">
              Praktische ondernemer
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Jij hebt een ambacht of klusbedrijf en kunt een extra paar handen gebruiken.
            </p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              {["Plaats hulpvragen", "Bekijk aanvragen", "Plan jouw dag samen"].map(i => (
                <li key={i} className="flex items-center gap-2">
                  <span style={{ color: "#c4541a" }} className="font-bold">✓</span> {i}
                </li>
              ))}
            </ul>
            {loading === "ENTREPRENEUR" && (
              <div className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#c4541a" }}>Laden...</div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
