# 🤝 OneDayHand

**OneDayHand** verbindt kantoorwerkers met praktische ondernemers voor 1 dag per week meehelpen.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Auth**: NextAuth.js met credentials (email + wachtwoord)
- **Database**: SQLite via Prisma ORM
- **Validatie**: Zod

---

## Installatie

### 1. Kloon en installeer dependencies

```bash
cd onedayhand
npm install
```

### 2. Environment variabelen

Kopieer `.env.example` naar `.env`:

```bash
cp .env.example .env
```

Pas aan indien nodig (standaard werkt lokaal):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="jouw-secret-minimaal-32-tekens"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database aanmaken & migreren

```bash
npm run db:migrate
```

> Geef de migratie een naam, bijv. `init`

### 4. Seed data laden

```bash
npm run db:seed
```

Dit maakt aan:
- 2 helper accounts
- 2 ondernemer accounts
- 3 hulpvragen
- 1 match met demo berichten

**Test accounts** (wachtwoord: `password123`):
| Email | Rol | Naam |
|---|---|---|
| helper@test.nl | Kantoorwerker | Lars Bakker (Amsterdam) |
| helper2@test.nl | Kantoorwerker | Sophie van Dijk (Rotterdam) |
| ondernemer@test.nl | Ondernemer | Vloeren De Vries (Amsterdam) |
| schilder@test.nl | Ondernemer | Schildersbedrijf Jansen (Rotterdam) |

### 5. Starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Handige commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio (DB UI)
npm run db:reset     # Reset DB + herseeden
```

---

## Pagina's & flows

| Pagina | URL | Beschrijving |
|---|---|---|
| Landing | `/` | Uitleg + CTA |
| Login | `/auth/login` | Inloggen |
| Registreren | `/auth/register` | Account aanmaken |
| Rol kiezen | `/onboarding/role` | Helper of Ondernemer |
| Profiel aanmaken | `/onboarding/profile` | Profiel wizard |
| Dashboard | `/dashboard` | Rol-specifiek dashboard + notificaties |
| Hulpvragen | `/listings` | Browse + filter (stad, dag, intensiteit, vakgebied) |
| Hulpvraag detail | `/listings/[id]` | Detail + aanvragen (helper) / aanvragen bekijken (ondernemer) |
| Nieuwe hulpvraag | `/listings/new` | Hulpvraag plaatsen (alleen ondernemer) |
| Matches | `/matches` | Overzicht matches + aanvragen |
| Match detail | `/matches/[id]` | Chat + review na afloop |
| Profiel | `/profile` | Bekijken + bewerken + uitloggen |

---

## Data model

```
User
├── ProfileHelper (1:1)
├── ProfileEntrepreneur (1:1)
├── Listing[] (als entrepreneur)
├── Application[] (als helper)
├── Message[] (verzonden)
├── Review[] (gegeven / ontvangen)

Listing → Application → Match → Message[]
                              → Review[]
```

---

## Match score algoritme

Helpers zien hulpvragen gesorteerd op **match score** (0–100):

| Criterium | Punten |
|---|---|
| Zelfde stad | +40 |
| Dag overlap (per dag) | +20 (max 40) |
| Intensiteit match | +20 (exact) / +10 (1 stap lager) |

---

## Lokaal runnen – stappenplan

```bash
# 1. Installeer packages
npm install

# 2. Maak .env aan
cp .env.example .env

# 3. Migreer database
npm run db:migrate
# → Geef naam: init

# 4. Seed test data
npm run db:seed

# 5. Start app
npm run dev

# 6. Open browser
open http://localhost:3000

# 7. Log in met test account
# Email:    helper@test.nl
# Wachtwoord: password123
```

---

## Projectstructuur

```
onedayhand/
├── prisma/
│   ├── schema.prisma       # Datamodel
│   └── seed.ts             # Test data
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing
│   │   ├── dashboard/page.tsx          # Dashboard (rol-specifiek)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── onboarding/
│   │   │   ├── role/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx                # Browse + filter
│   │   │   ├── new/page.tsx            # Nieuwe hulpvraag
│   │   │   └── [id]/page.tsx           # Detail + aanvragen
│   │   ├── matches/
│   │   │   ├── page.tsx                # Overzicht
│   │   │   └── [id]/page.tsx           # Detail + chat + review
│   │   └── profile/page.tsx            # Profiel + uitloggen
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SessionProvider.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── lib/
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── prisma.ts                   # Prisma client
│   │   ├── constants.ts                # Labels, types, etc.
│   │   ├── utils.ts                    # Helpers + match score
│   │   └── actions/
│   │       ├── auth.ts                 # Register
│   │       ├── onboarding.ts           # Profiel opslaan
│   │       ├── listings.ts             # CRUD listings
│   │       ├── applications.ts         # Aanvragen + accepteren
│   │       ├── messages.ts             # Berichten sturen
│   │       └── reviews.ts              # Reviews plaatsen
│   └── types/
│       └── next-auth.d.ts              # Type extensions
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
