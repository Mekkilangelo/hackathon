# Architecture Technique — Sebastian

## 1. Décision Architecturale : Monolithe Modulaire

### Pourquoi pas microservices ?

| Critère | Microservices | Monolithe Modulaire |
|---------|--------------|---------------------|
| Équipe 2-3 | Overhead réseau, deploy, debug distribué | Un seul repo, un seul deploy |
| Hackathon | Trop de boilerplate infra | Focus sur la valeur métier |
| Complexité domaine | Overkill — 1 bounded context principal | Suffisant, modules bien découpés |
| Évolutivité | Extraction future possible | **Modules = futurs services** |

**Verdict :** Monolithe modulaire. Chaque module (User, Restaurant, Recommendation, Chat) est isolé avec ses propres couches. Le jour où Sebastian scale, on extrait un module en service sans refactoring majeur — c'est le principe du **Modular Monolith** (cf. Kamil Grzybek).

### Pourquoi séparer Front et Back ?

- **Séparation des responsabilités** : le front ne connaît pas la DB, le back ne connaît pas le DOM
- **Contrat API REST clair** : permet de brancher un autre client (mobile natif) plus tard
- **Travail parallèle** : Dev A (front) et Dev B (back) ne se marchent pas dessus
- Next.js API Routes aurait couplé front/back dans le même process — mauvaise séparation

---

## 2. Vue d'ensemble

```
┌──────────────────────────────────────┐
│           CLIENT (Next.js)           │
│      shadcn/ui + Tailwind CSS        │
│           Mobile-First               │
│                                      │
│  Onboarding │ Chat │ Results │ Fiche │
└──────────────┬───────────────────────┘
               │ HTTP REST (JSON)
               │
┌──────────────┴───────────────────────┐
│          API BACKEND (Express)        │
│         Monolithe Modulaire          │
│                                      │
│  ┌────────────────────────────────┐  │
│  │         Router (Express)       │  │
│  └──┬─────────┬──────────┬───────┘  │
│     │         │          │           │
│  ┌──┴───┐ ┌──┴────┐ ┌───┴────────┐ │
│  │ User │ │ Resto │ │ Recommend. │ │
│  │Module│ │Module │ │   Module   │ │
│  └──┬───┘ └──┬────┘ └───┬────────┘ │
│     │        │           │           │
│  ┌──┴────────┴───────────┴────────┐ │
│  │    Couche Repository (Prisma)  │ │
│  └────────────┬───────────────────┘ │
└───────────────┼─────────────────────┘
                │
        ┌───────┴────────┐
        │   PostgreSQL   │
        └────────────────┘
                          ┌──────────────┐
                          │   LLM API    │
                          │  (externe)   │
                          └──────────────┘
```

---

## 3. Architecture en couches (par module)

```
Controller  →  Service  →  Repository  →  DB
(route)        (métier)    (data access)   (Prisma/PG)
```

**Justification :** Séparation classique en 3 couches. Chaque couche a une responsabilité unique (SRP). Les dépendances pointent vers l'intérieur (Dependency Inversion).

---

## 4. Design Patterns utilisés

### 4.1 Repository Pattern
**Où :** Couche d'accès aux données (chaque module)
**Pourquoi :** Abstraire Prisma derrière une interface. Le Service ne sait pas qu'on utilise Prisma — on pourrait switcher vers TypeORM ou un mock en test sans toucher au métier.

```typescript
// interfaces/restaurant.repository.ts
interface IRestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  findByFilters(filters: RestaurantFilters): Promise<Restaurant[]>;
  create(data: CreateRestaurantDTO): Promise<Restaurant>;
}

// repositories/restaurant.repository.ts
class RestaurantRepository implements IRestaurantRepository {
  constructor(private prisma: PrismaClient) {}

  async findByFilters(filters: RestaurantFilters): Promise<Restaurant[]> {
    return this.prisma.restaurant.findMany({
      where: this.buildWhereClause(filters),
      include: { tags: true, michelinAward: true }
    });
  }
}
```

### 4.2 Strategy Pattern
**Où :** Module Recommendation — algorithme de matching
**Pourquoi :** Sebastian a plusieurs façons de recommander : par profil, par contexte conversationnel, par surprise ("Surprends-moi"). Plutôt qu'un `if/else` géant, chaque stratégie est encapsulée. On peut en ajouter sans modifier le code existant (Open/Closed Principle).

```typescript
// strategies/recommendation.strategy.ts
interface IRecommendationStrategy {
  score(restaurant: Restaurant, context: RecommendationContext): number;
}

class ProfileMatchStrategy implements IRecommendationStrategy {
  score(restaurant: Restaurant, context: RecommendationContext): number {
    // Matching cuisine, budget, ambiance vs profil utilisateur
  }
}

class ContextualStrategy implements IRecommendationStrategy {
  score(restaurant: Restaurant, context: RecommendationContext): number {
    // Matching avec les réponses du quiz ponctuel
  }
}

class SurpriseStrategy implements IRecommendationStrategy {
  score(restaurant: Restaurant, context: RecommendationContext): number {
    // Pondération aléatoire + diversité vs historique
  }
}

// service utilise les stratégies
class RecommendationService {
  constructor(private strategies: IRecommendationStrategy[]) {}

  recommend(restaurants: Restaurant[], context: RecommendationContext): Restaurant[] {
    const scored = restaurants.map(r => ({
      restaurant: r,
      score: this.strategies.reduce((sum, s) => sum + s.score(r, context), 0)
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }
}
```

