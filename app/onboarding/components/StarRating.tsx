// web/app/onboarding/components/StarRating.tsx
"use client";
import { useState } from "react";

export function StarRating({
  value,
  onChange,
  size = 26,
}: {
  value: number; // 0..5; 0 = 未评
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div
      role="radiogroup"
      aria-label="评分"
      onMouseLeave={() => setHover(0)}
      style={{ display: "inline-flex", gap: 4 }}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= display;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === value}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i === value ? 0 : i)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: size,
              lineHeight: 1,
              color: filled ? "#e8a93b" : "#d5d5d5",
              transition: "color 0.12s",
            }}
            aria-label={`${i} 星`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
