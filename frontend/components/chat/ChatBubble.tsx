import { SebastianLogo } from "@/components/layout/Header";
import type { ChatMessageDTO, RestaurantCardDTO } from "@/lib/api";
import RestaurantCard from "@/components/restaurant/RestaurantCard";

interface ChatBubbleProps {
  message: ChatMessageDTO;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const restaurants = message.metadata?.restaurants as RestaurantCardDTO[] | undefined;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start">
      {/* Avatar Sebastian */}
      <div className="shrink-0 mt-1">
        <SebastianLogo size={24} />
      </div>

      <div className="flex flex-col gap-3 max-w-[85%]">
        {/* Texte du message */}
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {message.content}
        </div>

        {/* Cartes restaurant si présentes */}
        {restaurants && restaurants.length > 0 && (
          <div className="flex flex-col gap-2">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
