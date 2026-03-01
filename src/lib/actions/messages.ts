"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const messageSchema = z.object({
  matchId: z.string().cuid(),
  content: z.string().min(1, "Bericht mag niet leeg zijn").max(2000),
});

export async function sendMessage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Niet ingelogd" };

  const raw = {
    matchId: formData.get("matchId") as string,
    content: formData.get("content") as string,
  };

  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Verify user is part of this match
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

  await prisma.message.create({
    data: {
      matchId: parsed.data.matchId,
      senderId: session.user.id,
      content: parsed.data.content,
    },
  });

  revalidatePath(`/matches/${parsed.data.matchId}`);
  return { success: true };
}
