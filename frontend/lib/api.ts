const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  name: string;
  createdAt: string;
  profile?: UserProfileDTO;
}

export interface CreateUserDTO {
  name: string;
}

export interface UserProfileDTO {
  diet: string[];
  budget: number;
  vibes: string[];
  occasions: string[];
  cuisines: string[];
  city?: string;
}

export interface RestaurantCardDTO {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: "ETOILE" | "BIB_GOURMAND" | "ETOILE_VERTE" | "SELECTION";
  imageUrl: string | null;
  matchScore: number;
  tags: string[];
  zone?: string | null;
  ambiance?: string | null;
}

export interface RestaurantDetailDTO extends RestaurantCardDTO {
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hours: Record<string, string> | null;
  gallery: string[];
  websiteUrl: string | null;
  michelinUrl: string | null;
  location: string;
  country: string | null;
  greenStar: boolean;
}

export interface RestaurantFilters {
  cuisine?: string;
  budget?: number;
  zone?: string;
  tags?: string;
  michelinType?: string;
}

export interface ChatSessionDTO {
  id: string;
  userId: string;
  createdAt: string;
}

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: "user" | "sebastian";
  content: string;
  metadata?: { restaurants?: RestaurantCardDTO[] } | null;
  createdAt: string;
}

export interface RecommendationRequestDTO {
  userId: string;
  chatSessionId?: string;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  create: (data: CreateUserDTO) =>
    request<UserDTO>("/users", { method: "POST", body: JSON.stringify(data) }),

  getById: (id: string) => request<UserDTO>(`/users/${id}`),

  createProfile: (id: string, profile: UserProfileDTO) =>
    request<UserProfileDTO>(`/users/${id}/profile`, {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  updateProfile: (id: string, profile: Partial<UserProfileDTO>) =>
    request<UserProfileDTO>(`/users/${id}/profile`, {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
};

// ─── Restaurants ──────────────────────────────────────────────────────────────

export const restaurantsApi = {
  list: (filters?: RestaurantFilters) => {
    const params = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : "";
    return request<RestaurantCardDTO[]>(`/restaurants${params}`);
  },

  getById: (id: string) => request<RestaurantDetailDTO>(`/restaurants/${id}`),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chatApi = {
  createSession: (userId: string) =>
    request<{ session: ChatSessionDTO; messages: ChatMessageDTO[] }>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  sendMessage: (sessionId: string, content: string) =>
    request<ChatMessageDTO>(`/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getMessages: (sessionId: string) =>
    request<ChatMessageDTO[]>(`/chat/sessions/${sessionId}/messages`),
};

// ─── Onboarding (Quiz QCM généré par LLM) ─────────────────────────────────────

export interface QcmAnswer {
  axis: string;
  question: string;
  answer: string | string[];
}

export interface QcmOption {
  label: string;
  value: string;
  emoji?: string;
}

export type OnboardingNextResponse =
  | {
      done: false;
      axis: string;
      question: string;
      subtitle?: string;
      type: "single" | "multiple" | "text";
      options?: QcmOption[];
    }
  | {
      done: true;
      message: string;
      profile: {
        name: string;
        city: string;
        diet: string[];
        budget: number;
        vibes: string[];
        occasions: string[];
        cuisines: string[];
      };
    };

export const onboardingApi = {
  next: (answers: QcmAnswer[]) =>
    request<OnboardingNextResponse>("/onboarding/next", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};

// ─── Recommendations ──────────────────────────────────────────────────────────

export const recommendationsApi = {
  get: (data: RecommendationRequestDTO) =>
    request<RestaurantCardDTO[]>("/recommendations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  surprise: (userId: string) =>
    request<RestaurantCardDTO>("/recommendations/surprise", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};
