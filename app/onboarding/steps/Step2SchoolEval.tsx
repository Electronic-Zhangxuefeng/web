// web/app/onboarding/steps/Step2SchoolEval.tsx
"use client";
import styles from "../onboarding.module.css";
import { StarRating } from "../components/StarRating";
import { CharCounter } from "../components/CharCounter";
import type { SchoolEval, SchoolEvalDimension } from "@/lib/intro-card-schema";

const DIMENSIONS: Array<{
  key: SchoolEvalDimension;
  title: string;
  hint: string;
}> = [
  {
    key: "career",
    title: "职业规划引导",
    hint: "学校在升学/就业引导上做得怎么样？讲座、就业指导中心、学生组织/导师的帮助。",
  },
  {
    key: "teaching",
    title: "教学质量",
    hint: "老师是否认真负责、课程是否有干货、是否存在大量形式主义课程、考核是否公平。",
  },
  {
    key: "life",
    title: "就读体验",
    hint: "学习环境、宿舍、校园大小风景、周边商业、交通便利度等综合感受。",
  },
  {
    key: "care",
    title: "人文关怀",
    hint: "宿舍报修、保卫处求助、辅导员/心理咨询响应速度等。建议在理由里举一个真实例子。",
  },
  {
    key: "practice",
    title: "实践机会",
    hint: "教授课题组开放、SRTP/大创、企业合作、海外交流名额、各类比赛资源。",
  },
];

export function Step2SchoolEval({
  data,
  onChange,
  errors,
}: {
  data: SchoolEval;
  onChange: (patch: Partial<SchoolEval>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h1 className={styles.title}>学校评价</h1>
      <p className={styles.subtitle}>
        以下信息将<strong>匿名聚合</strong>到该校的学校主页，是家长了解这所学校的核心依据。
      </p>

      <div className={styles.notice}>
        如果你对某个维度不熟悉（例如大一新生对就业引导无感），建议按整体印象给中性 3 星，
        并在理由里写一句&ldquo;我了解有限&rdquo;——比拍脑袋满分/零分更有用。
      </div>

      {DIMENSIONS.map((d) => {
        const cur = data[d.key];
        const errScore = errors[`${d.key}.score`];
        const errNote = errors[`${d.key}.note`];
        return (
          <div
            key={d.key}
            style={{
              border: "1px solid #ececec",
              borderRadius: 9,
              padding: "16px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1f1f1f" }}>{d.title}</div>
            <div style={{ fontSize: 12, color: "#9a9a93", margin: "4px 0 10px" }}>{d.hint}</div>
            <StarRating
              value={cur.score}
              onChange={(v) => onChange({ [d.key]: { ...cur, score: v } } as Partial<SchoolEval>)}
            />
            {errScore && <span className={styles.errorText}>{errScore}</span>}
            <div style={{ marginTop: 10 }}>
              <input
                className={`${styles.input} ${errNote ? styles.inputError : ""}`}
                value={cur.note}
                maxLength={60}
                onChange={(e) =>
                  onChange({ [d.key]: { ...cur, note: e.target.value } } as Partial<SchoolEval>)
                }
                placeholder="一句话理由（必填，60 字内）"
              />
              <CharCounter value={cur.note} max={60} />
              {errNote && <span className={styles.errorText}>{errNote}</span>}
            </div>
          </div>
        );
      })}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>优势（选填，最多 300 字）</label>
        <p className={styles.hint} style={{ marginBottom: 6 }}>
          在你的真实就读体验里，这所学校最大的几个优势是什么？尽量具体，避免&ldquo;很好很棒&rdquo;。
        </p>
        <textarea
          className={styles.textarea}
          value={data.pros}
          maxLength={300}
          rows={4}
          onChange={(e) => onChange({ pros: e.target.value })}
        />
        <CharCounter value={data.pros} max={300} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>不足（选填，最多 300 字）</label>
        <p className={styles.hint} style={{ marginBottom: 6 }}>
          最让你失望、或最希望学弟学妹在选校前就知道的几个不足是什么？我们不需要黑稿，希望你说真话。
        </p>
        <textarea
          className={styles.textarea}
          value={data.cons}
          maxLength={300}
          rows={4}
          onChange={(e) => onChange({ cons: e.target.value })}
        />
        <CharCounter value={data.cons} max={300} />
      </div>
    </div>
  );
}

export function validateStep2(d: SchoolEval): Record<string, string> {
  const e: Record<string, string> = {};
  (["career", "teaching", "life", "care", "practice"] as const).forEach((k) => {
    if (d[k].score < 1) e[`${k}.score`] = "请打分（1–5 星）";
    if (!d[k].note.trim()) e[`${k}.note`] = "请填一句话理由";
    else if (d[k].note.length > 60) e[`${k}.note`] = "不能超过 60 字";
  });
  return e;
}
