import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewListingForm } from "./NewListingForm";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ENTREPRENEUR") redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title">Nieuwe hulpvraag</h1>
        <p className="text-gray-600 mt-1">
          Beschrijf wat voor hulp je zoekt voor 1 dag per week.
        </p>
      </div>
      <NewListingForm />
    </div>
  );
}
