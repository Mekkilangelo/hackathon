# Guide de contribution — Sebastian

Ce document définit les règles de travail en équipe pour le projet Sebastian. Il couvre le gitflow, les conventions de commit, le linting, les tests et le process de développement.

---

## 1. Gitflow

### Branches

```
main              ← Production stable, jamais de push direct
  └── develop     ← Intégration, merge des features ici
        ├── feat/epic-5-chat-sebastian
        ├── feat/epic-6-results-page
        ├── feat/epic-8-backoffice
        ├── fix/onboarding-localstorage
        └── chore/deploy-config
```

### Règles

| Règle | Détail |
|-------|--------|
| **Jamais de push direct sur `main`** | Tout passe par `develop` via merge |
| **Jamais de push direct sur `develop`** | Tout passe par une branche feature/fix |
| **1 branche = 1 epic ou 1 story** | Nommage : `feat/epic-X-nom-court` ou `fix/description` |
| **Merge via Pull Request** | Review par au moins 1 autre membre |
| **Supprimer la branche après merge** | Garder le repo propre |

### Workflow quotidien

```bash
# 1. Se mettre à jour
git checkout develop
git pull origin develop

# 2. Créer sa branche
git checkout -b feat/epic-6-results-page

# 3. Travailler, commiter atomiquement (voir section commits)
git add frontend/app/results/page.tsx
git commit -m "feat(frontend): add results page with restaurant cards"

# 4. Pousser et créer une PR vers develop
git push -u origin feat/epic-6-results-page
# → Créer la PR sur GitHub vers develop

# 5. Après review et merge, nettoyer
git checkout develop
git pull origin develop
git branch -d feat/epic-6-results-page
```

### Quand merger develop → main ?

Uniquement quand le parcours complet fonctionne (Splash → Quiz → Chat → Résultats → Fiche) et que la démo est prête.

---

## 2. Commits atomiques

### Principe

Un commit = **une seule chose**. Si tu peux décrire ton commit avec "et" (ex: "ajoute le header **et** corrige le quiz"), c'est deux commits.

### Convention : Conventional Commits

Le format est **obligatoire** (enforced par commitlint + husky) :

```
<type>(<scope>): <description>
```

### Types autorisés

| Type | Quand l'utiliser | Exemple |
|------|-----------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(frontend): add restaurant detail page` |
| `fix` | Correction de bug | `fix(backend): handle null zone in profile` |
| `refactor` | Refactoring sans changement fonctionnel | `refactor(backend): extract prisma singleton` |
| `style` | Formatage, lint, pas de changement de code | `style(backend): fix eslint warnings` |
| `docs` | Documentation | `docs: add contributing guide` |
| `test` | Ajout ou modification de tests | `test(backend): add restaurant service tests` |
| `chore` | Maintenance, deps, config | `chore: add husky pre-commit hooks` |
| `ci` | CI/CD | `ci: add github actions workflow` |
| `perf` | Performance | `perf(backend): add db indexes on restaurant` |

### Scopes recommandés

- `frontend` — tout ce qui touche au dossier frontend/
- `backend` — tout ce qui touche au dossier backend/
- `db` — schema Prisma, migrations, seed
- `config` — configuration projet (ESLint, Prettier, etc.)
- Pas de scope si c'est transversal

### Exemples de bons commits

```
feat(frontend): add onboarding quiz step 1-7
feat(backend): implement user module with repository pattern
fix(frontend): guard localStorage access for SSR
refactor(backend): use prisma singleton instead of per-route instances
test(backend): add user service unit tests
chore: configure eslint and prettier
docs: add README with install instructions
```

### Exemples de mauvais commits

```
❌ "update"
❌ "fix stuff"
❌ "epic 4 ok"
❌ "WIP"
❌ "feat: add header and fix quiz and update styles"  (3 choses = 3 commits)
```

---

## 3. Hooks automatiques

### Pre-commit (lint-staged)

À chaque `git commit`, **avant** que le commit soit créé :
- ESLint tourne sur les fichiers **staged** uniquement
- Si le lint échoue → le commit est **bloqué**
- Correction auto quand possible (`--fix`)

### Commit-msg (commitlint)

À chaque `git commit`, **vérifie le message** :
- Doit respecter le format `type(scope): description`
- Si le format est invalide → le commit est **bloqué**

### Comment bypass (urgence uniquement)

```bash
git commit --no-verify -m "hotfix: ..."
```

> Ne jamais utiliser `--no-verify` en temps normal. Si le lint bloque, c'est qu'il y a un problème à corriger.

---

## 4. Tests

### Framework : Vitest

```bash
# Lancer les tests
cd backend && npm test

# Mode watch (pendant le dev)
cd backend && npm run test:watch

# Avec couverture
cd backend && npm run test:coverage
```

### Convention

- Les tests vivent **à côté** du fichier testé : `user.service.ts` → `user.service.test.ts`
- Tester les **services** en priorité (logique métier)
- Mocker les **repositories** (pas de DB dans les tests unitaires)
- Nommer les tests clairement : `should throw 404 when user not found`

### Structure d'un test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("NomDuService", () => {
  let service: MonService;
  let repo: MonRepository;

  beforeEach(() => {
    repo = { findById: vi.fn() } as unknown as MonRepository;
    service = new MonService(repo);
  });

  describe("maMethode", () => {
    it("should do something expected", async () => {
      vi.mocked(repo.findById).mockResolvedValue(mockData);
      const result = await service.maMethode("id");
      expect(result.name).toBe("expected");
    });
  });
});
```

