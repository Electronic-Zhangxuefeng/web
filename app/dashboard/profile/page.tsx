"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiSend, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import styles from "../dashboard.module.css";

type IntroCard = {
  whyMajor?: string;
  regretOrSurprise?: string;
  fitFor?: string;
  notFitFor?: string;
  afterGraduation?: string;
};

type MentorProfile = {
  userId: string;
  school: string | null;
  college: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  tags: string[] | null;
  reviewStatus: "draft" | "pending" | "approved" | "rejected";
  reviewReason: string | null;
  reviewedAt: string | null;
  introCard: IntroCard | null;
  ratingAvg: string;
  reviewsCount: number;
};

type ParentProfile = {
  id: string;
  parentRole: string | null;
  province: string | null;
  stage: string | null;
  intendedMajors: string[] | null;
  focusAreas: string[] | null;
  tilt: string | null;
  note: string | null;
};

type MeProfile = {
  user: { id: string; email: string; name: string; role: "parent" | "mentor" };
  parentProfile?: ParentProfile | null;
  mentorProfile?: MentorProfile | null;
};

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (!session) return;
    apiGet<MeProfile>("/api/me/profile").then(setMe);
  }, [session]);

  if (!me) return <div style={{ padding: 32, color: "#6e6e68" }}>加载中…</div>;

  return me.user.role === "mentor" ? (
    <MentorProfileEditor profile={me.mentorProfile ?? null} />
  ) : (
    <ParentProfileView profile={me.parentProfile ?? null} />
  );
}

// ── Mentor ─────────────────────────────────────────────────────────────

const INTRO_FIELDS: { key: keyof IntroCard; label: string; placeholder: string }[] = [
  { key: "whyMajor", label: "为什么选这个专业？", placeholder: "回到当年填志愿的那天，告诉自己为什么是它。" },
  { key: "regretOrSurprise", label: "最后悔 / 最惊喜的一件事？", placeholder: "如果没有这件事，你的体验会非常不同。" },
  { key: "fitFor", label: "什么样的学生适合？", placeholder: "性格、兴趣、能力上的画像。" },
  { key: "notFitFor", label: "什么样的学生不建议？", placeholder: "诚实点，不是所有人都适合。" },
  { key: "afterGraduation", label: "大概的毕业去向？", placeholder: "本系学生毕业后会去哪里，做什么。" },
];

