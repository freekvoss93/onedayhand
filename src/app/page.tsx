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
      <section
        className="relative flex items-center justify-center text-center px-4"
        style={{
          minHeight: "520px",
          background: "linear-gradient(135deg, #1a1208 0%, #3d1f0a 40%, #5c2e0e 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #c4541a 0, #c4541a 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto py-24">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8"
            style={{ backgroundColor: "rgba(196,84,26,0.3)", color: "#f4c4a3" }}
          >
            Platform in beta
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wide text-white leading-tight drop-shadow-lg">
            Jouw handen<br />
            <span style={{ color: "#ec9e6b" }}>Vuil maken</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed font-medium">
            Kantoorwerkers matchen met praktische ondernemers.
            Help 1 dag per week mee op de bouwplaats, werkplaats of in de tuin.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-colors hover:opacity-90"
                style={{ backgroundColor: "#c4541a", color: "white" }}
              >
                Naar mijn dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#c4541a", color: "white" }}
                >
                  Gratis aanmelden
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest bg-white text-gray-900 border-2 border-white hover:bg-gray-100 transition-colors"
                >
                  Bekijk hulpvragen
                </Link>
              </>
            )}
          </div>
          <div className="mt-14 flex flex-col sm:flex-row gap-8 justify-center">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{listingCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">Actieve hulpvragen</div>
            </div>
            <div className="hidden sm:block w-px bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{userCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">Gebruikers</div>
            </div>
            <div className="hidden sm:block w-px bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">1 dag</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">Per week</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4541a" }}>Werkwijze</p>
            <h2 className="text-3xl font-black uppercase tracking-wide text-gray-900">Hoe werkt het?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "👤", step: "01", title: "Maak je profiel", desc: "Registreer als helper of ondernemer. Vul je beschikbaarheid, locatie en voorkeuren in." },
              { icon: "🔍", step: "02", title: "Match & vraag aan", desc: "Helpers browsen hulpvragen en sturen een aanvraag. Ondernemers accepteren de beste kandidaat." },
              { icon: "🤝", step: "03", title: "Werk samen", desc: "Plan de dag, chat via het platform en laat daarna een review achter voor elkaar." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: "#fae3d4" }}>
                  {item.icon}
                </div>
                <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#c4541a" }}>Stap {item.step}</div>
                <h3 className="font-black uppercase tracking-wide text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20 px-4" style={{ backgroundColor: "#faf8f5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#c4541a" }}>Doelgroepen</p>
            <h2 className="text-3xl font-black uppercase tracking-wide text-gray-900">Voor wie?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 border-t-4" style={{ borderTopColor: "#c4541a" }}>
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-base font-black uppercase tracking-wide text-gray-900 mb-3">Kantoorwerkers</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Je werkt dagelijks achter een scherm en mist het gevoel van echt iets maken. Eén dag per week de handen uit de mouwen.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Leer nieuwe vaardigheden van een vakman", "Netwerk buiten je eigen bubbel", "Optioneel een dagvergoeding"].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: "#c4541a" }}>→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8 border-t-4" style={{ borderTopColor: "#c4541a" }}>
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="text-base font-black uppercase tracking-wide text-gray-900 mb-3">Praktische ondernemers</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Je hebt een ambacht of klusbedrijf en kunt een enthousiast extra paar handen goed gebruiken voor een dag.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Flexibele hulp zonder personeelsverplichtingen", "Enthousiaste helpers die willen leren", "Vergoed naar eigen keuze"].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: "#c4541a" }}>→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section className="py-20 px-4" style={{ backgroundColor: "#c4541a" }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase tracking-wide text-white mb-4">Klaar om te beginnen?</h2>
            <p className="text-white/75 mb-10 font-medium">Registreer gratis en vind je eerste match binnen een week.</p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-white font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-colors"
              style={{ color: "#c4541a" }}
            >
              Gratis aanmelden &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
