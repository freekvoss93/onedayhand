"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Ongeldig e-mailadres of wachtwoord");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-black text-2xl uppercase tracking-widest" style={{ color: "#c4541a" }}>
              OneDayHand
            </span>
          </Link>
          <h1 className="mt-4 text-xl font-black uppercase tracking-wide text-gray-900">Inloggen</h1>
          <p className="mt-2 text-sm text-gray-600">
            Nog geen account?{" "}
            <Link href="/auth/register" className="font-bold hover:underline" style={{ color: "#c4541a" }}>
              Aanmelden
            </Link>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="E-mailadres" id="email" name="email" type="email"
              placeholder="jan@voorbeeld.nl" required autoComplete="email" />
            <Input label="Wachtwoord" id="password" name="password" type="password"
              placeholder="Jouw wachtwoord" required autoComplete="current-password" />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Inloggen
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2 font-bold uppercase tracking-wider">
              Test accounts
            </p>
            <div className="space-y-1 text-xs text-gray-500 text-center">
              <p>helper@test.nl · ondernemer@test.nl</p>
              <p>Wachtwoord: <code className="bg-gray-100 px-1 rounded font-mono">password123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
