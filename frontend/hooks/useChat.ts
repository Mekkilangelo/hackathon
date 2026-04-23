"use client";

import { useState, useEffect, useCallback } from "react";
import { chatApi, type ChatMessageDTO, type ChatSessionDTO } from "@/lib/api";

interface UseChatState {
  session: ChatSessionDTO | null;
  messages: ChatMessageDTO[];
  loading: boolean;
  sending: boolean;
  error: string;
}

export function useChat(userId: string | null) {
  const [state, setState] = useState<UseChatState>({
    session: null,
    messages: [],
    loading: true,
    sending: false,
    error: "",
  });

  // Créer la session au montage
  useEffect(() => {
    if (!userId) {
      setState((s) => ({ ...s, loading: false, error: "Aucun profil trouvé." }));
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const result = await chatApi.createSession(userId!);
        if (cancelled) return;
        setState((s) => ({
          ...s,
          session: result.session,
          messages: result.messages,
          loading: false,
        }));
      } catch {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: "Sebastian est indisponible. Veuillez réessayer.",
          }));
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.session || state.sending) return;

      // Message utilisateur optimiste
      const optimisticUser: ChatMessageDTO = {
        id: `opt-${Date.now()}`,
        sessionId: state.session.id,
        role: "user",
        content,
        metadata: null,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        sending: true,
        error: "",
        messages: [...s.messages, optimisticUser],
      }));

      try {
        const sebastianReply = await chatApi.sendMessage(state.session.id, content);
        setState((s) => ({
          ...s,
          sending: false,
          messages: [...s.messages, sebastianReply],
        }));
      } catch {
        setState((s) => ({
          ...s,
          sending: false,
          error: "Sebastian n'a pas pu répondre. Réessayez.",
          // Retirer le message optimiste en cas d'erreur
          messages: s.messages.filter((m) => m.id !== optimisticUser.id),
        }));
      }
    },
    [state.session, state.sending]
  );

  return { ...state, sendMessage };
}
