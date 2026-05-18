// web/app/onboarding/components/CollapsibleCard.tsx
"use client";
import { useState, ReactNode } from "react";

type Status = "empty" | "filled" | "skipped";

export function CollapsibleCard({
  title,
  status,
  defaultOpen = false,
  children,
}: {
  title: string;
  status: Status;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dotColor =
    status === "filled" ? "#3d5c4d" : status === "skipped" ? "#9a9a93" : "#ececec";
  const dotChar = status === "filled" ? "●" : status === "skipped" ? "–" : "○";
  const statusText =
    status === "filled" ? "已填写" : status === "skipped" ? "选择了否" : "未填写";

  return (
    <div
      style={{
        border: "1px solid #ececec",
        borderRadius: 9,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 14,
          color: "#1f1f1f",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: dotColor, fontSize: 14 }}>{dotChar}</span>
          <span style={{ fontWeight: 600 }}>{title}</span>
          <span style={{ fontSize: 12, color: "#9a9a93" }}>{statusText}</span>
        </span>
        <span style={{ color: "#9a9a93", fontSize: 13 }}>{open ? "收起 ▴" : "展开 ▾"}</span>
      </button>
      {open && (
        <div style={{ padding: "4px 16px 16px", borderTop: "1px solid #ececec" }}>
          {children}
        </div>
      )}
    </div>
  );
}
