// web/app/onboarding/components/CharCounter.tsx
"use client";

export function CharCounter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span
      style={{
        fontSize: 11,
        color: over ? "#c63939" : "#9a9a93",
        float: "right",
        marginTop: 4,
      }}
    >
      {value.length} / {max}
    </span>
  );
}
