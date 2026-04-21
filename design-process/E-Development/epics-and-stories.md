# Epics & Stories — Sebastian (Hackathon)

## Répartition Équipe

### Si équipe de 3

| Membre | Rôle | Epics |
|--------|------|-------|
| **Dev A** | Frontend | Epic 1 (Setup Front) + Epic 3 (Onboarding) + Epic 6 (Résultats & Fiches) |
| **Dev B** | Backend / API | Epic 2 (Setup Back + DB) + Epic 4 (Modules User & Restaurant) |
| **Dev C** | IA / Recommendation | Epic 5 (Chat Sebastian + Module Recommendation) + Epic 7 (Surprise) |

### Si équipe de 2

| Membre | Rôle | Epics |
|--------|------|-------|
| **Dev A** | Frontend complet | Epics 1, 3, 6, 7 (front) |
| **Dev B** | Backend complet | Epics 2, 4, 5 |

---

## Epic 1 : Setup Frontend + Layout Global
**Assigné : Dev A**
**Durée : 1-2h**

- [ ] **1.1** Init Next.js + shadcn/ui + Tailwind
  - `npx create-next-app@latest frontend --typescript --tailwind --app`
  - Installer shadcn/ui (`npx shadcn@latest init`)
  - Configurer `tailwind.config.ts` avec la palette Brutaliste-Chic
  - `globals.css` : design tokens (couleurs, fonts)

- [ ] **1.2** Layout global mobile-first
  - `layout.tsx` : dark mode par défaut, meta viewport
  - `Header.tsx` : logo Sebastian
  - `BottomNav.tsx` : navigation mobile (Accueil, Chat, Profil)
  - Container centré max-width 430px sur desktop

- [ ] **1.3** Splash Screen / Landing
  - Logo Sebastian animé (CSS)
  - Tagline + CTA "Découvrir mes goûts" → `/onboarding`

- [ ] **1.4** Client API (`lib/api.ts`)
  - Classe/module centralisant les appels HTTP vers le backend
  - Base URL configurable via env var `NEXT_PUBLIC_API_URL`
  - Méthodes typées par endpoint (users, restaurants, chat, recommendations)

---

## Epic 2 : Setup Backend + Base de données
**Assigné : Dev B**
**Durée : 1-2h**

- [ ] **2.1** Init projet Express + TypeScript
  - Structure modulaire : `src/modules/`, `src/shared/`
  - `src/index.ts` : Express, CORS, JSON parser, error handler
  - `src/router.ts` : agrégation des routes par module
  - Scripts : `dev` (ts-node-dev), `build`, `seed`

- [ ] **2.2** Setup Prisma + PostgreSQL
  - `prisma init`, configurer `DATABASE_URL`
  - Écrire le `schema.prisma` complet (User, UserProfile, Restaurant, ChatSession, ChatMessage)
  - `prisma migrate dev` — migration initiale
  - `prisma generate`

- [ ] **2.3** Seed des restaurants
  - `prisma/seed.ts` : insérer 20-30 restaurants
  - Données réalistes : noms, cuisines, zones Paris, prix, tags
  - Types Michelin variés (étoile, Bib Gourmand, Étoile Verte)
  - Images Unsplash (URLs directes food/restaurant)

- [ ] **2.4** Shared : middleware & interfaces
  - `shared/middleware/error-handler.ts` : catch global, format erreur JSON
  - `shared/middleware/validate.ts` : validation DTO (zod)
  - `shared/interfaces/repository.interface.ts` : interface générique Repository

---

## Epic 3 : Onboarding — Quiz Empreinte Gastronomique
**Assigné : Dev A**
**Durée : 2-3h**
**Dépendance : Epic 1 (setup front), Epic 4.1 (POST /api/users + profile)**

- [ ] **3.1** Composants Quiz
  - `QuizStep.tsx` : container étape avec transition animée
  - `QuizProgress.tsx` : barre de progression (étape X/7)
  - `QuizOption.tsx` : carte cliquable (single ou multi-select)

- [ ] **3.2** Flux Quiz (7 étapes)
  - Étape 1 : Prénom (input texte)
  - Étape 2 : Préférences alimentaires (multi-select : vegan, halal, sans gluten, tout)
  - Étape 3 : Budget habituel (slider/select : €, €€, €€€)
  - Étape 4 : Ambiances préférées (multi-select : cozy, branché, rooftop, street-food, gastro)
  - Étape 5 : Occasions de sortie (multi-select : date, amis, solo, business, famille)
  - Étape 6 : Cuisines favorites (multi-select : française, italienne, japonaise, mexicaine, indienne, fusion)
  - Étape 7 : Zone préférée (select quartier Paris)

