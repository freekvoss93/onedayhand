"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
});

export type RegisterResult =
  | { success: true; userId: string }
  | { success: false; error: string };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const raw = {
    email: formData.get("email") as string,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "Dit e-mailadres is al in gebruik" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashed,
    },
  });

  return { success: true, userId: user.id };
}
