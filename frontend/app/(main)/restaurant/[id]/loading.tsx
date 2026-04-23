import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantLoading() {
  return (
    <div className="flex flex-col gap-6 py-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <section className="overflow-hidden rounded-[28px] border border-border bg-card/85 p-0 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <Skeleton className="h-[320px] w-full rounded-none" />
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-border bg-card/75 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
        <div className="rounded-[24px] border border-border bg-card/75 p-5">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-card/75 p-5">
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-56 min-w-[240px]" />
          ))}
        </div>
      </section>
    </div>
  );
}
