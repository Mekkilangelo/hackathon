# Présentation Technique — Sebastian, Le Majordome Michelin

## Stack

| Couche           | Technologie                            | Justification                                                  |
| ---------------- | -------------------------------------- | -------------------------------------------------------------- |
| Frontend         | Next.js 16 (App Router)                | SSR/SSG, routing file-based, output `standalone` pour Docker |
| UI               | Tailwind CSS + shadcn/ui               | Design system cohérent, utilitaires CSS sans sur-ingénierie  |
| Backend          | Express + TypeScript (strict)          | Léger, maîtrisé, typage fort de bout en bout                |
| ORM              | Prisma 5                               | Schéma déclaratif, migrations, client typé auto-généré   |
| Base de données | PostgreSQL 16                          | Relationnelle, robuste, volume de données maîtrisé          |
| LLM              | Groq API —`llama-3.3-70b-versatile` | Inférence rapide, abstraite derrière `ILLMService`         |
| Conteneurisation | Docker Compose (3 services)            | Reproductibilité dev/prod, déploiement one-command           |

---

## Architecture

Choix : **monolithe modulaire** (vs microservices).

Raison : équipe peu nombreuse, hackathon, un seul bounded context dominant. Les modules sont déjà isolés — l'extraction en microservices est mécanique si Sebastian scale.

```
CLIENT Next.js
    │  HTTP REST/JSON
    ▼
EXPRESS API (monolithe modulaire)
    ├── modules/user
    ├── modules/restaurant
    ├── modules/chat          ← LLM ici
    ├── modules/onboarding
    └── modules/notifications
    │  Prisma ORM
    ▼
PostgreSQL
```

Chaque module suit la même structure en couches :

```
Controller → Service → Repository → DB
(HTTP)       (métier)  (Prisma)     (PG)
```

---

## Design Patterns implémentés

### Repository Pattern

Prisma est encapsulé derrière des repositories. Le Service ne connaît pas l'ORM — swappable sans toucher au métier.

### Proxy Pattern — LLM

`LLMCacheProxy` enveloppe `LLMService` (qui implémente `ILLMService`). Il intercepte chaque appel, calcule un hash du contexte + messages, et retourne la réponse en cache (TTL 1h) si disponible. Le Service en amont ne sait pas qu'il passe par un proxy.

### Strategy Pattern — Scoring

`scoreRestaurant()` dans `ChatService` applique une série de critères pondérés (cuisine, budget, ambiance, localisation, régime) pour classer les restaurants. Chaque critère est un score additif — extensible sans modifier l'algorithme principal.

### DTO + Validation Zod

Chaque frontière API a son schéma Zod (`RestaurantFiltersSchema`, `SendMessageSchema`…). Les entités Prisma ne fuitent jamais vers le client.

---

## Module Chat — Cœur du produit

Le chat est le module le plus complexe. Flux d'un message :

1. `POST /api/chat/sessions/:id/messages` reçoit `{ content, visitedRestaurantIds }`
2. `ChatService.sendMessage()` :
   - Charge l'historique de la session
   - Appelle `extractIntentFromHistory()` → LLM analyse si l'utilisateur veut des recommandations et extrait les filtres (cuisine, budget, ambiance, localisation)
   - Si intent = recommandation : requête filtrée en DB → scoring → top 3 restaurants injectés dans le contexte système
   - Construit le prompt système avec le profil utilisateur + restaurants disponibles
   - Appelle `ILLMService.chat()` (via le proxy cache)
   - Persiste le message et la réponse en DB avec les restaurants en métadonnée

### Extraction d'intention

`extractIntentFromHistory()` appelle le LLM une première fois avec un prompt structuré demandant un JSON `{ wantsRecommendations, cuisine, budget, ambiance, location }`. Le résultat guide la requête DB suivante.

### Normalisation des ambiances

Les vibes utilisateur (`cozy`, `branché`, `terrasse`, `gastro`) sont normalisées vers les valeurs du dataset avant la requête DB. Les mots-clés conversationnels (`romantique`, `intimiste`, `rooftop`…) sont mappés vers ces mêmes valeurs via `extractAmbianceFromMessage()`.

---

## Modèle de données

```prisma
User          — id, name, email, createdAt
UserProfile   — diet[], budget, vibes[], cuisines[], location (1-1 avec User)
Restaurant    — 18 908 entrées issues du dataset Michelin CSV
                (name, cuisine, location, priceRange, ambiance, award…)
ChatSession   — appartient à un User
ChatMessage   — role USER|SEBASTIAN, content, metadata JSON (restaurants)
PushSubscription — endpoint, keys (Web Push VAPID)
Event         — notifications "Instant Michelin" planifiées
```

Seed idempotent : `createMany` avec `skipDuplicates: true` sur 18 908 restaurants Michelin réels (dataset CSV).

---

## Endpoints principaux

| Méthode | Route                               | Rôle                                            |
| -------- | ----------------------------------- | ------------------------------------------------ |
| `POST` | `/api/users`                      | Créer un utilisateur                            |
| `POST` | `/api/users/:id/profile`          | Sauvegarder l'empreinte gastronomique            |
| `POST` | `/api/onboarding/complete`        | Onboarding LLM — quiz → profil                 |
| `GET`  | `/api/restaurants`                | Liste filtrée (cuisine, budget, ambiance, zone) |
| `GET`  | `/api/restaurants/:id`            | Fiche détaillée                                |
| `POST` | `/api/chat/sessions/:id/messages` | Message → Sebastian → réponse LLM             |
| `GET`  | `/api/chat/sessions/:id/messages` | Historique                                       |
| `POST` | `/api/notifications/subscribe`    | Abonnement Web Push                              |
| `GET`  | `/api/admin/stats`                | Back-office — stats globales                    |

---

## Infrastructure Docker

```yaml
services:
  postgres:   postgres:16-alpine  — port 5433
  backend:    build ./backend     — port 3001
  frontend:   build ./frontend    — port 3000
```

- `restart: unless-stopped` : relance automatique au reboot Docker Desktop
- Volume `postgres_data` : données persistées entre restarts
- Build multi-stage : image de production allégée (builder → runner)
- Backend : `npx prisma db push && node dist/index.js`
- Frontend : Next.js `output: standalone` → `node server.js`

---

## Qualité du code

- TypeScript strict sur frontend et backend
- Validation Zod sur toutes les entrées API
- Séparation claire Controller / Service / Repository
- Aucun commentaire cosmétique — nommage expressif
- `LLM_PROVIDER` configurable : Groq, OpenAI, ou tout provider compatible
- `.env` non commité — `.gitignore` inclut `.env`, `node_modules`, `dist`, `.next`

---

## Points de scalabilité identifiés

| Actuel (POC)                       | Production                          |
| ---------------------------------- | ----------------------------------- |
| LLM cache in-memory (Map)          | Redis                               |
| localStorage pour userId/sessionId | JWT + refresh tokens                |
| Seed CSV statique                  | API Michelin officielle             |
| Monolithe modulaire                | Extraction microservices par module |
| PostgreSQL unique                  | DB par service                      |