function MentorProfileEditor({ profile }: { profile: MentorProfile | null }) {
  const accent = "#3d5c4d";
  const [school, setSchool] = useState(profile?.school || "");
  const [college, setCollege] = useState(profile?.college || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [year, setYear] = useState(profile?.year || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [tagsInput, setTagsInput] = useState((profile?.tags || []).join("，"));
  const [intro, setIntro] = useState<IntroCard>(profile?.introCard || {});
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const status = profile?.reviewStatus || "draft";

  const handleFile = (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      setMsg({ kind: "err", text: "图片过大，请压缩到 2MB 以内" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setProofDataUrl(url);
      setProofPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const collectBody = () => {
    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const body: Record<string, unknown> = {
      school,
      college,
      major,
      year,
      bio,
      tags,
      introCard: intro,
    };
    if (proofDataUrl) body.proofImageUrl = proofDataUrl;
    return body;
  };

  const saveDraft = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await apiSend("/api/mentors/me/profile", "PATCH", collectBody());
      setMsg({ kind: "ok", text: "已保存草稿" });
      setProofDataUrl(null);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : (e as Error).message });
    } finally {
      setSaving(false);
    }
  };
  const submitForReview = async () => {
    setSubmitting(true);
    setMsg(null);
    try {
      await apiSend("/api/mentors/me/profile", "PATCH", collectBody());
      await apiSend("/api/mentors/me/profile/submit", "POST");
      setMsg({ kind: "ok", text: "已提交审核，等待 admin 处理。" });
      setProofDataUrl(null);
      window.location.reload();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = status === "draft" || status === "rejected";

  return (
    <>
      <div className={styles.topbar}>
        <span>指路</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>资料与审核</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>资料与审核</h1>
        <p className={styles.pageSub}>填写学校信息、5 个介绍问答和学籍证明，提交后由 admin 审核。</p>

        <StatusBlock status={status} reason={profile?.reviewReason || null} accent={accent} />

        {msg && (
          <div className={msg.kind === "ok" ? styles.alertOk : styles.alertBad} style={{ marginTop: 16 }}>
            {msg.text}
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>基本信息</h2>
          <div className={styles.grid2} style={{ marginTop: 10 }}>
            <Field label="学校" value={school} onChange={setSchool} placeholder="北京大学" />
            <Field label="院系" value={college} onChange={setCollege} placeholder="电子学院" />
            <Field label="专业" value={major} onChange={setMajor} placeholder="电子信息工程" />
            <Field label="年级" value={year} onChange={setYear} placeholder="如：大三 / 研一 / 已毕业" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>自我介绍</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              placeholder="几句话介绍一下自己。家长会先看这段决定要不要约你。"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>标签</label>
            <input
              className={styles.input}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="保研，实习经验，转专业（用空格或逗号隔开，最多 8 个）"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5 个介绍问答</h2>
          <p className={styles.pageSub}>每题不超过 300 字。这是家长决定是否约你的关键。</p>
          {INTRO_FIELDS.map((f) => (
            <div className={styles.field} key={f.key}>
              <label className={styles.label}>{f.label}</label>
              <textarea
                className={styles.textarea}
                value={intro[f.key] || ""}
                maxLength={300}
                placeholder={f.placeholder}
                onChange={(e) => setIntro({ ...intro, [f.key]: e.target.value })}
              />
              <span className={styles.hint}>{(intro[f.key] || "").length} / 300</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>学籍证明</h2>
          <p className={styles.pageSub}>
            上传学生证 / 录取通知书 / 校园卡截图，仅供 admin 审核可见。
            {profile && status !== "draft" && "（已上传记录会自动保留，无需重传）"}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            style={{ fontSize: 13 }}
          />
          {proofPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proofPreview}
              alt="证明预览"
              style={{ marginTop: 12, maxWidth: 280, maxHeight: 200, border: "1px solid #ececec", borderRadius: 8 }}
            />
          )}
        </div>

        <div className={styles.section} style={{ display: "flex", gap: 10 }}>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={saveDraft}
            disabled={saving || submitting}
          >
            {saving ? "保存中…" : "保存草稿"}
          </button>
          {canSubmit && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ background: accent }}
              onClick={submitForReview}
              disabled={saving || submitting}
            >
              {submitting ? "提交中…" : status === "rejected" ? "重新提交审核" : "提交审核"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function StatusBlock({
  status,
  reason,
  accent,
}: {
  status: "draft" | "pending" | "approved" | "rejected";
  reason: string | null;
  accent: string;
}) {
  if (status === "draft") {
    return (
      <div className={styles.alertWarn} style={{ marginTop: 12 }}>
        <span>📝</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>资料未提交</div>
          <div>完成所有必填字段（学校 / 院系 / 专业 / 年级 / 5 个问答 / 证明图）后点提交。</div>
        </div>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className={styles.alertWarn} style={{ marginTop: 12 }}>
        <span>⏳</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>审核中</div>
          <div>资料已提交，请等待 admin 审核。审核通过后会在概览页显示。</div>
        </div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className={styles.alertBad} style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 500 }}>审核未通过</div>
        {reason && <div style={{ marginTop: 4 }}>原因：{reason}</div>}
        <div style={{ marginTop: 4 }}>修改后可重新提交。</div>
      </div>
    );
  }
  return (
    <div className={styles.alertOk} style={{ marginTop: 12, borderColor: accent + "44" }}>
      <div style={{ fontWeight: 500 }}>✓ 已通过审核</div>
      <div>资料公开可见。编辑保存后不会回到待审核状态。</div>
    </div>
  );
}

// ── Parent ─────────────────────────────────────────────────────────────

const PARENT_ROLE_LABEL: Record<string, string> = {
  student: "学生",
  parent: "家长",
  teacher: "老师",
  other: "其他",
};
const STAGE_LABEL: Record<string, string> = {
  senior_pre: "高考前",
  senior_post: "高考后",
  g10_g11: "高一 / 高二",
  gap: "Gap",
  other: "其他",
};
const TILT_LABEL: Record<string, string> = {
  employment: "就业导向",
  grad_school: "升学 / 保研",
  overseas: "出国",
  experience: "体验为主",
  undecided: "尚未确定",
};

function ParentProfileView({ profile }: { profile: ParentProfile | null }) {
  const accent = "#b8472d";
  const [rematching, setRematching] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const rematch = async () => {
    setRematching(true);
    setMsg(null);
    try {
      const r = await apiSend<{ count: number }>("/api/me/profile/rematch", "POST");
      setMsg({ kind: "ok", text: `已重新匹配，共 ${r.count} 位学长` });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : (e as Error).message });
    } finally {
      setRematching(false);
    }
  };

  return (
    <>
      <div className={styles.topbar}>
        <span>问津</span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>我的资料</span>
      </div>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>我的资料</h1>
        <p className={styles.pageSub}>你在问卷里填写的信息，会影响匹配结果。</p>

        {!profile ? (
          <div className={styles.card} style={{ marginTop: 16 }}>
            <div className={styles.cardBanner} style={{ background: accent }} />
            <h3 className={styles.cardTitle}>还没有填写问卷</h3>
            <p className={styles.cardSub} style={{ marginBottom: 14 }}>
              先完成问卷，系统才能为你匹配合适的学长学姐。
            </p>
            <Link
              href="/questionnaire"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ background: accent }}
            >
              开始填写
            </Link>
          </div>
        ) : (
          <>
            {msg && (
              <div className={msg.kind === "ok" ? styles.alertOk : styles.alertBad} style={{ marginBottom: 16 }}>
                {msg.text}
              </div>
            )}

            <div className={styles.grid2}>
              <InfoCard label="身份" value={profile.parentRole ? PARENT_ROLE_LABEL[profile.parentRole] || profile.parentRole : "—"} />
              <InfoCard label="所在省份" value={profile.province || "—"} />
              <InfoCard label="阶段" value={profile.stage ? STAGE_LABEL[profile.stage] || profile.stage : "—"} />
              <InfoCard label="升学倾向" value={profile.tilt ? TILT_LABEL[profile.tilt] || profile.tilt : "—"} />
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>意向专业</h2>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(profile.intendedMajors || []).map((m) => (
                  <span key={m} className={`${styles.pill} ${styles.pillNeutral}`}>
                    {m}
                  </span>
                ))}
                {(!profile.intendedMajors || profile.intendedMajors.length === 0) && (
                  <span style={{ color: "#9a9a93", fontSize: 13 }}>—</span>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>关注方向</h2>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(profile.focusAreas || []).map((m) => (
                  <span key={m} className={`${styles.pill} ${styles.pillNeutral}`}>
                    {m}
                  </span>
                ))}
                {(!profile.focusAreas || profile.focusAreas.length === 0) && (
                  <span style={{ color: "#9a9a93", fontSize: 13 }}>—</span>
                )}
              </div>
            </div>

            {profile.note && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>额外说明</h2>
                <div className={styles.card} style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7 }}>
                  {profile.note}
                </div>
              </div>
            )}

            <div className={styles.section} style={{ display: "flex", gap: 10 }}>
              <Link
                href="/questionnaire"
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                重新填写问卷
              </Link>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ background: accent }}
                onClick={rematch}
                disabled={rematching}
              >
                {rematching ? "重新匹配中…" : "重新匹配学长"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.card}>
      <p className={styles.cardSub}>{label}</p>
      <p style={{ fontSize: 16, marginTop: 6, color: "#1f1f1f", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
