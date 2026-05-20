// web/app/onboarding/steps/Step3PersonalExp.tsx
"use client";
import styles from "../onboarding.module.css";
import { CharCounter } from "../components/CharCounter";
import { MultiChipSelect } from "../components/MultiChipSelect";
import {
  PATH_OPTIONS,
  ONE_LINER_MAX,
  SUPPLEMENT_MAX,
  type PersonalExp,
  type PathKey,
} from "@/lib/intro-card-schema";

type BoolField =
  | "research"
  | "internship"
  | "competition"
  | "zongping"
  | "program"
  | "transfer";

const BOOL_FIELDS: Record<
  BoolField,
  { title: string; question: string; placeholder: string; followUpLabel?: string }
> = {
  research: {
    title: "B3 · 科研经历",
    question: "你做过科研吗？",
    placeholder: "一句话简介，例：大三进 ML 系统方向组，发过一篇 ACL workshop。",
  },
  internship: {
    title: "B4 · 实习经历",
    question: "你有过实习吗？",
    placeholder: "一句话简介，例：字节大模型基建组实习半年。",
  },
  competition: {
    title: "B5 · 竞赛经历",
    question: "你参加过竞赛吗？",
    placeholder: "一句话简介，例：ICPC 区域赛金两次。",
  },
  zongping: {
    title: "B6 · 综评经历",
    question: "你是通过综合素质评价（综评）进入这所学校的吗？",
    placeholder: "一句话简介，例：当年笔面都有，难度中等，提前准备很重要。",
  },
  program: {
    title: "B7 · 特色培养计划",
    question:
      "你是否在所在学校的特色培养项目里？（实验班 / 强基 / 拔尖 / 英才 / 卓越工程师 / 中外合办等）",
    placeholder: "例：致远工科荣誉计划",
    followUpLabel: "项目名称",
  },
  transfer: {
    title: "B8 · 转专业 / 插班生经历",
    question: "你是否转过专业、或通过插班生考试进入这所学校？",
    placeholder: "一句话简介，例：大一末转入计算机，绩点要求 3.5+ 加面试。",
  },
};

export function Step3PersonalExp({
  data,
  onChange,
  errors,
}: {
  data: PersonalExp;
  onChange: (patch: Partial<PersonalExp>) => void;
  errors: Record<string, string>;
}) {
  const setBool =
    (key: BoolField) =>
    (patch: Partial<{ had: boolean; text: string }>) =>
      onChange({ [key]: { ...data[key], ...patch } } as Partial<PersonalExp>);

  return (
    <div>
      <h1 className={styles.title}>差异化经历</h1>
      <p className={styles.subtitle}>
        以下信息将展示在<strong>你的主页</strong>，是家长在该校多位学长学姐里&ldquo;为什么选你&rdquo;的关键。
        诚实最重要：&ldquo;暂无&rdquo;比注水更好。
      </p>

      {/* B2 */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>B2 · 你当前最倾向的路径（必填，可多选）</label>
        <p className={styles.hint} style={{ marginBottom: 8 }}>
          建议不超过 2 项，否则显得不聚焦。
        </p>
        <MultiChipSelect<PathKey>
          value={data.paths}
          onChange={(v) => onChange({ paths: v })}
          options={PATH_OPTIONS}
        />
        {errors.paths && <span className={styles.errorText}>{errors.paths}</span>}
      </div>

      {/* B3–B8 平铺,是/否 + 一句话简介 */}
      {(Object.keys(BOOL_FIELDS) as BoolField[]).map((key) => {
        const meta = BOOL_FIELDS[key];
        const v = data[key];
        return (
          <div key={key} className={styles.fieldGroup}>
            <label className={styles.label}>{meta.title}</label>
            <p className={styles.hint} style={{ marginBottom: 8 }}>
              {meta.question}
            </p>
            <YesNoBlock
              value={v.had}
              onChange={(had) => setBool(key)({ had, text: had ? v.text : "" })}
            />
            {v.had && (
              <div style={{ marginTop: 12 }}>
                {meta.followUpLabel && (
                  <label
                    className={styles.label}
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                  >
                    {meta.followUpLabel}
                  </label>
                )}
                <input
                  className={styles.input}
                  value={v.text}
                  maxLength={ONE_LINER_MAX}
                  placeholder={meta.placeholder}
                  onChange={(e) => setBool(key)({ text: e.target.value })}
                />
                <CharCounter value={v.text} max={ONE_LINER_MAX} />
              </div>
            )}
            {errors[key] && <span className={styles.errorText}>{errors[key]}</span>}
          </div>
        );
      })}

      {/* 选填补充 */}
      <div className={styles.fieldGroup} style={{ marginTop: 24 }}>
        <label className={styles.label}>其他想补充的（选填）</label>
        <p className={styles.hint} style={{ marginBottom: 8 }}>
          有什么没问到、但你觉得家长应该知道的事？例如双学位、社团、海外交换等。
        </p>
        <textarea
          className={styles.textarea}
          value={data.supplement}
          maxLength={SUPPLEMENT_MAX}
          rows={3}
          placeholder="选填，没有就留空。"
          onChange={(e) => onChange({ supplement: e.target.value })}
        />
        <CharCounter value={data.supplement} max={SUPPLEMENT_MAX} />
      </div>
    </div>
  );
}

function YesNoBlock({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[
        { v: true, label: "是" },
        { v: false, label: "否" },
      ].map(({ v, label }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          style={{
            padding: "8px 18px",
            borderRadius: 7,
            border: value === v ? "1px solid #3d5c4d" : "1px solid #d5d5d5",
            background: value === v ? "#3d5c4d" : "#fff",
            color: value === v ? "#fff" : "#1f1f1f",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function validateStep3(d: PersonalExp): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.paths.length === 0) e.paths = "请至少选择一项当前路径";
  const boolKeys: BoolField[] = [
    "research",
    "internship",
    "competition",
    "zongping",
    "program",
    "transfer",
  ];
  for (const k of boolKeys) {
    if (d[k].had && !d[k].text.trim()) {
      e[k] = k === "program" ? "请填写项目名称" : "请用一句话简单介绍";
    }
  }
  return e;
}
