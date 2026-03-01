import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  const [listingCount, userCount] = await Promise.all([
    prisma.listing.count({ where: { isActive: true } }),
    prisma.user.count(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>✨</span> Platform in beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Eén dag per week<br />
            <span className="text-blue-600">jouw handen vuil maken</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kantoorwerkers matchen met praktische ondernemers. Help mee op de bouwplaats,
            in de werkplaats of in de tuin. Leer iets nieuws, maak écht iets af.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Naar mijn dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Start gratis →
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Bekijk hulpvragen
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">{listingCount}</div>
              <div className="text-sm text-gray-500 mt-1">Actieve hulpvragen</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-200" />
            <div>
              <div className="text-3xl font-bold text-gray-900">{userCount}</div>
              <div className="text-sm text-gray-500 mt-1">Aangemelde gebruikers</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-200" />
            <div>
              <div className="text-3xl font-bold text-gray-900">1 dag</div>
              <div className="text-sm text-gray-500 mt-1">Per week commitment</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Hoe werkt het?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            In drie stappen gematcht met je perfecte klus-partner.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                👤
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Maak je profiel</h3>
              <p className="text-sm text-gray-600">
                Registreer als helper of ondernemer. Vul je beschikbaarheid,
                locatie en voorkeuren in.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🔍
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Match & vraag aan</h3>
              <p className="text-sm text-gray-600">
                Helpers browsen hulpvragen en sturen een aanvraag.
                Ondernemers accepteren de beste kandidaat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🤝
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Werk samen</h3>
              <p className="text-sm text-gray-600">
                Plan de dag, chat via het platform en laat daarna
                een review achter voor elkaar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Voor wie?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kantoorwerkers</h3>
              <p className="text-gray-600 mb-4">
                Je werkt dagelijks achter een scherm en mist het gevoel van echt iets maken.
                Eén dag per week de handen uit de mouwen.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  Leer nieuwe vaardigheden van een vakman
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  Netwerk buiten je eigen bubbel
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">→</span>
                  Optioneel een dagvergoeding of onkostenvergoeding
                </li>
              </ul>
            </div>

            <div className="card p-8">
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Praktische ondernemers</h3>
              <p className="text-gray-600 mb-4">
                Je hebt een ambacht of klus­bedrijf en kunt een enthousiast extra paar handen
                goed gebruiken voor een dag.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  Flexibele hulp zonder personeel­sverplichtingen
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  Enthousiaste helpers die echt willen leren
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">→</span>
                  Vergoed naar eigen keuze (ook gratis werkt)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section className="py-20 px-4 bg-blue-600">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Klaar om te beginnen?
            </h2>
            <p className="text-blue-100 mb-8">
              Registreer gratis en vind je eerste match binnen een week.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Gratis aanmelden →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
