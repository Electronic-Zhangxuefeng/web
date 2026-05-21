"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, formatCents, formatDateTime, ApiError } from "@/lib/api";
import styles from "../../dashboard/dashboard.module.css";

type WStatus = "pending" | "paid" | "rejected";

type AdminWithdrawal = {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  school: string | null;
  amountCents: number;
  status: WStatus;
  alipayQrSnapshot: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
};

const ADMIN_ACCENT = "#1a1a1a";

const TABS: Array<{ key: WStatus | "all"; label: string }> = [
  { key: "pending", label: "处理中" },
  { key: "paid", label: "已打款" },
  { key: "rejected", label: "已拒绝" },
  { key: "all", label: "全部" },
];

export default function AdminWithdrawalsPage() {
  const [tab, setTab] = useState<WStatus | "all">("pending");
  const [rows, setRows] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [rejectFor, setRejectFor] = useState<AdminWithdrawal | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const reload = async (which: WStatus | "all" = tab) => {
    setLoading(true);
    setErr(null);
    try {
      const qs = which === "all" ? "" : `?status=${which}`;
      const r = await apiGet<{ withdrawals: AdminWithdrawal[] }>(
        `/api/admin/withdrawals/list${qs}`
      );
      setRows(r.withdrawals);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const markPaid = async (w: AdminWithdrawal) => {
    if (!confirm(`确认 ${w.mentorName} 的 ${formatCents(w.amountCents)} 提现已打款?`)) return;
    setActingId(w.id);
    setErr(null);
    try {
      await apiSend(`/api/admin/withdrawals/${w.id}/paid`, "POST", {});
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectFor) return;
    if (!rejectNote.trim()) {
      alert("请填写拒绝原因");
      return;
    }
    setActingId(rejectFor.id);
    setErr(null);
    try {
      await apiSend(`/api/admin/withdrawals/${rejectFor.id}/reject`, "POST", {
        adminNote: rejectNote.trim(),
      });
      setRejectFor(null);
      setRejectNote("");
      await reload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <>
      <div className={styles.topbar}>
        <span>Admin</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>提现</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>提现订单</h1>
        <p className={styles.pageSub}>
          学长申请提现后会出现在这里。点收款码缩略图放大,用支付宝扫码完成转账后回来「标记已打款」。
        </p>

        <div style={{ display: "flex", gap: 8, margin: "12px 0 18px", flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: `1px solid ${active ? ADMIN_ACCENT : "#e0dfd8"}`,
                  background: active ? ADMIN_ACCENT : "#fff",
                  color: active ? "#fff" : "#1f1f1f",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {err && <div className={styles.alertBad}>{err}</div>}

        {loading ? (
          <div className={styles.emptyState}>加载中…</div>
        ) : rows.length === 0 ? (
          <div className={styles.emptyState}>暂无记录。</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>学长</th>
                <th>金额</th>
                <th>状态</th>
                <th>申请时间</th>
                <th>收款码</th>
                <th>备注 / 处理</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{w.mentorName}</div>
                    <div style={{ fontSize: 11, color: "#9a9a93" }}>{w.mentorEmail}</div>
                    {w.school && (
                      <div style={{ fontSize: 11, color: "#6e6e68" }}>{w.school}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCents(w.amountCents)}</td>
                  <td>
                    <StatusPill status={w.status} />
                  </td>
                  <td style={{ fontSize: 12, color: "#6e6e68" }}>
                    {formatDateTime(w.createdAt)}
                  </td>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.alipayQrSnapshot}
                      alt="收款码"
                      onClick={() => setPreviewImg(w.alipayQrSnapshot)}
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "contain",
                        border: "1px solid #ececec",
                        borderRadius: 6,
                        cursor: "zoom-in",
                        background: "#fff",
                      }}
                    />
                  </td>
                  <td style={{ fontSize: 12, color: "#6e6e68", maxWidth: 220 }}>
                    {w.adminNote && <div>{w.adminNote}</div>}
                    {w.processedAt && (
                      <div style={{ fontSize: 11, color: "#9a9a93" }}>
                        {formatDateTime(w.processedAt)}
                      </div>
                    )}
                  </td>
                  <td>
                    {w.status === "pending" ? (
                      <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          style={{ background: ADMIN_ACCENT, padding: "5px 10px", fontSize: 12 }}
                          onClick={() => markPaid(w)}
                          disabled={actingId === w.id}
                        >
                          {actingId === w.id ? "处理中…" : "标记已打款"}
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => {
                            setRejectFor(w);
                            setRejectNote("");
                          }}
                          disabled={actingId === w.id}
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#9a9a93", fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImg}
            alt="收款码大图"
            style={{ maxWidth: "90vw", maxHeight: "90vh", background: "#fff", padding: 16, borderRadius: 8 }}
          />
        </div>
      )}

      {rejectFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => actingId !== rejectFor.id && setRejectFor(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              maxWidth: 420,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>
              拒绝提现
            </h3>
            <p className={styles.cardSub}>
              {rejectFor.mentorName} · {formatCents(rejectFor.amountCents)}。拒绝后额度释放回学长。
            </p>
            <label className={styles.label} style={{ marginTop: 14 }}>
              拒绝原因(必填)
            </label>
            <textarea
              className={styles.textarea}
              value={rejectNote}
              maxLength={500}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="例:收款码无效,请重新上传后再申请"
              rows={4}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setRejectFor(null)}
                disabled={actingId === rejectFor.id}
              >
                取消
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={submitReject}
                disabled={actingId === rejectFor.id}
              >
                {actingId === rejectFor.id ? "提交中…" : "确认拒绝"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatusPill({ status }: { status: WStatus }) {
  const map: Record<WStatus, { label: string; cls: string }> = {
    pending: { label: "处理中", cls: styles.pillWarn },
    paid: { label: "已打款", cls: styles.pillOk },
    rejected: { label: "已拒绝", cls: styles.pillBad },
  };
  const m = map[status];
  return <span className={`${styles.pill} ${m.cls}`}>{m.label}</span>;
}
