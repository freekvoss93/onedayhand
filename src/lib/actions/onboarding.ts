"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setUserRole(role: "HELPER" | "ENTREPRENEUR") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Niet ingelogd");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  revalidatePath("/");
  return { success: true };
}

const helperSchema = z.object({
  city: z.string().min(2, "Vul een stad in"),
  bio: z.string().optional(),
  availabilityDays: z.array(z.string()).min(1, "Kies minimaal 1 dag"),
  interests: z.string().optional(),
  maxTravelMinutes: z.coerce.number().min(10).max(240),
  intensityPreference: z.enum(["low", "medium", "high"]),
  preferOutdoor: z.boolean().default(false),
});

export async function saveHelperProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Niet ingelogd");

  const days = formData.getAll("availabilityDays") as string[];
  const raw = {
    city: formData.get("city") as string,
    bio: formData.get("bio") as string | undefined,
    availabilityDays: days,
    interests: formData.get("interests") as string | undefined,
    maxTravelMinutes: formData.get("maxTravelMinutes"),
    intensityPreference: formData.get("intensityPreference"),
    preferOutdoor: formData.get("preferOutdoor") === "true",
  };

  const parsed = helperSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await prisma.profileHelper.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      city: parsed.data.city,
      bio: parsed.data.bio,
      availabilityDays: JSON.stringify(parsed.data.availabilityDays),
      interests: parsed.data.interests,
      maxTravelMinutes: parsed.data.maxTravelMinutes,
      intensityPreference: parsed.data.intensityPreference,
      preferOutdoor: parsed.data.preferOutdoor,
    },
    update: {
      city: parsed.data.city,
      bio: parsed.data.bio,
      availabilityDays: JSON.stringify(parsed.data.availabilityDays),
      interests: parsed.data.interests,
      maxTravelMinutes: parsed.data.maxTravelMinutes,
      intensityPreference: parsed.data.intensityPreference,
      preferOutdoor: parsed.data.preferOutdoor,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

const entrepreneurSchema = z.object({
  companyName: z.string().min(2, "Vul een bedrijfsnaam in"),
  tradeType: z.string().min(1, "Kies een vakgebied"),
  city: z.string().min(2, "Vul een stad in"),
  bio: z.string().optional(),
  safetyInfo: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function saveEntrepreneurProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Niet ingelogd");

  const raw = {
    companyName: formData.get("companyName") as string,
    tradeType: formData.get("tradeType") as string,
    city: formData.get("city") as string,
    bio: formData.get("bio") as string | undefined,
    safetyInfo: formData.get("safetyInfo") as string | undefined,
    website: formData.get("website") as string | undefined,
  };

  const parsed = entrepreneurSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await prisma.profileEntrepreneur.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName: parsed.data.companyName,
      tradeType: parsed.data.tradeType,
      city: parsed.data.city,
      bio: parsed.data.bio,
      safetyInfo: parsed.data.safetyInfo,
      website: parsed.data.website || null,
    },
    update: {
      companyName: parsed.data.companyName,
      tradeType: parsed.data.tradeType,
      city: parsed.data.city,
      bio: parsed.data.bio,
      safetyInfo: parsed.data.safetyInfo,
      website: parsed.data.website || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