### 4.3 Proxy Pattern
**Où :** Appels vers l'API LLM externe
**Pourquoi :** L'API LLM est coûteuse (tokens) et lente. Le Proxy intercepte les appels pour : (1) cache des réponses similaires, (2) rate limiting, (3) logging. Le Service consomme la même interface, il ne sait pas qu'il passe par un proxy.

```typescript
// interfaces/llm.service.ts
interface ILLMService {
  chat(messages: ChatMessage[], context: UserProfile): Promise<string>;
}

// services/llm.service.ts (implémentation réelle)
class LLMService implements ILLMService {
  async chat(messages: ChatMessage[], context: UserProfile): Promise<string> {
    // Appel direct à l'API LLM
  }
}

// proxies/llm-cache.proxy.ts
class LLMCacheProxy implements ILLMService {
  constructor(
    private llmService: ILLMService,
    private cache: Map<string, { response: string; timestamp: number }>
  ) {}

  async chat(messages: ChatMessage[], context: UserProfile): Promise<string> {
    const key = this.buildCacheKey(messages, context);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.response; // Cache hit (1h TTL)
    }

    const response = await this.llmService.chat(messages, context);
    this.cache.set(key, { response, timestamp: Date.now() });
    return response;
  }
}
```

### 4.4 Factory Pattern
**Où :** Création du contexte de recommandation
**Pourquoi :** Le contexte de recommandation se construit différemment selon la source (onboarding quiz, chat contextuel, bouton surprise). La Factory centralise cette logique de construction et évite de la disperser dans les controllers.

```typescript
// factories/recommendation-context.factory.ts
class RecommendationContextFactory {
  static fromOnboarding(profile: UserProfile): RecommendationContext {
    return {
      type: 'onboarding',
      preferences: profile,
      occasion: null,
      mood: null,
      strategies: ['profile-match']
    };
  }

  static fromChat(profile: UserProfile, chatHistory: ChatMessage[]): RecommendationContext {
    return {
      type: 'contextual',
      preferences: profile,
      occasion: this.extractOccasion(chatHistory),
      mood: this.extractMood(chatHistory),
      strategies: ['profile-match', 'contextual']
    };
  }

  static fromSurprise(profile: UserProfile): RecommendationContext {
    return {
      type: 'surprise',
      preferences: profile,
      occasion: null,
      mood: null,
      strategies: ['surprise', 'profile-match']
    };
  }
}
```

### 4.5 DTO Pattern (Data Transfer Object)
**Où :** Frontière entre couches et entre front/back
**Pourquoi :** Les entités DB (Prisma models) ne doivent jamais fuiter vers l'API. Les DTO définissent le contrat API explicitement — le front sait exactement ce qu'il reçoit, le back contrôle ce qu'il expose.

```typescript
// dto/restaurant.dto.ts
interface RestaurantCardDTO {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;        // 1-3
  michelinType: string;      // 'etoile' | 'bib' | 'verte'
  imageUrl: string;
  matchScore: number;        // 0-100
  tags: string[];
}

interface RestaurantDetailDTO extends RestaurantCardDTO {
  description: string;
  address: string;
  ambiance: string;
  hours: Record<string, string>;
  gallery: string[];
}
```

---

## 5. Modèle de données (PostgreSQL + Prisma)

```prisma
model User {
  id          String   @id @default(uuid())
  name        String
  createdAt   DateTime @default(now())
  profile     UserProfile?
  chatSessions ChatSession[]
}

model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  diet        String[] // ['vegan', 'halal', ...]
  budget      Int      // 1-3
  vibes       String[] // ['cozy', 'branché', ...]
  occasions   String[] // ['date', 'amis', ...]
  cuisines    String[] // ['française', 'japonaise', ...]
  zone        String?
  updatedAt   DateTime @updatedAt
}

model Restaurant {
  id            String   @id @default(uuid())
  name          String
  cuisine       String
  priceRange    Int      // 1-3
  michelinType  String   // 'etoile' | 'bib-gourmand' | 'etoile-verte'
  address       String
  zone          String
  description   String
  ambiance      String
  imageUrl      String
  gallery       String[]
  hours         Json
  tags          String[] // ['vegan-friendly', 'brunch', 'rooftop', ...]
  createdAt     DateTime @default(now())
}

model ChatSession {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  messages  ChatMessage[]
  createdAt DateTime @default(now())
}

model ChatMessage {
  id        String   @id @default(uuid())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id])
  role      String   // 'user' | 'sebastian'
  content   String
  metadata  Json?    // restaurants recommandés, etc.
  createdAt DateTime @default(now())
}
```

