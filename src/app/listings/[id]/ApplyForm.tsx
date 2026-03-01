"use client";

import { useState } from "react";
import { applyToListing } from "@/lib/actions/applications";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Input";
import { getDayLabel } from "@/lib/constants";

interface ApplyFormProps {
  listingId: string;
  days: string[];
}

export function ApplyForm({ listingId, days }: ApplyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await applyToListing(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Er ging iets mis");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-sm font-medium text-green-700">Aanvraag verstuurd!</p>
        <p className="text-xs text-gray-500 mt-1">De ondernemer krijgt een seintje.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="listingId" value={listingId} />

      <Select label="Voorkeur dag" id="preferredDay" name="preferredDay" required>
        <option value="">Kies een dag</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {getDayLabel(d)}
          </option>
        ))}
      </Select>

      <Textarea
        label="Motivatie"
        id="message"
        name="message"
        placeholder="Vertel waarom jij de ideale helper bent..."
        rows={4}
        required
        minLength={10}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Aanvragen
      </Button>
    </form>
  );
}
