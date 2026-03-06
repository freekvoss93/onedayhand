"use client";

import { useState } from "react";
import { createListing } from "@/lib/actions/listings";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { DAYS, INTENSITY_LEVELS, COMPENSATION_TYPES } from "@/lib/constants";

export function NewListingForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [compensationType, setCompensationType] = useState("none");

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setError("Kies minimaal 1 beschikbare dag");
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    selectedDays.forEach((d) => formData.append("dayOptions", d));

    try {
      const result = await createListing(formData);
      if (result && !result.success) {
        setError(result.error ?? "Er ging iets mis");
        setLoading(false);
      }
    } catch {
      // redirect throws, which is expected on success
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-6">
      <Input
        label="Titel"
        id="title"
        name="title"
        placeholder="Zoek helper voor vloerleggen woonkamer"
        required
        minLength={5}
      />

      <Textarea
        label="Omschrijving"
        id="description"
        name="description"
        placeholder="Beschrijf de werkzaamheden, locatie, wat je van de helper verwacht en wat hij/zij kan leren..."
        rows={5}
        required
        minLength={20}
      />

      <Input
        label="Stad / locatie"
        id="city"
        name="city"
        placeholder="Rotterdam"
        required
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
      </div>

      <Select
        label="Fysieke intensiteit"
        id="intensity"
        name="intensity"
        required
      >
        <option value="">Kies intensiteit</option>
        {INTENSITY_LEVELS.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label} – {i.description}
          </option>
        ))}
      </Select>

      <Textarea
        label="Vereisten / wat breng je mee (optioneel)"
        id="requirements"
        name="requirements"
        placeholder="Bijv: veiligheidsschoenen, oude kleding, rijbewijs..."
        rows={2}
      />

      <Select
        label="Vergoeding"
        id="compensationType"
        name="compensationType"
        value={compensationType}
        onChange={(e) => setCompensationType(e.target.value)}
      >
        {COMPENSATION_TYPES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>

      {(compensationType === "expenses" || compensationType === "daily_rate") && (
        <Input
          label={compensationType === "daily_rate" ? "Bedrag per dag (€)" : "Onkostenvergoeding (€)"}
          id="compensationAmount"
          name="compensationAmount"
          type="number"
          min="0"
          step="5"
          placeholder="75"
        />
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Hulpvraag plaatsen
      </Button>
    </form>
  );
}
