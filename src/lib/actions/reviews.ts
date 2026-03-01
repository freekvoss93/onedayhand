"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const reviewSchema = z.object({
  matchId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().optional(),
});

export async function submitReview(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Niet ingelogd" };

  const raw = {
    matchId: formData.get("matchId") as string,
    rating: formData.get("rating"),
    text: formData.get("text") as string | undefined,
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: {
      application: {
        include: { listing: true },
      },
    },
  });

  if (!match) return { success: false, error: "Match niet gevonden" };

  const isHelper = match.application.helperId === session.user.id;
  const isEntrepreneur = match.application.listing.entrepreneurId === session.user.id;

  if (!isHelper && !isEntrepreneur) {
    return { success: false, error: "Geen toegang" };
  }

  const revieweeId = isHelper
    ? match.application.listing.entrepreneurId
    : match.application.helperId;

  const existing = await prisma.review.findUnique({
    where: {
      matchId_reviewerId: {
        matchId: parsed.data.matchId,
        reviewerId: session.user.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: "Je hebt al een review achtergelaten" };
  }

  await prisma.review.create({
    data: {
      matchId: parsed.data.matchId,
      reviewerId: session.user.id,
      revieweeId,
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
  });

  // Mark match as completed if both reviewed
  const reviews = await prisma.review.count({ where: { matchId: parsed.data.matchId } });
  if (reviews >= 2) {
    await prisma.match.update({
      where: { id: parsed.data.matchId },
      data: { status: "completed" },
    });
  }

  revalidatePath(`/matches/${parsed.data.matchId}`);
  return { success: true };
}
