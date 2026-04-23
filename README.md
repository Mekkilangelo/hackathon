# Sebastian — Le Majordome Michelin

Application web mobile-first qui réinvente la prescription gastronomique du Guide Michelin pour les 25-30 ans via un majordome IA personnalisé.

## Stack technique

| Couche          | Technologie                                        |
| --------------- | -------------------------------------------------- |
| Frontend        | Next.js 16 · React 19 · shadcn/ui · Tailwind CSS 4 |
| Backend         | Express · TypeScript · Zod                         |
| Base de données | PostgreSQL 16 · Prisma ORM                         |
| IA              | LLM API (Claude)                                   |

## Architecture

**Monolithe modulaire** — séparation front/back, modules isolés (User, Restaurant, Recommendation, Chat), architecture en couches Controller → Service → Repository.

Design patterns : Repository, Strategy, Proxy, Factory, DTO.

## Prérequis

- Node.js ≥ 18
- Docker & Docker Compose (pour PostgreSQL)
- npm

## Installation

```bash
# 1. Cloner le repo
git clone <repo-url> && cd sebastian

# 2. Lancer PostgreSQL
cd backend && docker compose up -d

# 3. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# 4. Configurer l'environnement
cd ../backend
cp .env.example .env
# Éditer .env avec vos valeurs (LLM_API_KEY notamment)

# 5. Initialiser la base de données
npx prisma migrate dev
npm run seed

# 6. Lancer le projet
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Forcer le reset
npx prisma db push --force-reset
```

## Accès

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api
- **Health check** : http://localhost:3001/api/health
- **Prisma Studio** : `cd backend && npm run db:studio`

## Scripts disponibles

### Backend (`/backend`)

| Commande              | Description                           |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Serveur de développement (hot reload) |
| `npm run build`       | Compilation TypeScript                |
| `npm run start`       | Serveur de production                 |
| `npm run seed`        | Insérer les restaurants de test       |
| `npm run db:migrate`  | Lancer les migrations Prisma          |
| `npm run db:generate` | Générer le client Prisma              |
| `npm run db:studio`   | Interface visuelle Prisma             |
| `npm run lint`        | Vérification ESLint                   |

### Frontend (`/frontend`)

| Commande        | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Serveur de développement Next.js |
| `npm run build` | Build de production              |
| `npm run start` | Serveur de production            |
| `npm run lint`  | Vérification ESLint              |

## Structure du projet

```
├── frontend/          # Next.js — Interface utilisateur
│   ├── app/           # Pages (App Router)
│   ├── components/    # Composants React
│   └── lib/           # Client API, utilitaires
├── backend/           # Express — API REST
│   ├── src/modules/   # Modules métier (user, restaurant, chat, recommendation)
│   ├── src/shared/    # Middleware, database, interfaces
│   └── prisma/        # Schema, migrations, seed
└── design-process/    # Documentation projet (brief, architecture, epics)
```

## API Endpoints

| Méthode | Route                             | Description                      |
| ------- | --------------------------------- | -------------------------------- |
| `GET`   | `/api/health`                     | Health check                     |
| `POST`  | `/api/users`                      | Créer un utilisateur             |
| `GET`   | `/api/users/:id`                  | Récupérer un utilisateur         |
| `POST`  | `/api/users/:id/profile`          | Sauvegarder le profil            |
| `PUT`   | `/api/users/:id/profile`          | Mettre à jour le profil          |
| `GET`   | `/api/restaurants`                | Lister les restaurants (filtres) |
| `GET`   | `/api/restaurants/:id`            | Détail d'un restaurant           |
| `POST`  | `/api/chat/sessions`              | Créer une session chat           |
| `POST`  | `/api/chat/sessions/:id/messages` | Envoyer un message               |
| `GET`   | `/api/chat/sessions/:id/messages` | Historique                       |
| `POST`  | `/api/recommendations`            | Obtenir des recommandations      |
| `POST`  | `/api/recommendations/surprise`   | Surprends-moi                    |

## Équipe

Projet réalisé dans le cadre d'un hackathon ESGI — M1.

## Setup LLM

```bash
# à la racine du repo (pas en mode devcontainer)
# installer un modèle pour ollama
docker compose -f docker-compose.dev.yml exec ollama ollama pull phi3
```
