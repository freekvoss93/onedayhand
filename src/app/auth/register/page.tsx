"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto sign in after register
    const signInResult = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (signInResult?.ok) {
      router.push("/onboarding/role");
    } else {
      setError("Account aangemaakt, maar inloggen mislukt. Probeer opnieuw.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">🤝</Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Maak een account aan</h1>
          <p className="mt-2 text-sm text-gray-600">
            Al een account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Inloggen
            </Link>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Volledige naam"
              id="name"
              name="name"
              type="text"
              placeholder="Jan de Vries"
              required
              autoComplete="name"
            />
            <Input
              label="E-mailadres"
              id="email"
              name="email"
              type="email"
              placeholder="jan@voorbeeld.nl"
              required
              autoComplete="email"
            />
            <Input
              label="Wachtwoord"
              id="password"
              name="password"
              type="password"
              placeholder="Minimaal 8 tekens"
              required
              autoComplete="new-password"
              minLength={8}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Account aanmaken
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Door te registreren ga je akkoord met onze voorwaarden.
        </p>
      </div>
    </div>
  );
}
