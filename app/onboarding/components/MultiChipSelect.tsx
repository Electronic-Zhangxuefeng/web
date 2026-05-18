// web/app/onboarding/components/MultiChipSelect.tsx
"use client";

export function MultiChipSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  options: ReadonlyArray<{ key: T; label: string }>;
}) {
  const toggle = (k: T) => {
    if (value.includes(k)) onChange(value.filter((x) => x !== k));
    else onChange([...value, k]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o.key);
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => toggle(o.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 18,
              border: on ? "1px solid #3d5c4d" : "1px solid #d5d5d5",
              background: on ? "#3d5c4d" : "#fff",
              color: on ? "#fff" : "#1f1f1f",
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.12s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
