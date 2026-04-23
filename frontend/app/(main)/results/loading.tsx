import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <div className="flex flex-col gap-6 py-5 pb-10">
      <section className="overflow-hidden rounded-[28px] border border-border bg-card/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[24px] border border-border bg-card/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
          >
            <Skeleton className="h-48 w-full rounded-[20px]" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
