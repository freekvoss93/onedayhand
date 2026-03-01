"use client";

import { useState } from "react";
import { respondToApplication } from "@/lib/actions/applications";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDayLabel } from "@/lib/constants";
import Link from "next/link";

interface Application {
  id: string;
  status: string;
  message: string;
  preferredDay: string;
  createdAt: Date;
  helper: { id: string; name: string | null };
  match: { id: string; scheduledDate: Date } | null;
}

interface ApplicationCardProps {
  application: Application;
  days: string[];
}

export function ApplicationCard({ application, days: _days }: ApplicationCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");

  async function handleRespond(action: "accept" | "reject") {
    if (action === "accept" && !scheduledDate) {
      setError("Kies een datum voor de werkdag");
      return;
    }
    setLoading(action);
    setError(null);
    const result = await respondToApplication(application.id, action, scheduledDate || undefined);
    if (!result.success) {
      setError(result.error ?? "Er ging iets mis");
    }
    setLoading(null);
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-900">{application.helper.name ?? "Helper"}</div>
        <StatusBadge status={application.status} />
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Voorkeur: {getDayLabel(application.preferredDay)}
      </div>

      <p className="text-sm text-gray-700 mb-4">{application.message}</p>

      {application.status === "pending" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Datum werkdag (bij acceptatie)
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handleRespond("accept")}
              loading={loading === "accept"}
              size="sm"
              className="flex-1"
            >
              Accepteren
            </Button>
            <Button
              onClick={() => handleRespond("reject")}
              loading={loading === "reject"}
              variant="danger"
              size="sm"
              className="flex-1"
            >
              Afwijzen
            </Button>
          </div>
        </div>
      )}

      {application.match && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/matches/${application.match.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Bekijk match & berichten →
          </Link>
        </div>
      )}
    </div>
  );
}
