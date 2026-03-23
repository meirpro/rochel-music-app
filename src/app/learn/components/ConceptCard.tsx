"use client";

import { ReactNode } from "react";

interface ConceptCardProps {
  title: string;
  emoji?: string;
  children: ReactNode;
  variant?: "default" | "interactive" | "tip";
}

export function ConceptCard({
  title,
  emoji,
  children,
  variant = "default",
}: ConceptCardProps) {
  const variants = {
    default: "bg-white border-primary-200",
    interactive:
      "bg-gradient-to-br from-primary-50 to-blue-50 border-primary-300",
    tip: "bg-amber-50 border-amber-200",
  };

  return (
    <div
      className={`rounded-xl border-2 p-5 shadow-sm ${variants[variant]} transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-2 mb-3">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <h3 className="text-lg font-semibold text-primary-800">{title}</h3>
      </div>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
