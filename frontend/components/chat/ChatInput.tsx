"use client";

import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="flex items-end gap-2 px-3 py-2 border-t border-border"
      style={{ background: "var(--card)" }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Répondez à Sebastian..."
        disabled={disabled}
        rows={1}
        maxLength={500}
        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2 max-h-28 disabled:opacity-40"
        style={{ lineHeight: "1.5" }}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
        style={{ background: value.trim() && !disabled ? "var(--rouge)" : "var(--muted)" }}
        aria-label="Envoyer"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8L14 2L8 14L7 9L2 8Z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
