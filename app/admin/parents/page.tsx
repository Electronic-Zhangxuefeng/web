"use client";

import { useEffect, useState } from "react";
import { apiGet, formatDateTime, ApiError } from "@/lib/api";
import styles from "../../dashboard/dashboard.module.css";

type AdminParent = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  parentRole: "student" | "parent" | "teacher" | "other" | null;
  province: string | null;
  stage: "senior_pre" | "senior_post" | "g10_g11" | "gap" | "other" | null;
  intendedMajors: string[] | null;
  focusAreas: string[] | null;
  tilt: "employment" | "grad_school" | "overseas" | "experience" | "undecided" | null;
  profileUpdatedAt: string | null;
  ordersCount: number;
};

const ROLE_LABEL: Record<NonNullable<AdminParent["parentRole"]>, string> = {
  student: "学生",
  parent: "家长",
  teacher: "老师",
  other: "其他",
};
const STAGE_LABEL: Record<NonNullable<AdminParent["stage"]>, string> = {
  senior_pre: "高三在读",
  senior_post: "高考后",
  g10_g11: "高一 / 高二",
  gap: "复读 / Gap",
  other: "其他",
};
const TILT_LABEL: Record<NonNullable<AdminParent["tilt"]>, string> = {
  employment: "偏就业",
  grad_school: "偏读研",
  overseas: "偏出国",
  experience: "偏体验",
  undecided: "未定",
};

export default function AdminParentsPage() {
  const [parents, setParents] = useState<AdminParent[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await apiGet<{ parents: AdminParent[] }>("/api/admin/parents/list");
        if (!cancel) setParents(r.parents);
      } catch (e) {
        if (!cancel) setErr(e instanceof ApiError ? e.message : (e as Error).message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = parents
    ? parents.filter((p) => {
        if (!q.trim()) return true;
        const s = q.trim().toLowerCase();
        return (
          p.name?.toLowerCase().includes(s) ||
          p.email?.toLowerCase().includes(s) ||
          p.province?.toLowerCase().includes(s)
        );
      })
    : null;

  const filledCount = parents?.filter((p) => p.profileUpdatedAt != null).length ?? 0;

  return (
    <>
      <div className={styles.topbar}>
        <span>后台</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>家长</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>所有注册家长 / 学生</h1>
        <p className={styles.pageSub}>
          {parents === null
            ? "加载中…"
            : `共 ${parents.length} 人，其中 ${filledCount} 人已完成问卷`}
        </p>

        {err && (
          <div className={styles.alertBad} style={{ marginBottom: 16 }}>
            {err}
          </div>
        )}

        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <input
            type="search"
            placeholder="搜索姓名 / 邮箱 / 省份…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.input}
          />
        </div>

        {parents === null ? (
          <div className={styles.emptyState}>加载中…</div>
        ) : filtered && filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {parents.length === 0 ? "暂无注册家长。" : "没有匹配的记录。"}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>姓名 / 邮箱</th>
                <th>身份</th>
                <th>省份</th>
                <th>阶段</th>
                <th>意向</th>
                <th>倾向</th>
                <th>订单</th>
                <th>注册时间</th>
              </tr>
            </thead>
            <tbody>
              {filtered!.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#9a9a93", marginTop: 2 }}>
                      {p.email}
                    </div>
                  </td>
                  <td>{p.parentRole ? ROLE_LABEL[p.parentRole] : <Dash />}</td>
                  <td>{p.province || <Dash />}</td>
                  <td>{p.stage ? STAGE_LABEL[p.stage] : <Dash />}</td>
                  <td style={{ maxWidth: 200 }}>
                    {p.intendedMajors && p.intendedMajors.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.intendedMajors.slice(0, 3).map((m) => (
                          <span
                            key={m}
                            className={`${styles.pill} ${styles.pillNeutral}`}
                          >
                            {m}
                          </span>
                        ))}
                        {p.intendedMajors.length > 3 && (
                          <span style={{ fontSize: 11, color: "#9a9a93" }}>
                            +{p.intendedMajors.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Dash />
                    )}
                  </td>
                  <td>{p.tilt ? TILT_LABEL[p.tilt] : <Dash />}</td>
                  <td style={{ fontFamily: "var(--serif)" }}>{p.ordersCount}</td>
                  <td style={{ color: "#6e6e68" }}>{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Dash() {
  return <span style={{ color: "#9a9a93" }}>—</span>;
}