---

## 6. API REST — Endpoints

| Méthode | Route | Description | Module |
|---------|-------|-------------|--------|
| `POST` | `/api/users` | Créer un utilisateur | User |
| `GET` | `/api/users/:id` | Récupérer un utilisateur | User |
| `POST` | `/api/users/:id/profile` | Sauvegarder l'empreinte | User |
| `PUT` | `/api/users/:id/profile` | Mettre à jour l'empreinte | User |
| `GET` | `/api/restaurants` | Lister (filtres query params) | Restaurant |
| `GET` | `/api/restaurants/:id` | Détail d'un restaurant | Restaurant |
| `POST` | `/api/recommendations` | Demander 2-3 recommandations | Recommendation |
| `POST` | `/api/recommendations/surprise` | Surprends-moi | Recommendation |
| `POST` | `/api/chat/sessions` | Créer une session chat | Chat |
| `POST` | `/api/chat/sessions/:id/messages` | Envoyer un message à Sebastian | Chat |
| `GET` | `/api/chat/sessions/:id/messages` | Historique de la session | Chat |

---

## 7. Structure Backend

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Seed 20-30 restaurants
│   └── migrations/
├── src/
│   ├── index.ts                   # Entry point Express
│   ├── config/
│   │   └── index.ts               # Env vars, LLM config
│   │
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.dto.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── restaurant/
│   │   │   ├── restaurant.controller.ts
│   │   │   ├── restaurant.service.ts
│   │   │   ├── restaurant.repository.ts
│   │   │   ├── restaurant.dto.ts
│   │   │   └── restaurant.routes.ts
│   │   │
│   │   ├── recommendation/
│   │   │   ├── recommendation.controller.ts
│   │   │   ├── recommendation.service.ts
│   │   │   ├── recommendation.factory.ts     # Factory Pattern
│   │   │   ├── strategies/                    # Strategy Pattern
│   │   │   │   ├── recommendation.strategy.ts # Interface
│   │   │   │   ├── profile-match.strategy.ts
│   │   │   │   ├── contextual.strategy.ts
│   │   │   │   └── surprise.strategy.ts
│   │   │   ├── recommendation.dto.ts
│   │   │   └── recommendation.routes.ts
│   │   │
│   │   └── chat/
│   │       ├── chat.controller.ts
│   │       ├── chat.service.ts
│   │       ├── chat.repository.ts
│   │       ├── llm/
│   │       │   ├── llm.service.ts            # Implémentation réelle
│   │       │   ├── llm.interface.ts          # Interface (DIP)
│   │       │   └── llm-cache.proxy.ts        # Proxy Pattern
│   │       ├── prompts/
│   │       │   └── sebastian.prompt.ts       # System prompt
│   │       ├── chat.dto.ts
│   │       └── chat.routes.ts
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── error-handler.ts
│   │   │   └── validate.ts
│   │   └── interfaces/
│   │       └── repository.interface.ts       # Interface générique
│   │
│   └── router.ts                  # Agrégation des routes modules
│
├── package.json
├── tsconfig.json
└── .env
```

---

## 8. Structure Frontend (mise à jour)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Splash
│   │   ├── onboarding/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── results/page.tsx
│   │   └── restaurant/[id]/page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── quiz/
│   │   ├── chat/
│   │   ├── restaurant/
│   │   └── layout/
│   ├── lib/
│   │   └── api.ts                # Client HTTP → backend REST
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useChat.ts
│   │   └── useRestaurants.ts
│   └── styles/globals.css
├── tailwind.config.ts
└── package.json
```

---

## 9. Évolutivité — De la maquette à la prod

```
AUJOURD'HUI (Hackathon)          DEMAIN (Scale)
─────────────────────            ────────────────────
Monolithe modulaire       →     Extraction microservices
  modules/user            →       user-service
  modules/restaurant      →       restaurant-service
  modules/recommendation  →       recommendation-service
  modules/chat            →       chat-service

PostgreSQL unique         →     DB par service
LLM cache in-memory       →     Redis
Seed data                 →     API Michelin réelle
localStorage tokens       →     JWT + refresh tokens
```

Le monolithe modulaire est la bonne étape intermédiaire : on a la **séparation logique** sans le **coût opérationnel** du distribué. Chaque module respecte déjà ses propres interfaces — l'extraction sera mécanique, pas architecturale.

---

## 10. Résumé des patterns

| Pattern | Où | Pourquoi |
|---------|-----|----------|
| **Repository** | Chaque module (data layer) | Abstraction DB, testabilité, swappable |
| **Strategy** | Recommendation module | Algorithmes interchangeables sans if/else |
| **Proxy** | LLM service | Cache, rate limiting, logging transparent |
| **Factory** | Recommendation context | Construction centralisée selon la source |
| **DTO** | Frontière API | Contrat explicite, pas de fuite d'entité DB |
| **Dependency Inversion** | Partout (interfaces) | Couches hautes ne dépendent pas des basses |
