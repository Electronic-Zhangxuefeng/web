// web/app/onboarding/components/SchoolSelect.tsx
"use client";
import { useMemo, useState } from "react";
import { SHANGHAI_SCHOOLS, OTHER_SCHOOL_SENTINEL } from "../schools";
import styles from "../onboarding.module.css";

export function SchoolSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const isPreset = SHANGHAI_SCHOOLS.includes(value as (typeof SHANGHAI_SCHOOLS)[number]);
  const [mode, setMode] = useState<"preset" | "other">(
    value && !isPreset ? "other" : "preset",
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return SHANGHAI_SCHOOLS;
    return SHANGHAI_SCHOOLS.filter((s) => s.includes(query.trim()));
  }, [query]);

  if (mode === "other") {
    return (
      <div>
        <input
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="手动输入学校全称"
        />
        <button
          type="button"
          onClick={() => {
            setMode("preset");
            onChange("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#3d5c4d",
            cursor: "pointer",
            fontSize: 12,
            padding: "6px 0 0",
          }}
        >
          ← 从预置列表选择
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={value || "搜索或选择学校..."}
      />
      <div
        style={{
          marginTop: 6,
          maxHeight: 220,
          overflowY: "auto",
          border: "1px solid #ececec",
          borderRadius: 7,
        }}
      >
        {filtered.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onChange(s);
              setQuery("");
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: s === value ? "#f3f6f4" : "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#1f1f1f",
            }}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setMode("other");
            onChange("");
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#3d5c4d",
            borderTop: "1px solid #ececec",
          }}
        >
          {OTHER_SCHOOL_SENTINEL}
        </button>
      </div>
      {value && (
        <div style={{ fontSize: 12, color: "#3d5c4d", marginTop: 6 }}>已选：{value}</div>
      )}
    </div>
  );
}