### Quand écrire des tests

- **Obligatoire** : chaque nouveau service
- **Recommandé** : chaque nouveau controller (validation des inputs)
- **Optionnel en hackathon** : tests E2E, tests frontend

---

## 5. Process de développement

### Avant de coder

1. **Vérifier l'epic/story** dans `design-process/E-Development/epics-and-stories.md`
2. **Créer sa branche** depuis `develop` à jour
3. **Prévenir l'équipe** sur quel epic on travaille (éviter les conflits)

### Pendant le dev

1. **Commits atomiques** au fur et à mesure (pas un gros commit à la fin)
2. **Lancer les tests** avant de push : `npm test`
3. **Vérifier le lint** : `npm run lint`

### Après le dev

1. **Push la branche**
2. **Créer une PR** vers `develop` avec :
   - Titre clair (`feat(frontend): epic 6 — results page`)
   - Description des changements
   - Screenshots si c'est du frontend
3. **Review par un coéquipier** (même rapide)
4. **Merge** et supprimer la branche

### Checklist PR

- [ ] Le lint passe (`npm run lint`)
- [ ] Les tests passent (`npm test`)
- [ ] Le code suit l'architecture (Controller → Service → Repository)
- [ ] Les DTO sont à jour (front et back)
- [ ] Pas de `console.log` oublié
- [ ] Pas de secrets dans le code

---

## 6. Architecture — Rappel rapide

### Backend : ajouter un module

```
src/modules/mon-module/
├── mon-module.dto.ts         # Schemas Zod + interfaces DTO
├── mon-module.repository.ts  # Accès DB via prisma singleton
├── mon-module.service.ts     # Logique métier
├── mon-module.controller.ts  # Handlers Express
├── mon-module.routes.ts      # Routes + injection dépendances
└── mon-module.service.test.ts # Tests unitaires
```

**Règles :**
- Importer `prisma` depuis `../../shared/database/prisma` (singleton)
- Utiliser les enums Prisma (`MichelinType`, `ChatRole`)
- Valider les inputs avec Zod dans les DTO
- Les erreurs passent par `AppError` + `next(err)`

### Frontend : ajouter une page

```
app/ma-page/page.tsx          # Page component
components/ma-feature/        # Composants dédiés
lib/api.ts                    # Ajouter les endpoints
hooks/useMaFeature.ts         # Hook custom si nécessaire
```

**Règles :**
- `"use client"` en haut si state/effects
- Utiliser les design tokens CSS (`var(--rouge)`, `var(--or)`, etc.)
- Mobile-first (`.container-app` pour le layout)
- Typer les props et les réponses API

---

## 7. Commandes utiles

```bash
# ─── Développement ───────────────────────────
npm run dev:front          # Frontend (depuis la racine)
npm run dev:back           # Backend (depuis la racine)

# ─── Qualité ─────────────────────────────────
npm run lint               # Lint tout (front + back)
npm test                   # Tests backend

# ─── Base de données ────────────────────────
cd backend
docker compose up -d       # Lancer PostgreSQL
npm run db:migrate         # Appliquer les migrations
npm run seed               # Insérer les restaurants
npm run db:studio          # Interface visuelle Prisma

# ─── Git ─────────────────────────────────────
git checkout develop && git pull
git checkout -b feat/epic-X-description
# ... travailler ...
git add <fichiers-specifiques>
git commit -m "feat(scope): description"
git push -u origin feat/epic-X-description
```

---

## 8. Résumé des outils installés

| Outil | Rôle | Config |
|-------|------|--------|
| **Husky** | Git hooks automatiques | `.husky/pre-commit`, `.husky/commit-msg` |
| **lint-staged** | Lint uniquement les fichiers staged | `.lintstagedrc.json` |
| **commitlint** | Valide le format des commits | `commitlint.config.js` |
| **ESLint** | Analyse statique du code | `backend/eslint.config.mjs`, `frontend/eslint.config.mjs` |
| **Prettier** | Formatage du code | `.prettierrc` |
| **Vitest** | Tests unitaires backend | `backend/vitest.config.ts` |

---

## 9. En cas de problème

### Le commit est bloqué par le lint

```bash
# Voir les erreurs
npm run lint

# Corriger automatiquement
cd frontend && npx eslint --fix app/ components/ lib/
cd backend && npx eslint --fix src/
```

### Le commit est bloqué par commitlint

```bash
# Format attendu :
git commit -m "type(scope): description en minuscules"

# Exemples valides :
git commit -m "feat(frontend): add chat page"
git commit -m "fix(backend): handle missing profile"
git commit -m "chore: update dependencies"
```

### Conflit de merge

```bash
# 1. Mettre à jour develop
git checkout develop && git pull

# 2. Rebaser sa branche
git checkout feat/ma-feature
git rebase develop

# 3. Résoudre les conflits fichier par fichier
# 4. Continuer le rebase
git add .
git rebase --continue
```
