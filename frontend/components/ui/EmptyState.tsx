import type { ReactNode } from "react";

interface EmptyStateProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function EmptyState({
  eyebrow,
  title,
  description,
  actions,
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/82 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at top right, oklch(0.807 0.094 78 / 0.18), transparent 30%), radial-gradient(circle at bottom left, oklch(0.495 0.228 26.5 / 0.14), transparent 42%)",
        }}
      />

      <div className="relative flex flex-col gap-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl font-semibold leading-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}
