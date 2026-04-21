"use client";

interface QuizOptionProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function QuizOption({
  label,
  emoji,
  selected,
  onClick,
  disabled,
}: QuizOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-40"
      style={
        selected
          ? {
              borderColor: "var(--or)",
              background: "oklch(0.807 0.094 78 / 0.12)",
              color: "var(--or)",
            }
          : {
              borderColor: "var(--border)",
              background: "transparent",
              color: "var(--foreground)",
            }
      }
    >
      {emoji && <span className="text-lg leading-none">{emoji}</span>}
      <span>{label}</span>
      {selected && (
        <span className="ml-auto text-xs" style={{ color: "var(--or)" }}>
          ✓
        </span>
      )}
    </button>
  );
}
