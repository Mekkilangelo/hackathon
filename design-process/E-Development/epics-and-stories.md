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
| 4 | Modules User & Restaurant | ✅ Terminé |
| 5 | Chat Sebastian + Recommendation | 🔧 En cours (collègue) |
| 6 | Pages Résultats & Fiches | ❌ À faire |
| 7 | Bouton Surprise + Polish | ❌ À faire |
| 8 | Back Office (admin) | ❌ À faire — **1pt barème** |
| 9 | Déploiement | ❌ À faire — **2pts barème** |

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
**Statut : Terminé**

- [x] Init Express + TypeScript (structure modulaire)
- [x] Setup Prisma + PostgreSQL + Docker Compose
- [x] Schema Prisma (5 modèles, enums, indexes, @@map)
- [x] Seed 20 restaurants
- [x] Shared middleware (error handler, validation Zod)
- [x] Singleton PrismaClient (`shared/database/prisma.ts`)

### Correctifs appliqués
- [x] Enums Prisma (`MichelinType`, `ChatRole`) au lieu de strings
- [x] Indexes sur les colonnes filtrées (cuisine, zone, michelinType, priceRange, userId, sessionId)
- [x] `@@map()` pour convention snake_case en DB
- [x] PrismaClient singleton (plus de `new PrismaClient()` dans chaque route)
- [x] `.env` retiré du git, `.env.example` complété (LLM_API_KEY, LLM_MODEL)
- [x] Config serveur étendue (config LLM)

---

## Epic 3 : Onboarding Quiz ✅
**Statut : Terminé**

- [x] Composants Quiz (QuizStep, QuizProgress, QuizOption)
- [x] Flux 7 étapes
- [x] Intégration API (POST /users + POST /profile)
- [x] localStorage userId

---

## Epic 4 : Modules User & Restaurant ✅
**Statut : Terminé**

- [x] Module User complet (DTO, Repository, Service, Controller, Routes)
- [x] Module Restaurant complet (filtres, DTO card/detail)

### Correctifs appliqués
- [x] DTO alignés avec enums Prisma (`MichelinType` au lieu de string)
- [x] Import singleton Prisma au lieu de `new PrismaClient()`

---

## Epic 5 : Chat Sebastian + Recommendation 🔧
**Statut : En cours (travaillé par collègue)**

### Backend — Module Chat + LLM

- [ ] **5.1** LLM Service avec Proxy Pattern
  - `chat/llm/llm.interface.ts` : interface ILLMService
  - `chat/llm/llm.service.ts` : appel API LLM (utiliser `config.llm.apiKey` + `config.llm.model`)
  - `chat/llm/llm-cache.proxy.ts` : Proxy cache in-memory, TTL 1h
  - `chat/prompts/sebastian.prompt.ts` : system prompt majordome

- [ ] **5.2** Module Chat — couche complète
  - `chat.dto.ts` : CreateSessionDTO, SendMessageDTO, ChatMessageDTO
  - `chat.repository.ts` : sessions + messages (utiliser `ChatRole` enum)
  - `chat.service.ts` : orchestration (profil + historique + LLM via Proxy)
  - `chat.controller.ts` + `chat.routes.ts`
  - **Important** : importer `prisma` depuis `../../shared/database/prisma`

### Backend — Module Recommendation

- [ ] **5.3** Strategy Pattern
  - `strategies/recommendation.strategy.ts` : interface
  - `strategies/profile-match.strategy.ts`
  - `strategies/contextual.strategy.ts`
  - `strategies/surprise.strategy.ts`

- [ ] **5.4** Factory + Service
  - `recommendation.factory.ts` : RecommendationContextFactory
  - `recommendation.service.ts` : agrège scores, retourne top 2-3
  - `recommendation.controller.ts` + `recommendation.routes.ts`

### Frontend — Interface Chat

- [ ] **5.5** Composants Chat (ChatBubble, ChatInput, SebastianAvatar)
- [ ] **5.6** Hook useChat + page Chat

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
✅ Epic 3 : Quiz Onboarding
✅ Epic 4 : Modules User & Restaurant
✅ Hygiène : gitignore, linter, README, singleton, enums

EN COURS ─────────────────────────────
🔧 Epic 5 : Chat Sebastian + Recommendation (collègue)

À FAIRE (par priorité) ──────────────
1. Epic 6 : Résultats & Fiches (complète le parcours)
2. Epic 8 : Back Office admin (1pt barème)
3. Epic 9 : Déploiement (2pts barème)
4. Epic 7 : Surprise + Polish
```

---

## Barème — Couverture actuelle

| Critère | Pts | Couverture | Epic(s) |
|---------|-----|-----------|---------|
| Architecture Backend | 2 | ✅ Modules, couches, patterns, enums, indexes | 2, 4, 5 |
| Architecture Frontend | 2 | ✅ App Router, composants, layout groups | 1, 3 |
| Modélisation & Persistance | 2 | ✅ Prisma, PG, enums, indexes, relations | 2 |
| Qualité code & Maintenabilité | 2 | ✅ ESLint, Prettier, README, conventions | Hygiène |
| Config & Déploiement | 2 | 🔧 Docker Compose local — **manque déploiement** | **Epic 9** |
| Design System intégré | 1 | ✅ Tokens CSS, shadcn/ui, palette | 1 |
| Fidélité design | 1 | 🔧 2 pages finies, reste à compléter | 6, 7 |
| Responsive & Animations | 1 | 🔧 Base OK, polish nécessaire | 7 |
| Back Office | 1 | ❌ **Pas encore fait** | **Epic 8** |
| Mobile-First | 1 | ✅ Container 430px, BottomNav, touch | 1 |
| Compréhension problème | 1 | ✅ Brief complet | — |
| Proposition innovante | 1 | ✅ Empreinte, FOMO, majordome IA | — |
| MVP fonctionnel | 1 | 🔧 Parcours incomplet | 5, 6 |
| Qualité démo | 1 | 🔧 Dépend du parcours complet | 5, 6, 7 |
| Pitch & Réponses | 1 | À préparer | — |
