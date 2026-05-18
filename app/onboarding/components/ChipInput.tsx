// web/app/onboarding/components/ChipInput.tsx
"use client";
import { useState, KeyboardEvent } from "react";

export function ChipInput({
  value,
  onChange,
  max,
  placeholder,
  maxLen = 20,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  max: number;
  placeholder?: string;
  maxLen?: number;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (!t || value.length >= max || value.includes(t) || t.length > maxLen) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "，") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value.length - 1);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #d5d5d5",
        borderRadius: 7,
        padding: 6,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        minHeight: 42,
        background: "#fff",
      }}
    >
      {value.map((t, i) => (
        <span
          key={i}
          style={{
            background: "#f3f6f4",
            color: "#3d5c4d",
            padding: "4px 10px",
            borderRadius: 14,
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {t}
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              background: "none",
              border: "none",
              color: "#3d5c4d",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
            }}
            aria-label={`删除 ${t}`}
          >
            ×
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 120,
            padding: "4px 6px",
            fontSize: 13,
            background: "transparent",
          }}
        />
      )}
    </div>
  );
}
