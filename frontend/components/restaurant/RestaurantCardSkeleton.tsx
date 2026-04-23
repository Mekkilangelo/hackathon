export default function RestaurantCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 opacity-0"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        animation: "fadeSlideUp 0.4s ease forwards",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Badge + price row */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-28 rounded-full bg-white/8 animate-pulse" />
        <div className="h-4 w-8 rounded bg-white/8 animate-pulse" />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-3/4 rounded bg-white/8 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-white/8 animate-pulse" />
      </div>

      {/* Tags */}
      <div className="flex gap-1.5">
        <div className="h-4 w-14 rounded-full bg-white/8 animate-pulse" />
        <div className="h-4 w-16 rounded-full bg-white/8 animate-pulse" />
        <div className="h-4 w-12 rounded-full bg-white/8 animate-pulse" />
      </div>

      {/* CTA */}
      <div className="h-3 w-24 rounded bg-white/8 animate-pulse" />
    </div>
  );
}
