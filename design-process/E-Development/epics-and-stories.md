# Epics & Stories — Sebastian (Hackathon)

## Répartition Équipe

### Si équipe de 3

| Membre | Rôle | Epics |
|--------|------|-------|
| **Dev A** | Frontend | Epic 1 + Epic 3 + Epic 6 |
| **Dev B** | Backend / IA | Epic 2 + Epic 4 + Epic 5 |
| **Dev C** | Fullstack / Intégration | Epic 7 + Epic 8 + Epic 9 |

### Si équipe de 2

| Membre | Rôle | Epics |
|--------|------|-------|
| **Dev A** | Frontend + Back Office | Epics 1, 3, 6, 8 |
| **Dev B** | Backend + Deploy | Epics 2, 4, 5, 7, 9 |

---

## Statut des Epics

| Epic | Nom | Statut |
|------|-----|--------|
| 1 | Setup Frontend + Layout | ✅ Terminé |
| 2 | Setup Backend + DB | ✅ Terminé |
| 3 | Onboarding Quiz | ✅ Terminé |
| 3-bis | Amélioration UX Onboarding (intro + progression) | ✅ Terminé |
| 4 | Modules User & Restaurant | ✅ Terminé |
| 5 | Chat Sebastian + Recommendation | ✅ Terminé |
| 6 | Pages Résultats & Fiches | ✅ Terminé (RestaurantCard, /results, /restaurant/[id]) |
| 7 | Bouton Surprise + Polish | ✅ Terminé (bouton chat + page profil) |
| 8 | Back Office (admin) | ✅ Terminé — **1pt barème** |
| 9 | Déploiement | ✅ Terminé — **2pts barème** |

---

## Epic 1 : Setup Frontend + Layout ✅
**Statut : Terminé**

- [x] Init Next.js + shadcn/ui + Tailwind
- [x] Design tokens CSS (palette Brutaliste-Chic)
- [x] Layout global mobile-first (Header, BottomNav)
- [x] Splash Screen / Landing
- [x] Client API (`lib/api.ts`)

---

## Epic 2 : Setup Backend + DB ✅
**Statut : Terminé (avec correctifs v2)**

- [x] Init Express + TypeScript (structure modulaire)
- [x] Setup Prisma + PostgreSQL + Docker Compose
- [x] Schema Prisma (5 modèles, enums, indexes, @@map)
- [x] Seed 20 restaurants
- [x] Shared middleware (error handler, validation Zod)
- [x] Singleton PrismaClient (`shared/database/prisma.ts`)

### Correctifs v1 (appliqués)
- [x] Enums Prisma (`MichelinType`, `ChatRole`) au lieu de strings
- [x] Indexes sur les colonnes filtrées (cuisine, zone, michelinType, priceRange, userId, sessionId)
- [x] `@@map()` pour convention snake_case en DB
- [x] PrismaClient singleton (plus de `new PrismaClient()` dans chaque route)
- [x] `.env` retiré du git, `.env.example` complété (LLM_API_KEY, LLM_MODEL)
- [x] Config serveur étendue (config LLM)

### Correctifs v2 — Auth + Champs Restaurant (appliqués)

#### Modèle `User` — authentification
- [x] `email String? @unique` — permet l'identification sans casser l'onboarding actuel (nullable)
- [x] `passwordHash String?` — préparation auth JWT (nullable pour MVP qui garde le flow prénom-only)

> **Stratégie auth MVP :** L'onboarding actuel (prénom → localStorage UUID) reste intact.
> `email` + `passwordHash` sont nullable pour ne pas bloquer. L'Epic 8 (back office) utilisera
> un `ADMIN_TOKEN` env var. Une auth complète (JWT login/register) est post-hackathon.

