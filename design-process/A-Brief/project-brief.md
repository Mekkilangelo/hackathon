# Product Brief — Sebastian, Le Majordome Michelin

## 1. Vision

**Mission :** Reconquérir les 25-30 ans en transformant le Guide Michelin d'une marque centenaire élitiste en un compagnon digital quotidien.

**Problème :** Le Guide Michelin a perdu ~85% de son influence auprès de la nouvelle génération en 20 ans. Perception élitiste, concurrence digitale (Instagram, TikTok, Google Maps), et décalage avec les nouveaux codes (mobile-first, authenticité, transparence).

**Solution :** Sebastian — un majordome IA gastronomique qui personnalise les recommandations Michelin via un système d'empreinte gastronomique, éliminant la paralysie du choix.

---

## 2. Concept Produit

### L'Empreinte Gastronomique
Quiz personnalisé à l'onboarding : préférences alimentaires (vegan, halal...), budget, types de lieux favoris, situations de vie.

### Le Goulot d'Étranglement (Quiz Ponctuel)
Lors d'une recherche active, Sebastian pose des questions contextuelles ("événement particulier ?", "envie du moment ?") et ne propose que **2-3 restaurants** ultra-pertinents.

### Notification FOMO (Modèle BeReal)
- **L'Instant Michelin :** Notification hebdomadaire aléatoire — une table, une heure, un menu dédié.
- **Bouton "Surprends-moi" :** Proposition quotidienne basée sur disponibilités réelles + goûts utilisateur.

---

## 3. Cible Utilisateur

| Attribut | Détail |
|----------|--------|
| **Âge** | 25-30 ans |
| **Comportement** | Mobile-first, digital native |
| **Valeurs** | Authenticité, transparence, éthique, sourcing |
| **Habitudes** | Instagram/TikTok pour découvrir, Google Maps pour choisir |
| **Attente** | Expérience globale (ambiance = assiette), bistronomie, street-food |
| **Frein actuel** | Perception élitiste du Guide Michelin |

---

## 4. Direction Artistique

### Style : Brutaliste-Chic

### Logo
Étoile Michelin hybridée — 6 pétales avec yeux discrets + noeud papillon minimaliste. Incarne le majordome.

### Palette de Couleurs
| Couleur | Hex | Usage |
|---------|-----|-------|
| Rouge Michelin | `#0C0014` / `#DA291C` | Héritage, passion |
| Noir Encre / Marine | `#212121` / `#001F5F` | Dark mode, atmosphère premium |
| Blanc Pur | `#FFFFFF` | Clarté, respiration |
| Or Doux / Champagne | `#E2C08A` / `#C19E73` | Accentuation, prestige |

### Typographie
- **Titres :** Sans-Serif impactante (Michelin Display)
- **Corps :** Serif moderne ou Sans-Serif lisible (Michelin Text)

### Direction Image
- Vidéos courtes "Snack Content" (coulisses, geste du chef, ambiance)
- Real Feed : photos communauté validées par restaurateur

---

## 5. Positionnement Concurrentiel

| Concurrent | Force | Faiblesse vs Sebastian |
|------------|-------|----------------------|
| Google Maps | Volume d'avis | Pas de curation, bruit |
| TripAdvisor | Couverture mondiale | Avis non qualifiés |
| Instagram/TikTok | Viralité, visuel | Pas de recommandation personnalisée |
| TheFork | Réservation intégrée | Pas d'IA personnalisée, pas de prestige |

**Avantage Sebastian :** Expertise Michelin + IA personnalisée + mécanique FOMO + curation drastique (2-3 choix max).

---

## 6. Fonctionnalités Clés (MVP Hackathon)

| Priorité | Fonctionnalité | Description |
|----------|----------------|-------------|
| P0 | Onboarding Quiz | Création de l'empreinte gastronomique |
| P0 | Chat Sebastian | Interface conversationnelle IA |
| P0 | Recommandation contextuelle | Quiz ponctuel → 2-3 résultats |
| P1 | Surprends-moi | Proposition spontanée |
| P1 | Fiches restaurant | Infos, photos, ambiance |
| P2 | Instant Michelin | Notification FOMO hebdomadaire |
| P2 | Real Feed | Photos communauté |

---

## 7. Stack Technique

| Composant | Choix |
|-----------|-------|
| Frontend | Next.js (React) |
| UI | shadcn/ui + Tailwind CSS |
| Approche | Mobile-first, responsive |
| IA | API LLM (conversation Sebastian) |
| Data | Base restaurants Michelin (mock/API) |

---

## 8. Contraintes

- **Temps :** Hackathon — livrable fonctionnel rapide
- **Équipe :** 2-3 personnes
- **Scope :** MVP web mobile-first (pas d'app native)
- **Data :** Données restaurants mockées si pas d'API Michelin

---

## 9. Critères de Succès

- Onboarding quiz fonctionnel et engageant
- Conversation avec Sebastian fluide et pertinente
- Recommandations personnalisées convaincantes (2-3 résultats)
- UI fidèle à la DA Brutaliste-Chic
- Démo présentable en fin de hackathon
