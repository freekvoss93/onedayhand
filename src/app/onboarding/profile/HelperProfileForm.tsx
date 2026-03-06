"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveHelperProfile } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { DAYS, INTENSITY_LEVELS } from "@/lib/constants";

export function HelperProfileForm({ defaultValues }: { defaultValues?: Record<string, string> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    defaultValues?.availabilityDays ? JSON.parse(defaultValues.availabilityDays) : []
  );

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    selectedDays.forEach((d) => formData.append("availabilityDays", d));

    const result = await saveHelperProfile(formData);
    if (result?.success === false) {
      setError(result.error ?? "Er ging iets mis");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
      <Input
        label="Jouw stad / woonplaats"
        id="city"
        name="city"
        placeholder="Amsterdam"
        required
        defaultValue={defaultValues?.city}
      />

      <Textarea
        label="Korte bio (optioneel)"
        id="bio"
        name="bio"
        placeholder="Vertel iets over jezelf, je achtergrond en waarom je wil meehelpen..."
        rows={3}
        defaultValue={defaultValues?.bio}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Beschikbare dagen <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedDays.includes(day.value)
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {selectedDays.length === 0 && (
          <p className="text-xs text-gray-500">Kies minimaal 1 dag</p>
        )}
      </div>

      <Input
        label="Interesses / skills (kommagescheiden, optioneel)"
        id="interests"
        name="interests"
        placeholder="timmerwerk, buitenwerk, techniek"
        defaultValue={defaultValues?.interests}
      />

      <Select
        label="Maximale reistijd"
        id="maxTravelMinutes"
        name="maxTravelMinutes"
        defaultValue={defaultValues?.maxTravelMinutes ?? "60"}
      >
        <option value="30">30 minuten</option>
        <option value="45">45 minuten</option>
        <option value="60">1 uur</option>
        <option value="90">1,5 uur</option>
        <option value="120">2 uur</option>
      </Select>

      <Select
        label="Voorkeur fysieke intensiteit"
        id="intensityPreference"
        name="intensityPreference"
        defaultValue={defaultValues?.intensityPreference ?? "medium"}
      >
        {INTENSITY_LEVELS.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label} – {i.description}
          </option>
        ))}
      </Select>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="preferOutdoor"
          name="preferOutdoor"
          value="true"
          defaultChecked={defaultValues?.preferOutdoor === "true"}
          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
        />
        <label htmlFor="preferOutdoor" className="text-sm text-gray-700">
          Ik werk liever buiten
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Profiel opslaan & verder
      </Button>
    </form>
  );
}