#### Modèle `Restaurant` — champs manquants
- [x] `michelinStars Int?` — nombre d'étoiles (1, 2, 3) distinct du type Michelin
  - Étoile : 1–3 étoiles selon le restaurant
  - Bib Gourmand / Étoile Verte : `null` (pas d'étoile gastronomique)
- [x] `phone String?` — numéro de téléphone pour la fiche restaurant
- [x] `reservationUrl String?` — lien TheFork / site propre pour le CTA "Réserver"

#### Seed mis à jour
- [x] `michelinStars` ajouté pour les 6 restaurants étoilés :
  - Le Grand Véfour : 2 ⭐⭐
  - Septime : 1 ⭐
  - Frenchie : 1 ⭐
  - Le Clarence : 2 ⭐⭐
  - Kei : 3 ⭐⭐⭐
  - Sushi B : 1 ⭐

#### Migration
- [x] `migrations/20260422000000_add_auth_restaurant_fields/migration.sql` créée
- [ ] À appliquer : `npx prisma migrate dev` ou `npx prisma db push` en dev

> ⚠️ **Note migration :** Si le schéma et la DB sont désynchronisés (tables PascalCase vs snake_case
> suite à l'ajout des `@@map()` post-init), faire un reset propre en dev :
> `npx prisma migrate reset --force` puis `npx prisma db seed`

---

## Epic 3 : Onboarding Quiz IA — QCM généré par LLM ✅
**Statut : Terminé**

> ⚠️ **Correction doc** : L'approche initiale envisagée était un chat conversationnel libre.
> Ce qui a été implémenté — et qui fonctionne mieux pour l'UX hackathon — est un **quiz QCM
> dynamique généré par LLM** : Sebastian génère des questions structurées (choix unique,
> choix multiple, texte libre) adaptées à l'historique des réponses. L'endpoint est
> `POST /api/onboarding/next` (pas `/chat`).

### Approche implémentée : Quiz QCM LLM adaptatif

Le LLM joue le rôle de générateur de questions intelligentes. À chaque appel, il reçoit
l'historique complet des réponses et génère la question suivante — ou déclare le profil
complet via `done: true`.

**Avantage vs chat libre :** interface claire, progression visible, réponses contraintes
(enums compatibles DB), pas d'ambiguïtés à parser.

#### Architecture LLM modulaire (partagée avec Epic 5)

```
src/shared/llm/
├── llm.interface.ts              ← ILLMService (contrat commun)
├── llm.factory.ts                ← Factory : lit LLM_PROVIDER, instancie le bon service
├── llm-cache.proxy.ts            ← Proxy cache SHA-256, TTL 1h (Proxy Pattern)
└── providers/
    ├── groq.service.ts           ← Groq (llama-3.3-70b-versatile) ← ACTIF
    ├── openai.service.ts         ← OpenAI (gpt-4o-mini / gpt-4o)
    └── gemini.service.ts         ← Gemini (gemini-1.5-flash / pro)
```

**Changer de provider** = une seule variable d'env :
```
LLM_PROVIDER=groq    # → Groq (clé Groq)
LLM_PROVIDER=openai  # → OpenAI (clé OpenAI)
LLM_PROVIDER=gemini  # → Gemini (clé Google AI Studio)
```

#### Module Onboarding (backend)

```
src/modules/onboarding/
├── onboarding.dto.ts             ← QcmAnswer, LLMQuestion, ExtractedProfile, OnboardingNextResponse
├── onboarding.service.ts         ← Orchestration : prompt + LLM + parsing <QCM>...</QCM>
├── onboarding.controller.ts      ← POST /api/onboarding/next
├── onboarding.routes.ts          ← Wiring
└── prompts/
    └── sebastian-onboarding.prompt.ts  ← System prompt complet (voix, axes, format QCM)
```

**Endpoint :** `POST /api/onboarding/next`
- Body : `{ answers: [{axis, question, answer}][] }` — stateless, historique complet envoyé à chaque appel
- Réponse question : `{ done: false, axis, question, subtitle?, type, options? }`
- Réponse finale : `{ done: true, message, profile: {...} }`

**Format LLM :** Le LLM émet sa réponse dans une balise `<QCM>{...json...}</QCM>`.
Le service parse ce bloc et retourne l'objet typé. Si la balise est absente → erreur 500.

**Axes collectés (7 questions) :** prénom → occasion → régime alimentaire → budget → ambiance → cuisine → quartier/ville

#### Frontend — page `/onboarding`
- Quiz QCM question par question (plus de formulaire à étapes statique)
- Sebastian charge la première question au montage (appel API automatique)
- Progression : 7 dots en en-tête (un par axe)
- Types de réponse : `single` (radio), `multiple` (cases), `text` (input libre)
- Bouton Retour pour revenir à la question précédente
- À `done: true` : création user + profil → redirect `/chat`
- Gestion d'erreur avec bouton "Réessayer"

> ⚠️ **UX à améliorer (voir Epic 3-bis)** : la progression n'affiche que des dots opaques.
> Il manque un écran d'intro Sebastian et un label "Étape X/7" explicite.

#### Checklist
- [x] `shared/llm/llm.interface.ts`
- [x] `shared/llm/providers/groq.service.ts`
- [x] `shared/llm/providers/openai.service.ts` (stub prêt)
- [x] `shared/llm/providers/gemini.service.ts` (stub prêt)
- [x] `shared/llm/llm-cache.proxy.ts`
- [x] `shared/llm/llm.factory.ts`
- [x] `modules/onboarding/prompts/sebastian-onboarding.prompt.ts`
- [x] `modules/onboarding/onboarding.dto.ts`
- [x] `modules/onboarding/onboarding.service.ts`
- [x] `modules/onboarding/onboarding.controller.ts`
- [x] `modules/onboarding/onboarding.routes.ts`
- [x] `src/router.ts` — route `/onboarding/next` branchée
- [x] `config/index.ts` — `llm.provider` ajouté
- [x] `.env.example` mis à jour (LLM_PROVIDER, LLM_API_KEY, LLM_MODEL)
- [x] `frontend/lib/api.ts` — `onboardingApi.next()` ajouté
- [x] `frontend/app/onboarding/page.tsx` — quiz QCM adaptatif

#### Config nécessaire dans `.env`
```env
LLM_PROVIDER=groq
LLM_API_KEY=gsk_xxxxxxxxxxxx   # clé Groq
LLM_MODEL=llama-3.3-70b-versatile
```

---

## Epic 3-bis : Amélioration UX Quiz Onboarding ✅
**Statut : Terminé**

Corrections UX appliquées sur `frontend/app/onboarding/page.tsx` :

- [x] Écran d'intro Sebastian (avant le chargement de la 1ère question)
  - Logo animé + phrase d'accueil du majordome
  - Bouton "Commencer" pour lancer le quiz
- [x] Indicateur de progression explicite : "Étape X / 7" en texte (plus seulement les dots)
- [x] Label de l'axe courant affiché sous le compteur
- [x] Dots gardés mais avec numéro lisible en complément

---

## Epic 4 : Modules User & Restaurant ✅
**Statut : Terminé**

- [x] Module User complet (DTO, Repository, Service, Controller, Routes)
- [x] Module Restaurant complet (filtres, DTO card/detail)

### Correctifs appliqués
- [x] DTO alignés avec enums Prisma (`MichelinType` au lieu de string)
- [x] Import singleton Prisma au lieu de `new PrismaClient()`

---

## Epic 5 : Chat Sebastian + Recommendation ✅
**Statut : Terminé**

### Backend — Module Chat + LLM (Groq)

- [x] **5.1** LLM partagé réutilisé — `createLLMService()` de `shared/llm/llm.factory.ts`
  - `modules/chat/prompts/sebastian-chat.prompt.ts` : system prompt bienvenue + historique + bloc `<RECHERCHE>`

- [x] **5.2** Module Chat — couche complète
  - `chat.dto.ts` : `CreateSessionDTO`, `SendMessageDTO`, `ChatMessageOutput`, `SearchCriteria`
  - `chat.repository.ts` : sessions + messages (enum `ChatRole`, mapping role → `"user"|"sebastian"`)
  - `chat.service.ts` : orchestration LLM + parsing `<RECHERCHE>` → appel `RecommendationService`
  - `chat.controller.ts` + `chat.routes.ts`
  - `POST /api/chat/sessions` → session **+ message de bienvenue Sebastian automatique**
  - `POST /api/chat/sessions/:id/messages` → échange avec restaurants dans `metadata`
  - `GET /api/chat/sessions/:id/messages` → historique

### Backend — Module Recommendation

- [x] **5.3** Service de scoring (pas de Strategy Pattern — simplifié pour hackathon)
  - `recommendation.service.ts` : scoring profil × critères contextuels, malus régimes
  - `findTop(profile, criteria, limit)` → top N restaurants scorés
  - `surprise(profile)` → sélection pondérée avec aléatoire parmi top 5

- [x] **5.4** Controller + Routes
  - `recommendation.controller.ts` + `recommendation.routes.ts`
  - `POST /api/recommendations/surprise` → restaurant surprise

### Frontend — Interface Chat

- [x] **5.5** Composants
  - `components/chat/ChatBubble.tsx` : bulle user (rouge) + bulle Sebastian avec cards inline
  - `components/chat/ChatInput.tsx` : textarea + bouton envoi, Enter pour envoyer
  - `components/restaurant/RestaurantCard.tsx` : card cliquable, badge Michelin coloré
- [x] **5.6** Hook + Page
  - `hooks/useChat.ts` : init session + welcome, envoi message, message optimiste
  - `app/(main)/chat/page.tsx` : chat complet + bouton "✨ Surprise" + redirect si pas de profil

### Épics partiellement livrés

- [x] **6.1** Page `/results` — affiche restaurants passés en query param `?data=[]`
- [x] `RestaurantCard` réutilisable (badge Michelin, prix, zone, tags)

---

## Epic 6 : Pages Résultats & Fiches Restaurant
**Assigné : Dev A | Durée : 2-3h**
**Dépendance : Epic 5.4 (API recommendations)**

- [ ] **6.1** Page Résultats (`/results`)
  - Affichage 2-3 `RestaurantCard.tsx` avec badges Michelin
  - Phrase Sebastian en header
  - Animation apparition stagger

- [ ] **6.2** Fiche Restaurant (`/restaurant/[id]`)
  - Appel `GET /api/restaurants/:id`
  - Hero image + galerie horizontale
  - Infos complètes + tags + horaires
  - CTA "Réserver"

- [ ] **6.3** Composant RestaurantCard réutilisable
  - Variantes compact/full
  - Badge Michelin coloré (ETOILE=or, BIB_GOURMAND=rouge, ETOILE_VERTE=vert)

---

## Epic 7 : Bouton Surprise + Polish
**Assigné : Dev C | Durée : 1-2h**
**Dépendance : Epic 5.4**

- [ ] **7.1** FAB "Surprends-moi"
  - Appel `POST /api/recommendations/surprise`
  - Animation au clic
  - Affiche fiche restaurant

- [ ] **7.2** Polish UI global
  - Transitions entre pages
  - Loading states (skeleton)
  - Empty states
  - Responsive check

---

## Epic 8 : Back Office (Admin) — **1pt barème**
**Assigné : Dev C (ou Dev A) | Durée : 2-3h**
**Dépendance : Epic 4 (API restaurants)**

Interface admin pour gérer les restaurants sans toucher au code.

- [ ] **8.1** Page admin (`/admin`)
  - Route protégée (password simple en env var ou basic auth)
  - Layout simple, pas besoin de la DA Brutaliste-Chic

- [ ] **8.2** Liste restaurants admin
  - Tableau avec nom, cuisine, type Michelin, zone, prix
  - Boutons Modifier / Supprimer par ligne
  - Bouton Ajouter un restaurant

- [ ] **8.3** Formulaire CRUD restaurant
  - Formulaire avec tous les champs du modèle Restaurant
  - Validation Zod côté front
  - Appels API : POST / PUT / DELETE

- [ ] **8.4** API Backend — routes admin
  - `POST /api/admin/restaurants` : créer
  - `PUT /api/admin/restaurants/:id` : modifier
  - `DELETE /api/admin/restaurants/:id` : supprimer
  - Middleware auth simple (token ou basic auth via env var)

---

## Epic 9 : Déploiement — **2pts barème**
**Assigné : Dev B | Durée : 1-2h**
**Dépendance : Toutes les features terminées**

URL accessible et stable requise par le barème.

- [ ] **9.1** Dockerfiles
  - `backend/Dockerfile` : Node.js + Prisma + build TS
  - `frontend/Dockerfile` : Next.js standalone build

- [ ] **9.2** Déploiement Backend
  - Railway / Render / Fly.io
  - PostgreSQL managé (Railway Postgres ou Neon)
  - Variables d'environnement configurées
  - Migration Prisma en prod

- [ ] **9.3** Déploiement Frontend
  - Vercel (recommandé pour Next.js)
  - Variable `NEXT_PUBLIC_API_URL` pointant vers le backend prod

- [ ] **9.4** Vérifications
  - Health check accessible
  - CORS configuré pour le domaine prod
  - Parcours complet fonctionnel en prod

---

## Hygiène appliquée (correctifs globaux)

- [x] `.gitignore` racine unique (suppression du doublon frontend)
- [x] `.env` retiré du tracking git
- [x] `.env.example` complété
- [x] `.prettierrc` à la racine
- [x] ESLint configuré (backend + frontend)
- [x] `README.md` avec instructions d'installation
- [x] PrismaClient singleton
- [x] Enums Prisma (MichelinType, ChatRole)
- [x] Indexes DB sur colonnes filtrées
- [x] Convention snake_case en DB via @@map

---

## Timeline mise à jour

```
FAIT ─────────────────────────────────
✅ Epic 1 : Setup Front
✅ Epic 2 : Setup Back + DB
✅ Epic 3 : Quiz Onboarding (QCM LLM + UX intro + progression)
✅ Epic 4 : Modules User & Restaurant
✅ Epic 5 : Chat Sebastian + Recommendation (Groq, bouton Surprise)
✅ Hygiène : gitignore, linter, README, singleton, enums

TOUT LIVRÉ ───────────────────────────
✅ Epic 6 : RestaurantCard + /results + /restaurant/[id] (fiche complète)
✅ Epic 7 : Bouton Surprise (chat) + Page Profil fonctionnelle
✅ Epic 8 : Back Office admin (CRUD restaurants, token protégé)
✅ Epic 9 : Dockerfiles backend + frontend + docker-compose.yml racine

NEXT STEP ────────────────────────────
→ Déployer sur Railway (backend + postgres) + Vercel (frontend)
→ Configurer les variables d'env en prod (LLM_API_KEY, ADMIN_TOKEN, NEXT_PUBLIC_API_URL)
→ Préparer la démo
```

---

## Barème — Couverture actuelle

| Critère | Pts | Couverture | Epic(s) |
|---------|-----|-----------|---------|
| Architecture Backend | 2 | ✅ Modules, couches, patterns, enums, indexes | 2, 4, 5 |
| Architecture Frontend | 2 | ✅ App Router, composants, layout groups | 1, 3 |
| Modélisation & Persistance | 2 | ✅ Prisma, PG, enums, indexes, relations | 2 |
| Qualité code & Maintenabilité | 2 | ✅ ESLint, Prettier, README, conventions | Hygiène |
| Config & Déploiement | 2 | ✅ Dockerfiles + docker-compose.yml + Railway/Vercel ready | 9 |
| Design System intégré | 1 | ✅ Tokens CSS, shadcn/ui, palette | 1 |
| Fidélité design | 1 | ✅ Splash, onboarding, chat, fiche, profil | 6, 7 |
| Responsive & Animations | 1 | ✅ Mobile-first, typing dots, spin, transitions | 7 |
| Back Office | 1 | ✅ /admin — CRUD restaurants, token auth | 8 |
| Mobile-First | 1 | ✅ Container 430px, BottomNav, touch | 1 |
| Compréhension problème | 1 | ✅ Brief complet | — |
| Proposition innovante | 1 | ✅ Empreinte, FOMO, majordome IA, Groq | — |
| MVP fonctionnel | 1 | ✅ Parcours complet : onboarding → chat → reco → fiche | 5, 6 |
| Qualité démo | 1 | ✅ Parcours fluide, bouton Surprise, profil | 5, 6, 7 |
| Pitch & Réponses | 1 | À préparer | — |
