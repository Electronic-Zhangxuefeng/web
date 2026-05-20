// web/app/onboarding/steps/Step2SchoolEval.tsx
"use client";
import styles from "../onboarding.module.css";
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
    hint: "宿舍报修、保卫处求助、辅导员/心理咨询响应速度等。建议举一个真实例子。",
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
      <h1 className={styles.title}>学院介绍</h1>
      <p className={styles.subtitle}>
        以下内容将<strong>直接展示在你的个人主页</strong>，向前来咨询的家长与高中生体现你对学校与学院的了解程度。
      </p>

      <div className={styles.notice}>
        作为一名&ldquo;咨询师&rdquo;，我们需要你比较了解这个学院的某些方面，部分方面可以写&ldquo;不太了解&rdquo;，
        但是详实的回答会增加家长选择你的概率。
      </div>

      {DIMENSIONS.map((d) => {
        const cur = data[d.key];
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
            <textarea
              className={`${styles.textarea} ${errNote ? styles.inputError : ""}`}
              value={cur.note}
              maxLength={150}
              rows={3}
              onChange={(e) =>
                onChange({ [d.key]: { ...cur, note: e.target.value } } as Partial<SchoolEval>)
              }
              placeholder="你对这一方面的了解（150 字内，可写&ldquo;不太了解&rdquo;）"
            />
            <CharCounter value={cur.note} max={150} />
            {errNote && <span className={styles.errorText}>{errNote}</span>}
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
    if (d[k].note.length > 150) e[`${k}.note`] = "不能超过 150 字";
  });
  return e;
}
