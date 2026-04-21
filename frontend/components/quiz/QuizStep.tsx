"use client";

import { useEffect, useRef } from "react";

interface QuizStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  visible: boolean;
}

export default function QuizStep({ title, subtitle, children, visible }: QuizStepProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) ref.current?.scrollTo({ top: 0 });
  }, [visible]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-6 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        pointerEvents: visible ? "auto" : "none",
        position: visible ? "relative" : "absolute",
      }}
    >
      <div className="flex flex-col gap-1">
        <h2
          className="text-2xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
