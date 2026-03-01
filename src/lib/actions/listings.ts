"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const listingSchema = z.object({
  title: z.string().min(5, "Titel moet minimaal 5 tekens zijn"),
  description: z.string().min(20, "Omschrijving moet minimaal 20 tekens zijn"),
  city: z.string().min(2, "Vul een stad in"),
  dayOptions: z.array(z.string()).min(1, "Kies minimaal 1 dag"),
  intensity: z.enum(["low", "medium", "high"]),
  requirements: z.string().optional(),
  compensationType: z.enum(["none", "expenses", "daily_rate"]),
  compensationAmount: z.coerce.number().optional(),
});

export async function createListing(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ENTREPRENEUR") {
    throw new Error("Geen toegang");
  }

  const days = formData.getAll("dayOptions") as string[];
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    city: formData.get("city") as string,
    dayOptions: days,
    intensity: formData.get("intensity"),
    requirements: formData.get("requirements") as string | undefined,
    compensationType: formData.get("compensationType"),
    compensationAmount: formData.get("compensationAmount") || undefined,
  };

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const listing = await prisma.listing.create({
    data: {
      entrepreneurId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      dayOptions: JSON.stringify(parsed.data.dayOptions),
      intensity: parsed.data.intensity,
      requirements: parsed.data.requirements,
      compensationType: parsed.data.compensationType,
      compensationAmount: parsed.data.compensationAmount,
    },
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect(`/listings/${listing.id}`);
}

export async function toggleListing(listingId: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Niet ingelogd");

  await prisma.listing.updateMany({
    where: { id: listingId, entrepreneurId: session.user.id },
    data: { isActive },
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  return { success: true };
}
