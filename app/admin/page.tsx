"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, ApiError, formatDateTime } from "@/lib/api";
import styles from "../dashboard/dashboard.module.css";

type Dim = { note: string };
type SchoolEval = {
  career?: Dim;
  teaching?: Dim;
  life?: Dim;
  care?: Dim;
  practice?: Dim;
  pros?: string;
  cons?: string;
};
type BoolText = { had: boolean; text: string };
type PersonalExp = {
  paths?: string[];
  research?: BoolText;
  internship?: BoolText;
  competition?: BoolText;
  zongping?: BoolText;
  program?: BoolText;
  transfer?: BoolText;
  supplement?: string;
};
type IntroCard = {
  displayInitial?: string;
  displayTitle?: string;
  schoolEval?: SchoolEval;
  personalExp?: PersonalExp;
};

type PendingMentor = {
  userId: string;
  email: string;
  name: string;
  school: string | null;
  college: string | null;
  major: string | null;
  year: string | null;
  highSchool: string | null;
  bio: string | null;
  tags: string[] | null;
  introCard: IntroCard | null;
  proofImageUrl: string | null;
  updatedAt: string;
};

const SCHOOL_EVAL_LABEL: Array<{ key: keyof SchoolEval; label: string }> = [
  { key: "career", label: "职业规划引导" },
  { key: "teaching", label: "教学质量" },
  { key: "life", label: "就读体验" },
  { key: "care", label: "人文关怀" },
  { key: "practice", label: "实践机会" },
];

const PATH_LABEL: Record<string, string> = {
  postgrad_domestic: "保研 / 直博",
  study_abroad: "出国留学",
  kaoyan: "国内考研",
  employment: "直接就业",
  civil_exam: "考公 / 考编",
  gap_other: "Gap / 其它",
};

const EXP_LABEL: Array<{ key: keyof PersonalExp; label: string }> = [
  { key: "research", label: "科研" },
  { key: "internship", label: "实习" },
  { key: "competition", label: "竞赛" },
  { key: "zongping", label: "综评 / 强基" },
  { key: "program", label: "特殊项目 / 班型" },
  { key: "transfer", label: "转专业" },
];

