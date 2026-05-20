"use client";

import { useEffect, useState } from "react";
import { apiGet, formatDateTime, ApiError } from "@/lib/api";
import styles from "../../dashboard/dashboard.module.css";

type ApprovedMentor = {
  userId: string;
  email: string;
  name: string;
  school: string | null;
  college: string | null;
  major: string | null;
  year: string | null;
  tags: string[] | null;
  ratingAvg: string;
  reviewsCount: number;
  reviewedAt: string | null;
  createdAt: string;
};

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<ApprovedMentor[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await apiGet<{ mentors: ApprovedMentor[] }>("/api/admin/mentors/approved");
        if (!cancel) setMentors(r.mentors);
      } catch (e) {
        if (!cancel) setErr(e instanceof ApiError ? e.message : (e as Error).message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = mentors
    ? mentors.filter((m) => {
        if (!q.trim()) return true;
        const s = q.trim().toLowerCase();
        return (
          m.name?.toLowerCase().includes(s) ||
          m.email?.toLowerCase().includes(s) ||
          m.school?.toLowerCase().includes(s) ||
          m.major?.toLowerCase().includes(s)
        );
      })
    : null;

  return (
    <>
      <div className={styles.topbar}>
        <span>后台</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>学长学姐</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>已通过审核的学长 / 学姐</h1>
        <p className={styles.pageSub}>
          {mentors === null
            ? "加载中…"
            : `共 ${mentors.length} 位，可按姓名 / 邮箱 / 学校 / 专业搜索`}
        </p>

        {err && (
          <div className={styles.alertBad} style={{ marginBottom: 16 }}>
            {err}
          </div>
        )}

        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <input
            type="search"
            placeholder="搜索…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.input}
          />
        </div>

        {mentors === null ? (
          <div className={styles.emptyState}>加载中…</div>
        ) : filtered && filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {mentors.length === 0 ? "暂无已通过审核的学长。" : "没有匹配的记录。"}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>姓名</th>
                <th>学校 / 院系</th>
                <th>专业 / 年级</th>
                <th>评分</th>
                <th>标签</th>
                <th>通过时间</th>
              </tr>
            </thead>
            <tbody>
              {filtered!.map((m) => (
                <tr key={m.userId}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{m.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#9a9a93", marginTop: 2 }}>
                      {m.email}
                    </div>
                  </td>
                  <td>
                    <div>{m.school || "—"}</div>
                    <div style={{ fontSize: 12, color: "#9a9a93", marginTop: 2 }}>
                      {m.college || "—"}
                    </div>
                  </td>
                  <td>
                    <div>{m.major || "—"}</div>
                    <div style={{ fontSize: 12, color: "#9a9a93", marginTop: 2 }}>
                      {m.year || "—"}
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--serif)" }}>
                    {Number(m.ratingAvg).toFixed(1)}
                    <span style={{ color: "#9a9a93", fontSize: 12, marginLeft: 4 }}>
                      ({m.reviewsCount})
                    </span>
                  </td>
                  <td>
                    {m.tags && m.tags.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {m.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className={`${styles.pill} ${styles.pillNeutral}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "#9a9a93" }}>—</span>
                    )}
                  </td>
                  <td style={{ color: "#6e6e68" }}>{formatDateTime(m.reviewedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
