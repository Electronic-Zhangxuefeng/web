"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, ApiError, formatDateTime } from "@/lib/api";

type IntroCard = {
  whyMajor?: string;
  regretOrSurprise?: string;
  fitFor?: string;
  notFitFor?: string;
  afterGraduation?: string;
};

type PendingMentor = {
  userId: string;
  email: string;
  name: string;
  school: string | null;
  college: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  tags: string[] | null;
  introCard: IntroCard | null;
  proofImageUrl: string | null;
  updatedAt: string;
};

const INTRO_LABEL: Record<keyof IntroCard, string> = {
  whyMajor: "为什么选这个专业",
  regretOrSurprise: "最后悔 / 最惊喜的一件事",
  fitFor: "什么样的学生适合",
  notFitFor: "什么样的学生不建议",
  afterGraduation: "大概的毕业去向",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    apiGet<{ authed: boolean }>("/api/admin/session")
      .then((r) => setAuthed(r.authed))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <Shell>
        <div style={{ padding: 40, color: "#6e6e68" }}>加载中…</div>
      </Shell>
    );
  }

  return <Shell>{authed ? <Console onLogout={() => setAuthed(false)} /> : <Login onSuccess={() => setAuthed(true)} />}</Shell>;
}

// ── Shell ─────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1a1a1a",
        fontFamily: "var(--sans)",
      }}
    >
      {children}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiSend("/api/admin/login", "POST", { password });
      onSuccess();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 360,
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          padding: 28,
          background: "#fff",
        }}
      >
        <div style={{ fontSize: 12, color: "#999", letterSpacing: 2, textTransform: "uppercase" }}>
          ADMIN
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "8px 0 4px", color: "#1a1a1a" }}>
          后台登录
        </h1>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>请输入管理员密码。</p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #d4d4d4",
            borderRadius: 7,
            fontSize: 14,
            background: "#fff",
            color: "#1a1a1a",
            fontFamily: "inherit",
          }}
        />
        {err && (
          <div style={{ marginTop: 12, color: "#a4391a", fontSize: 13 }}>{err}</div>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "10px 14px",
            background: busy ? "#444" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            fontSize: 14,
            fontWeight: 500,
            cursor: busy ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {busy ? "登录中…" : "登录"}
        </button>
      </form>
    </div>
  );
}

// ── Console ────────────────────────────────────────────────────────────

