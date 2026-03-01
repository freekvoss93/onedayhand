"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveEntrepreneurProfile } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { TRADE_TYPES } from "@/lib/constants";

export function EntrepreneurProfileForm({
  defaultValues,
}: {
  defaultValues?: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveEntrepreneurProfile(formData);

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
        label="Bedrijfsnaam"
        id="companyName"
        name="companyName"
        placeholder="Vloeren De Vries"
        required
        defaultValue={defaultValues?.companyName}
      />

      <Select
        label="Type vakgebied"
        id="tradeType"
        name="tradeType"
        defaultValue={defaultValues?.tradeType}
        required
      >
        <option value="">Kies een vakgebied</option>
        {TRADE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>

      <Input
        label="Stad / vestigingsplaats"
        id="city"
        name="city"
        placeholder="Rotterdam"
        required
        defaultValue={defaultValues?.city}
      />

      <Textarea
        label="Over je bedrijf (optioneel)"
        id="bio"
        name="bio"
        placeholder="Vertel iets over je bedrijf, wat je doet en wie je zoekt..."
        rows={3}
        defaultValue={defaultValues?.bio}
      />

      <Textarea
        label="Veiligheidsinfo (optioneel)"
        id="safetyInfo"
        name="safetyInfo"
        placeholder="Bijv: veiligheidsschoenen verplicht, stofmasker aanwezig, geen hoogtewerk..."
        rows={2}
        defaultValue={defaultValues?.safetyInfo}
      />

      <Input
        label="Website (optioneel)"
        id="website"
        name="website"
        type="url"
        placeholder="https://www.jouwbedrijf.nl"
        defaultValue={defaultValues?.website}
      />

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
