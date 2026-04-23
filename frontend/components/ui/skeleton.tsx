import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-[skeleton-pulse_1.4s_ease-in-out_infinite] rounded-2xl bg-white/7",
        className,
      )}
    />
  );
}
