import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // ─── Helper user ────────────────────────────────────────────────────────────
  const helper = await prisma.user.upsert({
    where: { email: "helper@test.nl" },
    update: {},
    create: {
      email: "helper@test.nl",
      name: "Lars Bakker",
      password,
      role: "HELPER",
      profileHelper: {
        create: {
          city: "Amsterdam",
          bio: "Marketing manager bij een software bedrijf. Ik wil graag iets praktisch doen naast mijn kantoorbaan. Houd van buitenwerk en leer graag nieuwe vaardigheden.",
          availabilityDays: JSON.stringify(["friday", "saturday"]),
          interests: "timmerwerk, buitenwerk, elektra",
          maxTravelMinutes: 60,
          intensityPreference: "medium",
          preferOutdoor: true,
        },
      },
    },
  });

  // ─── Helper user 2 ───────────────────────────────────────────────────────────
  const helper2 = await prisma.user.upsert({
    where: { email: "helper2@test.nl" },
    update: {},
    create: {
      email: "helper2@test.nl",
      name: "Sophie van Dijk",
      password,
      role: "HELPER",
      profileHelper: {
        create: {
          city: "Rotterdam",
          bio: "HR consultant op zoek naar avontuur buiten het kantoor. Vind het leuk om nieuwe dingen te leren en mensen te helpen.",
          availabilityDays: JSON.stringify(["wednesday", "thursday", "friday"]),
          interests: "schilderen, tuinieren, schoonmaak",
          maxTravelMinutes: 45,
          intensityPreference: "low",
          preferOutdoor: false,
        },
      },
    },
  });

  // ─── Entrepreneur 1 ─────────────────────────────────────────────────────────
  const entrepreneur = await prisma.user.upsert({
    where: { email: "ondernemer@test.nl" },
    update: {},
    create: {
      email: "ondernemer@test.nl",
      name: "Pieter de Vries",
      password,
      role: "ENTREPRENEUR",
      profileEntrepreneur: {
        create: {
          companyName: "Vloeren De Vries",
          tradeType: "flooring",
          city: "Amsterdam",
          bio: "Al 15 jaar actief als vloerlegger. Ik leg laminaat, PVC en parket in woningen en kantoren door heel Noord-Holland. Op zoek naar een enthousiaste helper die een dagje mee wil werken.",
          safetyInfo: "Veiligheidsschoenen aanbevolen. Stofmasker aanwezig. Geen zwaar tillen vereist.",
          website: "https://www.vloerendevries.nl",
        },
      },
    },
  });

  // ─── Entrepreneur 2 ─────────────────────────────────────────────────────────
  const entrepreneur2 = await prisma.user.upsert({
    where: { email: "schilder@test.nl" },
    update: {},
    create: {
      email: "schilder@test.nl",
      name: "Mark Jansen",
      password,
      role: "ENTREPRENEUR",
      profileEntrepreneur: {
        create: {
          companyName: "Schildersbedrijf Jansen",
          tradeType: "painting",
          city: "Rotterdam",
          bio: "Schilder in hart en nieren. Ik doe zowel binnen- als buitenwerk voor particulieren en bedrijven.",
          safetyInfo: "Oude kleding meenemen. Verfs spatten zijn onvermijdelijk. Ladder aanwezig.",
        },
      },
    },
  });

  // ─── Listings ────────────────────────────────────────────────────────────────
  const listing1 = await prisma.listing.upsert({
    where: { id: "seed-listing-1" },
    update: {},
    create: {
      id: "seed-listing-1",
      entrepreneurId: entrepreneur.id,
      title: "Helper gezocht voor PVC vloer in appartement",
      description:
        "We gaan een PVC vloer leggen in een appartement van ~80m² in Amsterdam-West. De ondervloer is al klaar. Ik zoek iemand die helpt met het uitrollen, knippen en klikken van de planken. Je leert alles stap voor stap. Gezellige werkdag, lunch is geregeld!",
      city: "Amsterdam",
      dayOptions: JSON.stringify(["friday", "saturday"]),
      intensity: "medium",
      requirements:
        "Oude kleding. Veiligheidsschoenen zijn aanwezig maar eigen is ook prima. Knielappen handig maar niet verplicht.",
      compensationType: "expenses",
      compensationAmount: 25,
      isActive: true,
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { id: "seed-listing-2" },
    update: {},
    create: {
      id: "seed-listing-2",
      entrepreneurId: entrepreneur.id,
      title: "Parket leggen in woonkamer vrijstaande woning",
      description:
        "In een vrijstaande woning in Amstelveen leggen we eiken parket van ~60m². Werkzaamheden: ondervloer egaliseren, parket leggen, plinten monteren. Een rustige dag met veel te leren over ambachtelijk vloerwerk.",
      city: "Amstelveen",
      dayOptions: JSON.stringify(["wednesday", "thursday"]),
      intensity: "medium",
      requirements: "Oude kleding. Knieën beschermen is handig. Je hoeft geen ervaring te hebben.",
      compensationType: "daily_rate",
      compensationAmount: 75,
      isActive: true,
    },
  });

  const listing3 = await prisma.listing.upsert({
    where: { id: "seed-listing-3" },
    update: {},
    create: {
      id: "seed-listing-3",
      entrepreneurId: entrepreneur2.id,
      title: "Schilder mee aan buitengevel woonhuis",
      description:
        "We schilderen de buitengevel van een rijtjeshuis in Rotterdam-Noord. Twee verdiepingen, steigerdelen staan al. Werkzaamheden: afplakken, schilderen, schuren. Leer alles over buitenschilderwerk!",
      city: "Rotterdam",
      dayOptions: JSON.stringify(["monday", "tuesday", "friday"]),
      intensity: "medium",
      requirements: "Oud t-shirt en broek (verft er op). Werkhoogte max 5 meter. Niet geschikt bij hoogtevrees.",
      compensationType: "none",
      isActive: true,
    },
  });

  // ─── Application + Match for demo ────────────────────────────────────────────
  const existingApp = await prisma.application.findUnique({
    where: {
      listingId_helperId: {
        listingId: listing1.id,
        helperId: helper.id,
      },
    },
  });

  let application;
  if (!existingApp) {
    application = await prisma.application.create({
      data: {
        listingId: listing1.id,
        helperId: helper.id,
        message:
          "Hoi Pieter! Ik ben Lars, marketing manager. Ik wil graag een dagje mee om te leren hoe vloeren leggen werkt. Vrijdag past me perfect!",
        preferredDay: "friday",
        status: "accepted",
      },
    });
  } else {
    application = existingApp;
    if (existingApp.status === "pending") {
      application = await prisma.application.update({
        where: { id: existingApp.id },
        data: { status: "accepted" },
      });
    }
  }

  // Match
  const existingMatch = await prisma.match.findUnique({
    where: { applicationId: application.id },
  });

  let match;
  if (!existingMatch) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    // Set to next Friday
    futureDate.setDate(
      futureDate.getDate() + ((5 - futureDate.getDay() + 7) % 7 || 7)
    );
    futureDate.setHours(8, 0, 0, 0);

    match = await prisma.match.create({
      data: {
        applicationId: application.id,
        scheduledDate: futureDate,
        status: "scheduled",
      },
    });
  } else {
    match = existingMatch;
  }

  // Messages in the match
  const msgCount = await prisma.message.count({ where: { matchId: match.id } });
  if (msgCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          matchId: match.id,
          senderId: entrepreneur.id,
          content:
            "Hoi Lars! Fijn dat je meekomt. We beginnen om 8:00. Adres: Jordaan 12, Amsterdam. Tot dan!",
        },
        {
          matchId: match.id,
          senderId: helper.id,
          content: "Top! Ik ben er. Moet ik nog iets meenemen?",
        },
        {
          matchId: match.id,
          senderId: entrepreneur.id,
          content: "Eigen lunchpakket is handig. Ik heb koffie. Oudere kleding aantrekken!",
        },
      ],
    });
  }

  console.log("✅ Seed voltooid!");
  console.log(`
📋 Test accounts (wachtwoord: password123):
   👷 Helper:       helper@test.nl  (Lars Bakker, Amsterdam)
   👷 Helper 2:     helper2@test.nl (Sophie van Dijk, Rotterdam)
   🔨 Ondernemer:   ondernemer@test.nl (Vloeren De Vries)
   🔨 Ondernemer 2: schilder@test.nl (Schildersbedrijf Jansen)

🏠 3 hulpvragen aangemaakt
🤝 1 match aangemaakt met demo berichten
  `);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
