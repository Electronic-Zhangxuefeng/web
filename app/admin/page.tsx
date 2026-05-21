"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, ApiError, formatDateTime } from "@/lib/api";
import styles from "../dashboard/dashboard.module.css";
import { MentorProfileView, type MentorFullProfile } from "./_components/MentorProfileView";

type PendingMentor = MentorFullProfile & { updatedAt: string };

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

      <MentorProfileView mentor={mentor} />

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

