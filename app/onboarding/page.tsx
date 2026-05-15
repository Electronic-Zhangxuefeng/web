"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiGet, apiSend, ApiError } from "@/lib/api";
import styles from "../dashboard/dashboard.module.css";

type IntroCard = {
  whyMajor?: string;
  regretOrSurprise?: string;
  fitFor?: string;
  notFitFor?: string;
  afterGraduation?: string;
};

type MentorProfile = {
  school: string | null;
  college: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  tags: string[] | null;
  reviewStatus: "draft" | "pending" | "approved" | "rejected";
  introCard: IntroCard | null;
};

const accent = "#3d5c4d";

const INTRO_FIELDS: { key: keyof IntroCard; label: string; placeholder: string }[] = [
  { key: "whyMajor", label: "为什么选这个专业？", placeholder: "回到当年填志愿那一天，告诉自己为什么是它。" },
  { key: "regretOrSurprise", label: "最后悔 / 最惊喜的一件事？", placeholder: "如果没有这件事，你的体验会非常不同。" },
  { key: "fitFor", label: "什么样的学生适合？", placeholder: "性格、兴趣、能力上的画像。" },
  { key: "notFitFor", label: "什么样的学生不建议？", placeholder: "诚实点，不是所有人都适合。" },
  { key: "afterGraduation", label: "大概的毕业去向？", placeholder: "本系毕业生通常去哪里、做什么。" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [school, setSchool] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [intro, setIntro] = useState<IntroCard>({});
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/auth?mode=login");
      return;
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "mentor") {
      router.replace("/dashboard");
      return;
    }
    apiGet<{ mentorProfile: MentorProfile | null }>("/api/me/profile").then((r) => {
      const p = r.mentorProfile;
      setProfile(p);
      if (p) {
        setSchool(p.school || "");
        setCollege(p.college || "");
        setMajor(p.major || "");
        setYear(p.year || "");
        setBio(p.bio || "");
        setTagsInput((p.tags || []).join("，"));
        setIntro(p.introCard || {});
      }
      setLoaded(true);
    });
  }, [session, isPending, router]);

  if (isPending || !loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6e6e68" }}>
        加载中…
      </div>
    );
  }

  // 已通过审核或审核中：不再走 onboarding
  if (profile && (profile.reviewStatus === "approved" || profile.reviewStatus === "pending")) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", padding: "60px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, color: "#1f1f1f", margin: 0 }}>
            {profile.reviewStatus === "approved" ? "你已通过审核" : "资料已提交，审核中"}
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6e6e68" }}>
            前往后台查看订单 / 开放档期 / 修改资料。
          </p>
          <Link
            href="/dashboard"
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ background: accent, marginTop: 20 }}
          >
            进入后台
          </Link>
        </div>
      </div>
    );
  }

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
    setSaving("draft");
    setMsg(null);
    try {
      await apiSend("/api/mentors/me/profile", "PATCH", collectBody());
      router.push("/dashboard");
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : (e as Error).message });
      setSaving(null);
    }
  };

  const submit = async () => {
    setSaving("submit");
    setMsg(null);
    try {
      await apiSend("/api/mentors/me/profile", "PATCH", collectBody());
      await apiSend("/api/mentors/me/profile/submit", "POST");
      router.push("/dashboard");
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : (e as Error).message });
      setSaving(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#1f1f1f" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: accent,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--serif)",
              fontSize: 17,
              fontWeight: 600,
            }}
          >
            路
          </div>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600 }}>指路</div>
            <div style={{ fontSize: 12, color: "#9a9a93" }}>学长 / 学姐入驻</div>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>
          填一份资料，让家长读懂你这个专业
        </h1>
        <p style={{ fontSize: 14, color: "#6e6e68", lineHeight: 1.7, margin: "0 0 28px" }}>
          基本信息 + 5 个介绍问答 + 学籍证明，整个过程约 8 分钟。
          提交后由 admin 人工审核，通过后即可开放档期、接受家长预约。
          {profile?.reviewStatus === "rejected" && "（上次审核未通过，请按反馈意见修改后重新提交）"}
        </p>

        {msg && (
          <div className={msg.kind === "ok" ? styles.alertOk : styles.alertBad} style={{ marginBottom: 16 }}>
            {msg.text}
          </div>
        )}

        <Section title="基本信息" subtitle="学校 / 院系 / 专业 / 年级，自由填写。家长会优先看到这一行。">
          <div className={styles.grid2}>
            <FieldInput label="学校" value={school} onChange={setSchool} placeholder="北京大学" />
            <FieldInput label="院系" value={college} onChange={setCollege} placeholder="电子学院" />
            <FieldInput label="专业" value={major} onChange={setMajor} placeholder="电子信息工程" />
            <FieldInput label="年级" value={year} onChange={setYear} placeholder="如：大三 / 研一 / 已毕业" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>自我介绍</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              placeholder="几句话介绍你自己。家长会先看这段决定要不要约你。"
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
        </Section>

        <Section
          title="5 个介绍问答"
          subtitle="每题不超过 300 字。这是家长决定是否预约你的关键。"
        >
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
        </Section>

        <Section
          title="学籍证明"
          subtitle="上传学生证 / 录取通知书 / 校园卡截图，仅 admin 审核可见，家长看不到。"
        >
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
              style={{
                marginTop: 12,
                maxWidth: 320,
                maxHeight: 220,
                border: "1px solid #ececec",
                borderRadius: 8,
              }}
            />
          )}
        </Section>

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={saveDraft}
            disabled={saving !== null}
          >
            {saving === "draft" ? "保存中…" : "先存草稿"}
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ background: accent }}
            onClick={submit}
            disabled={saving !== null}
          >
            {saving === "submit" ? "提交中…" : "提交审核"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1f1f1f", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "#6e6e68", margin: "4px 0 16px" }}>{subtitle}</p>}
      <div style={{ marginTop: subtitle ? 0 : 14 }}>{children}</div>
    </section>
  );
}

function FieldInput({
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