- [ ] **3.3** Intégration API
  - Au submit : `POST /api/users` → créer user
  - Puis `POST /api/users/:id/profile` → sauvegarder empreinte
  - Stocker userId en localStorage
  - Redirect vers `/chat`

---

## Epic 4 : Modules Backend — User & Restaurant
**Assigné : Dev B**
**Durée : 2-3h**
**Dépendance : Epic 2 (setup back + DB)**

### Module User

- [ ] **4.1** Couche complète User
  - `user.dto.ts` : CreateUserDTO, UserProfileDTO
  - `user.repository.ts` : implements IUserRepository (Prisma)
  - `user.service.ts` : logique création user + profil
  - `user.controller.ts` : validation input (zod) + réponse DTO
  - `user.routes.ts` : POST /users, GET /users/:id, POST /users/:id/profile, PUT /users/:id/profile

### Module Restaurant

- [ ] **4.2** Couche complète Restaurant
  - `restaurant.dto.ts` : RestaurantCardDTO, RestaurantDetailDTO
  - `restaurant.repository.ts` : implements IRestaurantRepository (Prisma)
    - `findByFilters()` : filtrage par cuisine, budget, zone, tags, type Michelin
  - `restaurant.service.ts` : logique de filtrage + mapping DTO
  - `restaurant.controller.ts` : parsing query params + réponse
  - `restaurant.routes.ts` : GET /restaurants, GET /restaurants/:id

---

## Epic 5 : Chat Sebastian — Backend IA + Frontend
**Assigné : Dev C (ou Dev B si équipe de 2)**
**Durée : 3-4h**
**Dépendance : Epic 2 (back), Epic 4 (modules user/resto)**

### Backend — Module Chat + LLM

- [ ] **5.1** LLM Service avec Proxy Pattern
  - `chat/llm/llm.interface.ts` : interface ILLMService
  - `chat/llm/llm.service.ts` : implémentation réelle (appel API LLM)
  - `chat/llm/llm-cache.proxy.ts` : Proxy — cache in-memory (Map), TTL 1h
  - `chat/prompts/sebastian.prompt.ts` : system prompt du majordome

- [ ] **5.2** Module Chat — couche complète
  - `chat.dto.ts` : CreateSessionDTO, SendMessageDTO, ChatMessageDTO
  - `chat.repository.ts` : sessions + messages (Prisma)
  - `chat.service.ts` : orchestration conversation
    - Reçoit message user → construit prompt (system + profil + historique + message)
    - Appelle LLMService (via Proxy)
    - Parse la réponse : texte + éventuellement restaurants recommandés (JSON)
    - Sauvegarde en DB
  - `chat.controller.ts` + `chat.routes.ts`
    - POST /chat/sessions (créer session)
    - POST /chat/sessions/:id/messages (envoyer message)
    - GET /chat/sessions/:id/messages (historique)

### Backend — Module Recommendation

- [ ] **5.3** Strategy Pattern — Algorithme de matching
  - `strategies/recommendation.strategy.ts` : interface IRecommendationStrategy
  - `strategies/profile-match.strategy.ts` : scoring profil vs restaurant (cuisine, budget, ambiance, tags)
  - `strategies/contextual.strategy.ts` : scoring contexte chat (occasion, mood extraits)
  - `strategies/surprise.strategy.ts` : pondération aléatoire + diversité

- [ ] **5.4** Factory + Service Recommendation
  - `recommendation.factory.ts` : RecommendationContextFactory
    - `fromChat()` : profil + historique conversation
    - `fromSurprise()` : profil + aléatoire
  - `recommendation.service.ts` : agrège les scores des stratégies, retourne top 2-3
  - `recommendation.controller.ts` + `recommendation.routes.ts`
    - POST /recommendations (body: userId, chatSessionId)
    - POST /recommendations/surprise (body: userId)

### Frontend — Interface Chat

- [ ] **5.5** Composants Chat
  - `ChatBubble.tsx` : bulle user (droite, or/champagne) vs Sebastian (gauche, marine)
  - `ChatInput.tsx` : input + bouton envoyer
  - `SebastianAvatar.tsx` : avatar étoile Michelin stylisée
  - Suggestions rapides cliquables : "Surprends-moi", "Un dîner ce soir", "Brunch dimanche"

