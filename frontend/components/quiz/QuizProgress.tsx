"use client";

interface QuizProgressProps {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = (current / total) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Étape {current} sur {total}
        </span>
        <span className="text-xs font-semibold" style={{ color: "var(--or)" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--rouge), var(--or))",
          }}
        />
      </div>
    </div>
  );
}
