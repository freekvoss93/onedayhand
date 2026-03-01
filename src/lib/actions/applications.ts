"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const applySchema = z.object({
  listingId: z.string().cuid(),
  message: z.string().min(10, "Motivatie moet minimaal 10 tekens zijn"),
  preferredDay: z.string().min(1, "Kies een voorkeur dag"),
});

export async function applyToListing(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "HELPER") {
    return { success: false, error: "Geen toegang" };
  }

  const raw = {
    listingId: formData.get("listingId") as string,
    message: formData.get("message") as string,
    preferredDay: formData.get("preferredDay") as string,
  };

  const parsed = applySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const existing = await prisma.application.findUnique({
    where: {
      listingId_helperId: {
        listingId: parsed.data.listingId,
        helperId: session.user.id,
      },
    },
  });

  if (existing) {
    return { success: false, error: "Je hebt al aangevraagd voor deze hulpvraag" };
  }

  await prisma.application.create({
    data: {
      listingId: parsed.data.listingId,
      helperId: session.user.id,
      message: parsed.data.message,
      preferredDay: parsed.data.preferredDay,
    },
  });

  revalidatePath(`/listings/${parsed.data.listingId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function respondToApplication(
  applicationId: string,
  action: "accept" | "reject",
  scheduledDate?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ENTREPRENEUR") {
    return { success: false, error: "Geen toegang" };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { listing: true },
  });

  if (!application || application.listing.entrepreneurId !== session.user.id) {
    return { success: false, error: "Aanvraag niet gevonden" };
  }

  if (action === "accept") {
    if (!scheduledDate) {
      return { success: false, error: "Kies een datum" };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "accepted" },
    });

    await prisma.match.create({
      data: {
        applicationId,
        scheduledDate: new Date(scheduledDate),
      },
    });
  } else {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "rejected" },
    });
  }

  revalidatePath("/matches");
  revalidatePath("/dashboard");
  return { success: true };
}
