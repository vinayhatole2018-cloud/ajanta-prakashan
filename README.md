# Ajanta Prakashan — Conference & Event Management Platform

A production-grade, **database-first** conference management platform for Ajanta Prakashan, an academic publisher that organizes and publishes national/international conferences in partnership with colleges and universities.

Firestore is the single source of truth. Nothing dynamic (conferences, events, notifications, committees, media links, settings) is hardcoded in the frontend — the Admin Panel controls the database, and the public website simply reads it.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Firestore Schema](#firestore-schema)
- [Security Model](#security-model)
- [Getting Started](#getting-started)
- [Firebase Project Setup](#firebase-project-setup)
- [Initial Admin Setup](#initial-admin-setup)
- [Seeding Data](#seeding-data)
- [PWA & Push Notifications](#pwa--push-notifications)
- [External Media URLs](#external-media-urls)
- [Database Cleanup](#database-cleanup)
- [CSV Export](#csv-export)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

**Public website**
- Home, conference listing (upcoming/past/all with search & filters), conference detail pages, events, notification center, public registration (no OTP), about/contact/privacy/terms
- Fully responsive, installable PWA with offline fallback
- WhatsApp integration, brochure downloads, registration/paper-submission links — all admin-configured URLs

**Admin panel** (`/admin`)
- Firebase Authentication + Firestore-backed authorization (`admins/{uid}`)
- Dashboard with live stats and charts
- Full CRUD: Conferences, Events, Notifications, Users, Committees, Media URLs, Settings
- Publish / Unpublish / Archive workflows, confirmation dialogs on destructive actions
- Paginated, searchable, filterable tables everywhere; CSV export for users
- Database overview + cleanup tools
- Admin activity log (audit trail)

**No Firebase Storage** — every image/PDF/QR is referenced by URL only (see [External Media URLs](#external-media-urls)).

## Architecture

```
                    PUBLIC WEBSITE (Next.js App Router, client components)
                           |
                           v
                    Service Layer (src/services/*)
                           |
                           v
                     Cloud Firestore
                           ^
                           |
                  Admin Service Layer (same services, admin-authorized writes)
                           ^
                           |
                     ADMIN PANEL (/admin)
                           |
                           v
                  Firebase Authentication + admins/{uid} authorization
```

Every page — public or admin — calls a function in `src/services/*`, never Firestore directly. If the database is empty, the UI shows an explicit empty state ("No upcoming conferences available.") — it never falls back to hardcoded content.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | Cloud Firestore |
| Auth | Firebase Authentication (Email/Password) |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |
| Charts | Recharts |
| PWA | Hand-written manifest + service worker (`public/sw.js`) — full control over what is cached, so admin data is never cached |
| Push | Firebase Cloud Messaging (architecture wired in `src/firebase/messaging.ts`; needs a VAPID key to activate) |

No Vite/React Router — this app uses Next.js App Router, which better matches route-group layouts (`(public)` vs `admin`) and file-based routing for the dozens of routes this spec requires.

## Folder Structure

```
src/
  app/
    (public)/            # public route group: /, /conferences, /events, /notifications, /register, ...
    admin/
      page.tsx           # /admin login
      login/page.tsx     # redirects to /admin
      (protected)/       # route group wrapped in <AdminRoute> (auth + authorization guard)
        dashboard/ users/ conferences/ events/ notifications/ media/ committees/ payment/ database/ settings/ profile/ logs/
  components/
    common/               # Button, Card, Modal, ConfirmDialog, DataTable primitives, FormControls, Toast...
    public/               # Navbar, Footer, ConferenceCard, EventCard, CTAButtons, CommitteeSection...
    admin/                # AdminSidebar, AdminShell, AdminRoute, *Form components
  firebase/               # config.ts, auth.ts, firestore.ts, messaging.ts — no storage.ts, ever
  services/               # one file per collection: conferenceService, eventService, userService, ...
  hooks/                  # useCursorPagination, useDebounce, useSiteSettings
  contexts/               # AdminAuthContext, ToastContext
  schemas/                # Zod schemas per form
  types/                  # TypeScript types per collection
  utils/                  # csv.ts, date.ts, url.ts, cn.ts, id.ts
scripts/
  seed.ts                 # seeds settings + 2 real conferences (from the brochures) + committees + media
  create-admin.ts         # authorizes (and if needed creates) an admin account
firestore.rules
firestore.indexes.json
public/
  manifest.webmanifest, sw.js, offline.html, images/, documents/
```

## Firestore Schema

```
users/{userId}                 fullName, mobile, email, city, taluka, designation, institution, state,
                                notificationEnabled, createdAt, updatedAt

conferences/{conferenceId}     title, subtitle, theme, description, date, startTime, endTime,
                                venue, address, city, state, mode (online|offline|hybrid),
                                organizer, coOrganizer,
                                bannerUrl, posterUrl, brochureUrl,               <- URLs only
                                registrationUrl, paperSubmissionUrl, whatsappUrl, websiteUrl,
                                contactEmail, contactPhone,
                                objectives[], tracks[{id,title,disciplines[]}],
                                subThemes[{id,category,items[]}],
                                registrationFees[{category,amount,currency,notes}],
                                importantDates[{label,date}],
                                paperGuidelines{...}, paymentInformation{...} | null,
                                status (draft|published|archived), createdAt, updatedAt

events/{eventId}               title, description, date, time, venue, conferenceId | null,
                                status, registrationUrl, whatsappUrl, eventUrl, createdAt, updatedAt

notifications/{notificationId} title, message, type, conferenceId | null, eventId | null,
                                imageUrl, scheduledAt, isPublished, createdAt, updatedAt

committees/{committeeId}       name, designation, institution, category, displayOrder,
                                conferenceId, createdAt, updatedAt

media/{mediaId}                title, type (banner|poster|brochure|logo|payment_qr|other),
                                url, conferenceId | null, createdAt, updatedAt

admins/{uid}                   uid, email, role: "admin", active, createdAt

settings/site                  websiteName, description, logoUrl, contactEmail, contactPhone,
                                address, whatsappUrl, socialLinks{}, footerText, privacyPolicy,
                                terms, updatedAt

adminLogs/{logId}              adminUid, adminEmail, action, resource, resourceId, timestamp
```

Relationships are by ID reference only (`events.conferenceId`, `notifications.conferenceId`, `committees.conferenceId`, `media.conferenceId`) — no duplicated conference objects embedded elsewhere.

## Security Model

`firestore.rules` implements:

- **`isAdmin()`** — the single authorization function every write rule calls: `request.auth != null && admins/{uid} exists && active == true && role == "admin"`.
- **`users`** — public `create` only with server-side field validation (`isValidRegistration()`); no public read/update/delete.
- **`conferences` / `events`** — public read only where `status == 'published'`; all writes admin-only.
- **`notifications`** — public read only where `isPublished == true`; all writes admin-only.
- **`committees` / `media` / `settings`** — public read (non-sensitive, needed for public pages); writes admin-only.
- **`admins`** — a user may read *only their own* record (for the client-side authorization check); no client writes at all — admin accounts are provisioned via `scripts/create-admin.ts` or the Firebase Console only.
- **`adminLogs`** — admin-only read; admin-only append (no update/delete — audit trail).
- Everything else is denied by default.

This is enforced **server-side** — the `/admin` URL and the `AdminRoute` React guard are UX conveniences, not the security boundary.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase config (see below)
npm run dev
```

Open http://localhost:3000. Admin panel is at http://localhost:3000/admin.

## Firebase Project Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Authentication → Get Started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (Native mode, any region, production mode).
4. **Project Settings → General → Your apps → Add app (Web)**. Copy the config values into `.env.local` (see `.env.example`) as `NEXT_PUBLIC_FIREBASE_*`. Do **not** use the `storageBucket` value anywhere in application code — this app never imports `firebase/storage`.
5. **Project Settings → Service Accounts → Generate new private key.** Save the JSON as `serviceAccountKey.json` in the project root (already gitignored). This is only used by the two scripts below — never bundled into the client.
6. Deploy security rules and indexes:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore --project <your-project-id>
   ```
   (Or, non-interactively, set `GOOGLE_APPLICATION_CREDENTIALS` to your service account path instead of logging in.)
7. (Optional) **Project Settings → Cloud Messaging → Web Push certificates → Generate key pair** — put it in `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to activate push notifications.

## Initial Admin Setup

There is no public admin sign-up — by design. Create the first admin with:

```bash
npm run create-admin -- admin@yourdomain.com
```

If no Firebase Authentication user exists for that email yet, the script creates one with a generated password (printed once — save it) and immediately authorizes it by writing `admins/{uid}`. To set your own password instead:

```bash
npm run create-admin -- admin@yourdomain.com "YourChosenPassword123!"
```

Then open `/admin`, log in, and you're in the dashboard. Future admins can be authorized the same way (re-running the script for a different email) — there is no in-app "create admin" flow, matching the spec's no-public-admin-registration requirement.

## Seeding Data

```bash
npm run seed
```

Populates `settings/site` and two real conferences (BJCC & APCC's "Atmanirbhar Bharat" national conference, and TMV's Lokmanya Tilak Law College conference), each with their real committee members, registration fees, important dates, paper guidelines and payment details — sourced directly from the two brochures in `_source_assets/`. Re-running the script upserts (fixed document IDs), it does not duplicate.

This is a **development seed**, not a requirement for the app to function — with an empty database the site correctly shows "No upcoming conferences available." rather than any hardcoded fallback.

## PWA & Push Notifications

- `public/manifest.webmanifest` + `public/sw.js` cover the **whole app**, admin included — the panel is installable, not just the public site.
- The service worker **never** intercepts or caches Firebase/Firestore/Auth traffic, and explicitly passes through everything under `/admin/*` untouched (network-only) — no admin data is ever written into a browser Cache Storage entry, per the no-cache-sensitive-data requirement.
- Static assets (`_next/static`, `/images`) are cache-first; navigations fall back to `public/offline.html` when offline.
- Push notifications: `src/firebase/messaging.ts` requests permission only on explicit user action (never on page load) and registers a token via FCM once `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set. Wiring this up to actually deliver server-sent notifications on `notifications` document creation requires a Cloud Function (not included — this repo intentionally has no server runtime beyond Next.js itself, since the spec forbids Firebase Storage but says nothing requires Cloud Functions; add one if you need real push delivery).

## External Media URLs

Firebase Storage is never imported or configured anywhere in this codebase (verify with `grep -r "firebase/storage" src/` — zero results). Every media field (`bannerUrl`, `posterUrl`, `brochureUrl`, `logoUrl`, `paymentQrUrl`) stores a URL string only.

- Zod schemas (`isSafeHttpsUrlOrLocalPath`) reject anything except `https://` URLs (or a same-origin `/path`, used only for the seeded demo assets under `/public`).
- Manage them centrally at `/admin/media`, or per-conference inside the conference edit form's "Media URLs" section.
- The seed script points these at files already committed under `/public/images` and `/public/documents` (the real brochures/posters) purely so the demo works immediately — swap them for real hosted HTTPS URLs (a CDN, GitHub raw, etc.) via `/admin/media` whenever you have them. Nothing else needs to change.

## Database Cleanup

`/admin/database` shows collection counts (via `getCountFromServer` — never a full collection scan) and:
- Lists published conferences whose date has passed and offers to **Archive All** in one confirmed action.
- Lists media records not linked to any conference and lets you delete them individually.
- Deleting a user, conference, event, notification, committee member or media record always shows a confirmation dialog first; conferences/events prefer **Archive** over permanent delete.

## CSV Export

`/admin/users → Export CSV` fetches up to 5,000 matching users (respecting any active filters) and downloads a CSV with Full Name, Mobile, Email, City, Taluka, Designation, Institution, State. Not exposed anywhere on the public site.

## Deployment

```bash
npm run build
npm run start   # or deploy the .next output to your platform of choice
```

**Vercel** (recommended, zero-config): connect the repo, set the `NEXT_PUBLIC_FIREBASE_*` env vars in the project settings, deploy.

**Netlify**: `netlify.toml` is included with `@netlify/plugin-nextjs`; set the same env vars in Site Settings.

**Firebase Hosting**: classic `firebase.json` Hosting rewrites don't run a Node SSR server on their own — either use [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) (framework-aware, supports Next.js natively) or export a static build if you don't need the two dynamic routes (`/conferences/[id]`, `/admin/conferences/[id]/edit`). `firebase.json` in this repo is configured for `firestore deploy` (rules + indexes) regardless of where you host the app itself.

Always run `firebase deploy --only firestore` (rules + indexes) whenever `firestore.rules` or `firestore.indexes.json` change — hosting deploys do not do this for you.

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Every page shows empty states, console shows `permission-denied` | Firestore rules not deployed yet, or Firestore database not created. Run through [Firebase Project Setup](#firebase-project-setup). |
| `/admin` login fails with "no configuration for provided identifier" | Email/Password sign-in isn't enabled — Authentication → Sign-in method → Email/Password. |
| Logged in but immediately see "Access Denied" | Your UID isn't in `admins/{uid}`, or `active` is false. Run `npm run create-admin -- <your-email>`. |
| Admin deploy scripts fail with a `serviceusage` 403 | The service account needs the **Editor** role (IAM & Admin → grant Editor to `...@<project>.iam.gserviceaccount.com`). Allow a minute for IAM propagation. |
| Seed script errors "service account key not found" | Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env.local` or place the key at `./serviceAccountKey.json`. |
| Images/PDFs don't load in production | You're still pointing at the seeded `/images` or `/documents` demo paths — replace with real hosted HTTPS URLs via `/admin/media`. |

---

Built with Next.js, TypeScript, Tailwind CSS and Firebase — no Firebase Storage, no hardcoded conference data.
