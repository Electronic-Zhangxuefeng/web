// web/app/onboarding/steps/Step1Basic.tsx
"use client";
import styles from "../onboarding.module.css";
import { SchoolSelect } from "../components/SchoolSelect";
import { CharCounter } from "../components/CharCounter";
import { YEAR_OPTIONS } from "@/lib/intro-card-schema";

export type Step1Data = {
  school: string;
  college: string;
  major: string;
  year: string;
  displayInitial: string;
  bio: string;
  tags: string[];
};

export function Step1Basic({
  data,
  onChange,
  errors,
}: {
  data: Step1Data;
  onChange: (patch: Partial<Step1Data>) => void;
  errors: Partial<Record<keyof Step1Data, string>>;
}) {
  return (
    <div>
      <h1 className={styles.title}>基本信息</h1>
      <p className={styles.subtitle}>
        学校、院系、专业、年级——家长会优先看到这一行。所有字段必填。
      </p>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>学校</label>
        <SchoolSelect value={data.school} onChange={(v) => onChange({ school: v })} />
        {errors.school && <span className={styles.errorText}>{errors.school}</span>}
      </div>

      <div className={styles.grid2}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>院系</label>
          <input
            className={`${styles.input} ${errors.college ? styles.inputError : ""}`}
            value={data.college}
            maxLength={40}
            onChange={(e) => onChange({ college: e.target.value })}
            placeholder="电子学院"
          />
          {errors.college && <span className={styles.errorText}>{errors.college}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>专业</label>
          <input
            className={`${styles.input} ${errors.major ? styles.inputError : ""}`}
            value={data.major}
            maxLength={40}
            onChange={(e) => onChange({ major: e.target.value })}
            placeholder="电子信息工程"
          />
          {errors.major && <span className={styles.errorText}>{errors.major}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>年级</label>
          <select
            className={`${styles.select} ${errors.year ? styles.inputError : ""}`}
            value={data.year}
            onChange={(e) => onChange({ year: e.target.value })}
          >
            <option value="">请选择</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {errors.year && <span className={styles.errorText}>{errors.year}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>化名展示首字</label>
          <input
            className={styles.input}
            value={data.displayInitial}
            maxLength={2}
            onChange={(e) => onChange({ displayInitial: e.target.value })}
            placeholder="例：王"
          />
          <span className={styles.hint}>家长看到的卡片会显示这一字 + 学校 + 专业</span>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>自我介绍</label>
        <textarea
          className={`${styles.textarea} ${errors.bio ? styles.inputError : ""}`}
          value={data.bio}
          maxLength={2000}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="几句话介绍你自己。家长会先看这段决定要不要约你。"
          rows={5}
        />
        <CharCounter value={data.bio} max={2000} />
        {errors.bio && <span className={styles.errorText}>{errors.bio}</span>}
      </div>

    </div>
  );
}

export function validateStep1(d: Step1Data): Partial<Record<keyof Step1Data, string>> {
  const e: Partial<Record<keyof Step1Data, string>> = {};
  if (!d.school.trim()) e.school = "请选择或填写学校";
  if (!d.college.trim()) e.college = "请填写院系";
  if (!d.major.trim()) e.major = "请填写专业";
  if (!d.year.trim()) e.year = "请选择年级";
  if (!d.bio.trim()) e.bio = "请填写自我介绍";
  return e;
}