export default function AdminPendingPage() {
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
    let cancel = false;
    (async () => {
      try {
        const r = await apiGet<{ mentors: PendingMentor[] }>("/api/admin/mentors/pending");
        if (!cancel) setMentors(r.mentors);
      } catch (e) {
        if (!cancel) setErr(e instanceof ApiError ? e.message : (e as Error).message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const selectedMentor = mentors?.find((m) => m.userId === selected) || null;

  return (
    <>
      <div className={styles.topbar}>
        <span>后台</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>待审核</span>
      </div>
      <div className={styles.content} style={{ maxWidth: "none", padding: 0 }}>
        <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
          <div
            style={{
              width: 340,
              borderRight: "1px solid #ececec",
              background: "#fafaf7",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #ececec" }}>
              <h1 className={styles.pageTitle} style={{ marginBottom: 4 }}>
                待审核 mentor
              </h1>
              <p className={styles.pageSub} style={{ margin: 0 }}>
                {mentors === null ? "加载中…" : `共 ${mentors.length} 位`}
              </p>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {mentors === null && (
                <div style={{ padding: 22, color: "#9a9a93", fontSize: 13 }}>…</div>
              )}
              {mentors && mentors.length === 0 && (
                <div style={{ padding: 28, color: "#9a9a93", fontSize: 13 }}>
                  没有待审核的 mentor。
                </div>
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
                        padding: "12px 22px",
                        background: active ? "#fff" : "transparent",
                        border: "none",
                        borderBottom: "1px solid #f0efe9",
                        borderLeft: active ? "3px solid #1a1a1a" : "3px solid transparent",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#1f1f1f" }}>
                        {m.name || m.email}
                      </div>
                      <div style={{ fontSize: 12, color: "#6e6e68", marginTop: 2 }}>
                        {m.school || "—"} · {m.major || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#9a9a93", marginTop: 4 }}>
                        {formatDateTime(m.updatedAt)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            {err && (
              <div className={styles.alertBad} style={{ marginBottom: 16 }}>
                {err}
              </div>
            )}
            {!selectedMentor ? (
              <div style={{ color: "#9a9a93", fontSize: 14 }}>
                从左侧选择一位 mentor 查看详情。
              </div>
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
    </>
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
  const schoolEval = card.schoolEval || {};
  const personalExp = card.personalExp || {};
  const displayName =
    card.displayInitial && card.displayTitle
      ? `${card.displayInitial}${card.displayTitle}`
      : null;

  return (
    <div>
      <h1 className={styles.pageTitle}>{mentor.name || "(未填写姓名)"}</h1>
      <p className={styles.pageSub}>
        {mentor.email} · 提交于 {formatDateTime(mentor.updatedAt)}
      </p>

      {err && (
        <div className={styles.alertBad} style={{ marginTop: 16 }}>
          {err}
        </div>
      )}

      <DetailSection title="基本信息">
        <KV label="学校" value={mentor.school} />
        <KV label="院系" value={mentor.college} />
        <KV label="专业" value={mentor.major} />
        <KV label="年级" value={mentor.year} />
        <KV label="高中" value={mentor.highSchool} />
        <KV label="化名" value={displayName} />
        <KV label="标签" value={mentor.tags?.join("、") || null} />
      </DetailSection>

      <DetailSection title="自我介绍">
        <Para text={mentor.bio} />
      </DetailSection>

      <DetailSection title="学院评价">
        {SCHOOL_EVAL_LABEL.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>{label}</div>
            <Para text={(schoolEval[key] as Dim | undefined)?.note || null} />
          </div>
        ))}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>优势</div>
          <Para text={schoolEval.pros || null} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>不足</div>
          <Para text={schoolEval.cons || null} />
        </div>
      </DetailSection>

      <DetailSection title="个人经历">
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>当前路径</div>
          <Para
            text={
              personalExp.paths && personalExp.paths.length > 0
                ? personalExp.paths.map((p) => PATH_LABEL[p] || p).join("、")
                : null
            }
          />
        </div>
        {EXP_LABEL.map(({ key, label }) => {
          const v = personalExp[key] as BoolText | undefined;
          return (
            <div key={key as string} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>
                {label}{v?.had ? "(有)" : "(无)"}
              </div>
              {v?.had ? (
                <Para text={v.text || null} />
              ) : (
                <span style={{ color: "#9a9a93", fontSize: 13 }}>—</span>
              )}
            </div>
          );
        })}
        {personalExp.supplement && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: "#9a9a93", marginBottom: 4 }}>补充</div>
            <Para text={personalExp.supplement} />
          </div>
        )}
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
              border: "1px solid #ececec",
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
          borderTop: "1px solid #ececec",
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="拒绝理由（拒绝时必填，学长学姐会看到这条原因）"
          className={styles.textarea}
          style={{ maxWidth: 520 }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={approve}
            disabled={busy !== null}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ background: "#1a5a30", opacity: busy ? 0.6 : 1 }}
          >
            {busy === "approve" ? "处理中…" : "✓ 通过"}
          </button>
          <button
            onClick={reject}
            disabled={busy !== null}
            className={`${styles.btn} ${styles.btnDanger}`}
            style={{ opacity: busy ? 0.6 : 1 }}
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
      <h2
        style={{
          fontSize: 12,
          color: "#9a9a93",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          margin: "0 0 14px",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "8px 0",
        borderBottom: "1px solid #f4f3ee",
      }}
    >
      <div style={{ width: 80, color: "#9a9a93", fontSize: 13, flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ color: "#1f1f1f", fontSize: 14 }}>
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
        color: "#1f1f1f",
      }}
    >
      {text}
    </p>
  );
}
