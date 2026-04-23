const spec = {
  openapi: "3.0.3",
  info: {
    title: "Sebastian API",
    version: "0.1.0",
    description: "API de recommandation de restaurants Michelin — Sebastian",
  },
  servers: [{ url: "/api", description: "Local" }],

  components: {
    securitySchemes: {
      AdminUser: { type: "apiKey", in: "header", name: "x-admin-user" },
      AdminToken: { type: "apiKey", in: "header", name: "x-admin-token" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          diet: { type: "array", items: { type: "string" } },
          budget: { type: "integer", minimum: 1, maximum: 4 },
          vibes: { type: "array", items: { type: "string" } },
          occasions: { type: "array", items: { type: "string" } },
          cuisines: { type: "array", items: { type: "string" } },
          city: { type: "string", nullable: true },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserEvent: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          title: { type: "string" },
          date: { type: "string", format: "date-time" },
          isRecurring: { type: "boolean" },
          type: { type: "string" },
          emoji: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      MichelinType: {
        type: "string",
        enum: ["ETOILE", "BIB_GOURMAND", "ETOILE_VERTE", "SELECTION"],
      },
      RestaurantCard: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          cuisine: { type: "string" },
          priceRange: { type: "integer", minimum: 1, maximum: 4 },
          michelinType: { $ref: "#/components/schemas/MichelinType" },
          greenStar: { type: "boolean" },
          imageUrl: { type: "string", nullable: true },
          matchScore: { type: "number" },
          tags: { type: "array", items: { type: "string" } },
          zone: { type: "string", nullable: true },
          location: { type: "string" },
          country: { type: "string", nullable: true },
          ambiance: { type: "string", nullable: true },
        },
      },
      RestaurantDetail: {
        allOf: [
          { $ref: "#/components/schemas/RestaurantCard" },
          {
            type: "object",
            properties: {
              michelinStars: { type: "integer", nullable: true },
              description: { type: "string" },
              address: { type: "string" },
              latitude: { type: "number", nullable: true },
              longitude: { type: "number", nullable: true },
              hours: { type: "object", nullable: true, additionalProperties: { type: "string" } },
              gallery: { type: "array", items: { type: "string" } },
              websiteUrl: { type: "string", nullable: true },
              michelinUrl: { type: "string", nullable: true },
            },
          },
        ],
      },
      RestaurantAdmin: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          cuisine: { type: "string" },
          priceRange: { type: "integer", minimum: 1, maximum: 4 },
          michelinType: { $ref: "#/components/schemas/MichelinType" },
          michelinStars: { type: "integer", nullable: true },
          greenStar: { type: "boolean" },
          address: { type: "string" },
          location: { type: "string" },
          country: { type: "string", nullable: true },
          zone: { type: "string", nullable: true },
          latitude: { type: "number", nullable: true },
          longitude: { type: "number", nullable: true },
          description: { type: "string" },
          ambiance: { type: "string", nullable: true },
          imageUrl: { type: "string", nullable: true },
          gallery: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          websiteUrl: { type: "string", nullable: true },
          michelinUrl: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ChatSession: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          sessionId: { type: "string", format: "uuid" },
          role: { type: "string", enum: ["USER", "SEBASTIAN"] },
          content: { type: "string" },
          metadata: { type: "object", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      QcmOption: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          emoji: { type: "string" },
        },
        required: ["label", "value"],
      },
      OnboardingQuestion: {
        type: "object",
        properties: {
          done: { type: "boolean", enum: [false] },
          axis: { type: "string" },
          question: { type: "string" },
          subtitle: { type: "string" },
          type: { type: "string", enum: ["single", "multiple", "text"] },
          options: { type: "array", items: { $ref: "#/components/schemas/QcmOption" } },
        },
        required: ["done", "axis", "question", "type"],
      },
      OnboardingComplete: {
        type: "object",
        properties: {
          done: { type: "boolean", enum: [true] },
          message: { type: "string" },
          profile: {
            type: "object",
            properties: {
              name: { type: "string" },
              city: { type: "string" },
              diet: { type: "array", items: { type: "string" } },
              budget: { type: "integer" },
              vibes: { type: "array", items: { type: "string" } },
              occasions: { type: "array", items: { type: "string" } },
              cuisines: { type: "array", items: { type: "string" } },
            },
          },
        },
        required: ["done", "message", "profile"],
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
    },
  },

  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service opérationnel",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "sebastian-api" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── Users ────────────────────────────────────────────────────────────────

    "/users": {
      post: {
        tags: ["Users"],
        summary: "Créer un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", minLength: 1, maxLength: 80 } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Utilisateur créé", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "400": { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Récupérer un utilisateur",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Utilisateur trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "404": { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/users/{id}/profile": {
      post: {
        tags: ["Users"],
        summary: "Créer le profil utilisateur",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["budget"],
                properties: {
                  diet: { type: "array", items: { type: "string" } },
                  budget: { type: "integer", minimum: 1, maximum: 4 },
                  vibes: { type: "array", items: { type: "string" } },
                  occasions: { type: "array", items: { type: "string" } },
                  cuisines: { type: "array", items: { type: "string" } },
                  city: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Profil créé", content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } } },
          "400": { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Mettre à jour le profil utilisateur (partiel)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  diet: { type: "array", items: { type: "string" } },
                  budget: { type: "integer", minimum: 1, maximum: 4 },
                  vibes: { type: "array", items: { type: "string" } },
                  occasions: { type: "array", items: { type: "string" } },
                  cuisines: { type: "array", items: { type: "string" } },
                  city: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Profil mis à jour", content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } } },
          "400": { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── User Events ──────────────────────────────────────────────────────────

    "/users/{userId}/events": {
      get: {
        tags: ["User Events"],
        summary: "Lister les événements d'un utilisateur",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Liste des événements",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/UserEvent" } } } },
          },
        },
      },
      post: {
        tags: ["User Events"],
        summary: "Créer un événement utilisateur",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "date", "type"],
                properties: {
                  title: { type: "string", minLength: 1 },
                  date: { type: "string", format: "date-time", description: "ISO 8601 ou YYYY-MM-DD" },
                  isRecurring: { type: "boolean", default: false },
                  type: { type: "string", minLength: 1 },
                  emoji: { type: "string", default: "🎉" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Événement créé", content: { "application/json": { schema: { $ref: "#/components/schemas/UserEvent" } } } },
          "400": { description: "Données invalides", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/users/{userId}/events/{eventId}": {
      delete: {
        tags: ["User Events"],
        summary: "Supprimer un événement",
        parameters: [
          { name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "eventId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "204": { description: "Événement supprimé" },
          "404": { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Restaurants ──────────────────────────────────────────────────────────

    "/restaurants": {
      get: {
        tags: ["Restaurants"],
        summary: "Lister les restaurants avec filtres",
        parameters: [
          { name: "cuisine", in: "query", schema: { type: "string" } },
          { name: "budget", in: "query", description: "priceRange <= budget", schema: { type: "integer", minimum: 1, maximum: 4 } },
          { name: "priceMin", in: "query", description: "priceRange >= priceMin", schema: { type: "integer", minimum: 1, maximum: 4 } },
          { name: "zone", in: "query", schema: { type: "string" } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "country", in: "query", schema: { type: "string" } },
          { name: "ambiance", in: "query", schema: { type: "string" } },
          { name: "tags", in: "query", schema: { type: "string" } },
          { name: "michelinType", in: "query", schema: { $ref: "#/components/schemas/MichelinType" } },
          { name: "greenStar", in: "query", schema: { type: "boolean" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Liste de restaurants",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/RestaurantCard" } } } },
          },
        },
      },
    },

    "/restaurants/{id}": {
      get: {
        tags: ["Restaurants"],
        summary: "Détail d'un restaurant",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Restaurant trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/RestaurantDetail" } } } },
          "404": { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Recommendations ──────────────────────────────────────────────────────

    "/recommendations/surprise": {
      post: {
        tags: ["Recommendations"],
        summary: "Recommandation surprise basée sur le profil utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string", format: "uuid" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Restaurant recommandé", content: { "application/json": { schema: { $ref: "#/components/schemas/RestaurantCard" } } } },
          "404": { description: "Aucune recommandation disponible", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ─── Onboarding ───────────────────────────────────────────────────────────

    "/onboarding/next": {
      post: {
        tags: ["Onboarding"],
        summary: "Étape suivante du onboarding (question ou profil final)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["answers"],
                properties: {
                  answers: {
                    type: "array",
                    maxItems: 20,
                    items: {
                      type: "object",
                      required: ["axis", "question", "answer"],
                      properties: {
                        axis: { type: "string" },
                        question: { type: "string" },
                        answer: {
                          oneOf: [
                            { type: "string" },
                            { type: "array", items: { type: "string" } },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Question suivante ou profil complet",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/OnboardingQuestion" },
                    { $ref: "#/components/schemas/OnboardingComplete" },
                  ],
                  discriminator: { propertyName: "done" },
                },
              },
            },
          },
        },
      },
    },

    // ─── Chat ─────────────────────────────────────────────────────────────────

    "/chat/session": {
      post: {
        tags: ["Chat"],
        summary: "Récupérer ou créer la session de chat d'un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string", format: "uuid" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Session existante ou créée", content: { "application/json": { schema: { $ref: "#/components/schemas/ChatSession" } } } },
        },
      },
    },

    "/chat/sessions": {
      post: {
        tags: ["Chat"],
        summary: "Créer une nouvelle session de chat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string", format: "uuid" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Session créée", content: { "application/json": { schema: { $ref: "#/components/schemas/ChatSession" } } } },
        },
      },
    },

    "/chat/sessions/{sessionId}": {
      delete: {
        tags: ["Chat"],
        summary: "Supprimer une session de chat",
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "204": { description: "Session supprimée" },
          "404": { description: "Non trouvée", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/chat/sessions/{sessionId}/messages": {
      get: {
        tags: ["Chat"],
        summary: "Récupérer les messages d'une session",
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Liste des messages",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ChatMessage" } } } },
          },
        },
      },
      post: {
        tags: ["Chat"],
        summary: "Envoyer un message et obtenir une réponse de Sebastian",
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: { type: "string", minLength: 1, maxLength: 2000 },
                  visitedRestaurantIds: { type: "array", items: { type: "string", format: "uuid" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Réponse de Sebastian", content: { "application/json": { schema: { $ref: "#/components/schemas/ChatMessage" } } } },
        },
      },
    },

    // ─── Notifications ────────────────────────────────────────────────────────

    "/notifications/vapid-public-key": {
      get: {
        tags: ["Notifications"],
        summary: "Récupérer la clé publique VAPID pour les push notifications",
        responses: {
          "200": {
            description: "Clé publique",
            content: { "application/json": { schema: { type: "object", properties: { publicKey: { type: "string" } } } } },
          },
        },
      },
    },

    "/notifications/subscribe": {
      post: {
        tags: ["Notifications"],
        summary: "S'abonner aux push notifications",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "subscription"],
                properties: {
                  userId: { type: "string", format: "uuid" },
                  subscription: {
                    type: "object",
                    required: ["endpoint", "keys"],
                    properties: {
                      endpoint: { type: "string", format: "uri" },
                      keys: {
                        type: "object",
                        required: ["p256dh", "auth"],
                        properties: {
                          p256dh: { type: "string" },
                          auth: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Abonnement enregistré", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
        },
      },
    },

    "/notifications/unsubscribe": {
      delete: {
        tags: ["Notifications"],
        summary: "Se désabonner des push notifications",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["endpoint"],
                properties: { endpoint: { type: "string", format: "uri" } },
              },
            },
          },
        },
        responses: {
          "204": { description: "Désabonnement effectué" },
        },
      },
    },

    // ─── Admin ────────────────────────────────────────────────────────────────

    "/admin/restaurants": {
      get: {
        tags: ["Admin"],
        summary: "Lister tous les restaurants (admin)",
        security: [{ AdminUser: [], AdminToken: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 30 } },
        ],
        responses: {
          "200": {
            description: "Page de restaurants",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    restaurants: { type: "array", items: { $ref: "#/components/schemas/RestaurantAdmin" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": { description: "Non autorisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Créer un restaurant (admin)",
        security: [{ AdminUser: [], AdminToken: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "cuisine", "priceRange", "michelinType", "address", "location"],
                properties: {
                  name: { type: "string" },
                  cuisine: { type: "string" },
                  priceRange: { type: "integer", minimum: 1, maximum: 4 },
                  michelinType: { $ref: "#/components/schemas/MichelinType" },
                  greenStar: { type: "boolean", default: false },
                  address: { type: "string" },
                  location: { type: "string" },
                  country: { type: "string" },
                  zone: { type: "string" },
                  description: { type: "string", default: "" },
                  ambiance: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  websiteUrl: { type: "string", format: "uri" },
                  michelinUrl: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Restaurant créé", content: { "application/json": { schema: { $ref: "#/components/schemas/RestaurantAdmin" } } } },
          "401": { description: "Non autorisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/admin/restaurants/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Détail d'un restaurant (admin)",
        security: [{ AdminUser: [], AdminToken: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Restaurant trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/RestaurantAdmin" } } } },
          "404": { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Non autorisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Admin"],
        summary: "Mettre à jour un restaurant (admin)",
        security: [{ AdminUser: [], AdminToken: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "cuisine", "priceRange", "michelinType", "address", "location"],
                properties: {
                  name: { type: "string" },
                  cuisine: { type: "string" },
                  priceRange: { type: "integer", minimum: 1, maximum: 4 },
                  michelinType: { $ref: "#/components/schemas/MichelinType" },
                  greenStar: { type: "boolean" },
                  address: { type: "string" },
                  location: { type: "string" },
                  country: { type: "string" },
                  zone: { type: "string" },
                  description: { type: "string" },
                  ambiance: { type: "string" },
                  tags: { type: "array", items: { type: "string" } },
                  websiteUrl: { type: "string", format: "uri" },
                  michelinUrl: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Restaurant mis à jour", content: { "application/json": { schema: { $ref: "#/components/schemas/RestaurantAdmin" } } } },
          "404": { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Non autorisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Supprimer un restaurant (admin)",
        security: [{ AdminUser: [], AdminToken: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "204": { description: "Restaurant supprimé" },
          "401": { description: "Non autorisé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};

export default spec;
