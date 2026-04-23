import SebastianAvatar from "./SebastianAvatar";
import RestaurantCard from "./RestaurantCard";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  michelinType: string;
  greenStar: boolean;
  zone: string | null;
  location: string;
  tags: string[];
  ambiance: string | null;
}

interface Message {
  id: string;
  role: "USER" | "SEBASTIAN";
  content: string;
  metadata?: { restaurants?: Restaurant[] };
  createdAt: string;
}

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "USER";
  const restaurants = message.metadata?.restaurants ?? [];

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
          style={{ background: "var(--rouge)", color: "white" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-end">
      <SebastianAvatar size={30} />
      <div className="flex-1 flex flex-col gap-2 max-w-[85%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {message.content}
        </div>
        {restaurants.length > 0 && (
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
