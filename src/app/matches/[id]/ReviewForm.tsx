"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/Button";

export function ReviewForm({
  matchId,
  revieweeName,
}: {
  matchId: string;
  revieweeName: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Geef een beoordeling");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("rating", rating.toString());
    const result = await submitReview(formData);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error ?? "Er ging iets mis");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <p className="text-sm font-medium text-green-700">✓ Review geplaatst, dankjewel!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="matchId" value={matchId} />

      <div>
        <p className="text-sm text-gray-700 mb-2">
          Beoordeel <strong>{revieweeName}</strong>:
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-2xl transition-colors"
            >
              <span className={(hovered || rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="text"
        placeholder="Optionele toelichting..."
        rows={3}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" className="w-full" size="sm" loading={loading}>
        Review plaatsen
      </Button>
    </form>
  );
}
