"use client";

import { useState, useRef } from "react";
import { sendMessage } from "@/lib/actions/messages";
import { Button } from "@/components/ui/Button";

export function MessageForm({ matchId }: { matchId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await sendMessage(formData);

    if (result.success) {
      formRef.current?.reset();
    } else {
      setError(result.error ?? "Verzenden mislukt");
    }
    setLoading(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="flex gap-2">
        <input
          name="content"
          type="text"
          placeholder="Stuur een bericht..."
          required
          maxLength={2000}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" loading={loading} size="sm">
          Verstuur
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </form>
  );
}