- [ ] **5.6** Hook useChat + page Chat
  - `useChat.ts` : gestion état messages, appels API, loading
  - `chat/page.tsx` : layout conversation
  - Créer session au mount → envoyer messages → afficher réponses
  - Quand Sebastian recommande des restos → bouton "Voir les résultats" → `/results`

---

## Epic 6 : Pages Résultats & Fiche Restaurant
**Assigné : Dev A (ou Dev C)**
**Durée : 2-3h**
**Dépendance : Epic 4.2 (API restaurants), Epic 5.4 (API recommendations)**

- [ ] **6.1** Page Résultats (`/results`)
  - Appel GET résultats depuis state ou query params
  - Affichage 2-3 `RestaurantCard.tsx`
  - Chaque carte : image hero, nom, type Michelin (badge), prix, cuisine, matchScore (%)
  - Phrase Sebastian en header : "Voici mes recommandations pour toi..."
  - Animation apparition séquentielle (stagger)

- [ ] **6.2** Fiche Restaurant détail (`/restaurant/[id]`)
  - Appel `GET /api/restaurants/:id`
  - Hero image plein écran + galerie scroll horizontal
  - Infos : nom, cuisine, adresse, prix, badge Michelin
  - Description ambiance (texte)
  - Tags en chips
  - Horaires
  - CTA "Réserver" (lien externe fictif)
  - Bouton retour → résultats ou chat

- [ ] **6.3** Composant RestaurantCard réutilisable
  - Props typées depuis RestaurantCardDTO
  - Variantes : compact (dans le chat) / full (page résultats)
  - Badge Michelin coloré (étoile = or, bib = rouge, verte = vert)

---

## Epic 7 : Bouton "Surprends-moi" + Polish
**Assigné : Dev C (ou Dev A)**
**Durée : 1-2h**
**Dépendance : Epic 5.4 (API surprise)**

- [ ] **7.1** Bouton Surprends-moi
  - FAB (floating action button) accessible depuis chat et résultats
  - Appel `POST /api/recommendations/surprise` avec userId
  - Animation fun au clic (confetti ? spin ?)
  - Affiche directement la fiche du restaurant choisi

- [ ] **7.2** Polish UI global
  - Transitions entre pages (animations)
  - Loading states (skeleton / spinner Sebastian)
  - Empty states
  - Responsive check final

---

## Timeline Hackathon

```
PHASE 1 — Setup parallèle (H0 → H2)
├── Dev A : Epic 1 (Setup Front + Layout + Splash)
├── Dev B : Epic 2 (Setup Back + DB + Seed)
└── Dev C : Prépare prompts Sebastian + data restaurants

PHASE 2 — Features core en parallèle (H2 → H5)
├── Dev A : Epic 3 (Quiz Onboarding)
├── Dev B : Epic 4 (Modules User + Restaurant)
└── Dev C : Epic 5.1-5.4 (Chat backend + Recommendation)

PHASE 3 — Intégration + UI (H5 → H7)
├── Dev A : Epic 6 (Résultats + Fiches)
├── Dev B : Aide intégration + fix API
└── Dev C : Epic 5.5-5.6 (Chat frontend) + Epic 7.1 (Surprise)

PHASE 4 — Polish + Démo (H7 → H8)
├── Tous : Epic 7.2 (Polish)
├── Tous : Test parcours complet bout en bout
└── Tous : Préparer la démo
```

---

## Dépendances critiques

```
Epic 1 (Front setup) ──────────────────→ Epic 3 (Quiz)
                                              ↓
Epic 2 (Back setup) → Epic 4 (User/Resto) → Epic 3.3 (intégration)
                                              ↓
                   → Epic 5 (Chat + Reco) → Epic 6 (Résultats)
                                              ↓
                                         Epic 7 (Surprise)
```

**Point de synchro critique : H2** — Les setups front et back doivent être terminés pour que l'intégration commence.

---

## Definition of Done (Hackathon)

- [ ] Parcours complet : Splash → Quiz → Chat → Résultats → Fiche
- [ ] Backend REST fonctionnel avec PostgreSQL
- [ ] 5 design patterns implémentés et identifiables
- [ ] UI Brutaliste-Chic fidèle à la DA (dark mode, palette, typo)
- [ ] Sebastian répond de manière cohérente et personnalisée
- [ ] Mobile-first responsive
- [ ] Démo-ready