function Console({ onLogout }: { onLogout: () => void }) {
  const [mentors, setMentors] = useState<PendingMentor[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = async () => {
    try {
      const r = await apiGet<{ mentors: PendingMentor[] }>("/api/admin/mentors/pending");
      setMentors(r.mentors);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const logout = async () => {
    try {
      await apiSend("/api/admin/logout", "POST");
    } catch {
      // ignore
    }
    onLogout();
  };

  const selectedMentor = mentors?.find((m) => m.userId === selected) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, color: "#999", letterSpacing: 2 }}>ADMIN</div>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>问津 ｜ 指路 审核台</span>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "6px 12px",
            border: "1px solid #d4d4d4",
            borderRadius: 6,
            background: "#fff",
            color: "#555",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          登出
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* List */}
        <div
          style={{
            width: 340,
            borderRight: "1px solid #e5e5e5",
            background: "#fafafa",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>待审核 mentor</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
              {mentors === null ? "加载中…" : `共 ${mentors.length} 位`}
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {mentors === null && <div style={{ padding: 18, color: "#999", fontSize: 13 }}>…</div>}
            {mentors && mentors.length === 0 && (
              <div style={{ padding: 24, color: "#999", fontSize: 13 }}>没有待审核的 mentor。</div>
            )}
            {mentors &&
              mentors.map((m) => {
                const active = m.userId === selected;
                return (
                  <button
                    key={m.userId}
                    onClick={() => setSelected(m.userId)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 18px",
                      background: active ? "#fff" : "transparent",
                      border: "none",
                      borderBottom: "1px solid #ececec",
                      borderLeft: active ? "3px solid #1a1a1a" : "3px solid transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{m.name || m.email}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                      {m.school || "—"} · {m.major || "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{formatDateTime(m.updatedAt)}</div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Detail */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {err && (
            <div
              style={{
                background: "#fef2f0",
                border: "1px solid #f5cfc5",
                color: "#a4391a",
                borderRadius: 7,
                padding: 12,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {err}
            </div>
          )}
          {!selectedMentor ? (
            <div style={{ color: "#999", fontSize: 14 }}>从左侧选择一位 mentor 查看详情。</div>
          ) : (
            <MentorDetail
              mentor={selectedMentor}
              onResolved={async () => {
                await reload();
                setSelected(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MentorDetail({
  mentor,
  onResolved,
}: {
  mentor: PendingMentor;
  onResolved: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const approve = async () => {
    if (!confirm(`确认通过 ${mentor.name || mentor.email} 的审核？`)) return;
    setBusy("approve");
    setErr(null);
    try {
      await apiSend(`/api/admin/mentors/${mentor.userId}/approve`, "POST");
      onResolved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const reject = async () => {
    if (!reason.trim()) {
      setErr("请先填写拒绝理由。");
      return;
    }
    setBusy("reject");
    setErr(null);
    try {
      await apiSend(`/api/admin/mentors/${mentor.userId}/reject`, "POST", {
        reason: reason.trim(),
      });
      onResolved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const card = mentor.introCard || {};
  const fields: (keyof IntroCard)[] = [
    "whyMajor",
    "regretOrSurprise",
    "fitFor",
    "notFitFor",
    "afterGraduation",
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "#1a1a1a" }}>
        {mentor.name || "(未填写姓名)"}
      </h1>
      <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
        {mentor.email} · 提交于 {formatDateTime(mentor.updatedAt)}
      </p>

      {err && (
        <div
          style={{
            marginTop: 16,
            background: "#fef2f0",
            border: "1px solid #f5cfc5",
            color: "#a4391a",
            borderRadius: 7,
            padding: 12,
            fontSize: 13,
          }}
        >
          {err}
        </div>
      )}

      <DetailSection title="基本信息">
        <KV label="学校" value={mentor.school} />
        <KV label="院系" value={mentor.college} />
        <KV label="专业" value={mentor.major} />
        <KV label="年级" value={mentor.year} />
        <KV label="标签" value={mentor.tags?.join("、") || null} />
      </DetailSection>

      <DetailSection title="自我介绍">
        <Para text={mentor.bio} />
      </DetailSection>

      <DetailSection title="5 个问答">
        {fields.map((k) => (
          <div key={k} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>{INTRO_LABEL[k]}</div>
            <Para text={card[k] || null} />
          </div>
        ))}
      </DetailSection>

      <DetailSection title="学籍证明">
        {mentor.proofImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mentor.proofImageUrl}
            alt="证明"
            style={{
              maxWidth: 520,
              maxHeight: 420,
              border: "1px solid #e5e5e5",
              borderRadius: 8,
            }}
          />
        ) : (
          <span style={{ color: "#a4391a", fontSize: 13 }}>未上传证明</span>
        )}
      </DetailSection>

      <div
        style={{
          marginTop: 32,
          borderTop: "1px solid #e5e5e5",
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="拒绝理由（拒绝时必填，学长会看到这条原因）"
          style={{
            width: "100%",
            maxWidth: 520,
            minHeight: 70,
            padding: "9px 12px",
            border: "1px solid #d4d4d4",
            borderRadius: 7,
            fontSize: 13,
            fontFamily: "inherit",
            color: "#1a1a1a",
            background: "#fff",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={approve}
            disabled={busy !== null}
            style={{
              padding: "9px 18px",
              background: "#1a5a30",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              fontSize: 14,
              fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy === "approve" ? "处理中…" : "✓ 通过"}
          </button>
          <button
            onClick={reject}
            disabled={busy !== null}
            style={{
              padding: "9px 18px",
              background: "#fff",
              color: "#a4391a",
              border: "1px solid #e0bbb0",
              borderRadius: 7,
              fontSize: 14,
              fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy === "reject" ? "处理中…" : "✕ 拒绝"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 13, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 14px" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ width: 80, color: "#999", fontSize: 13, flexShrink: 0 }}>{label}</div>
      <div style={{ color: "#1a1a1a", fontSize: 14 }}>
        {value || <span style={{ color: "#a4391a" }}>未填</span>}
      </div>
    </div>
  );
}

function Para({ text }: { text: string | null | undefined }) {
  if (!text) return <span style={{ color: "#a4391a", fontSize: 13 }}>未填</span>;
  return (
    <p
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#1a1a1a",
      }}
    >
      {text}
    </p>
  );
}
