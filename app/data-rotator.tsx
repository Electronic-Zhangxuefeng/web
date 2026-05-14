"use client";

import { useState, useEffect } from "react";
import styles from "./data-rotator.module.css";

const INSIGHTS = [
  {
    tag: "认知偏差",
    big: "54%",
    copy: "的大一新生在入学一年内反馈，所学专业的真实学习内容与高考前的认知存在显著偏差。",
    src: "中国大学生学情调查 · 2024 届 (placeholder)",
  },
  {
    tag: "转专业冲动",
    big: "39%",
    copy: "的大学新生在大一结束前认真考虑过转专业——而其中多数人在填志愿前从未与本专业在读生交谈过。",
    src: "麦可思《大学生培养质量年度报告》(placeholder)",
  },
  {
    tag: "时间窗口",
    big: "4.6 天",
    copy: "是家长在出分到提交志愿之间，平均能用于真正调研专业的时间。决策密度异常高，信息密度异常低。",
    src: "上海市教育考试院公开数据 · 2025 (placeholder)",
  },
  {
    tag: "家长盲区",
    big: "18%",
    copy: "是家长在填报前能准确描述目标专业核心课程与典型就业方向的比例——而他们正要替孩子做四年的决定。",
    src: "家长志愿决策调研 · n=2,140 (placeholder)",
  },
  {
    tag: "校友回望",
    big: "78%",
    copy: "的受访毕业生表示，“当时多问一位真正读这个专业的学长学姐”是他们最希望补上的环节。",
    src: "校友信息差访谈 · n=520 (placeholder)",
  },
  {
    tag: "价格落差",
    big: "¥20,000",
    copy: "是市面 IP 升学咨询的常见客单价——而你需要的，其实只是一个真正读过这个专业的人，花一顿饭的钱。",
    src: "公开渠道整理 · 2025 (placeholder)",
  },
];

export default function DataRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % INSIGHTS.length), 4800);
    return () => clearInterval(t);
  }, [paused]);

  const cur = INSIGHTS[i];

  return (
    <div
      className={styles.rotator}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.topLabel}>
        <div className={styles.topLabelLeft}>
          <span className={styles.pulseDot} />
          <span>信息差研究 · DATA SHEET</span>
          <span className={styles.dash}>—</span>
          <span className={styles.tagName}>{cur.tag}</span>
        </div>
        <div className={styles.counter}>
          {String(i + 1).padStart(2, "0")}{" "}
          <span className={styles.counterTotal}>
            / {String(INSIGHTS.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div key={i} className={styles.content}>
        <div className={styles.bigNumber}>{cur.big}</div>
        <div className={styles.copyWrap}>
          <div className={styles.copy}>{cur.copy}</div>
          <div className={styles.source}>来源：{cur.src}</div>
        </div>
      </div>

      <div className={styles.dots}>
        {INSIGHTS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={styles.dotBtn}
            aria-label={`数据 ${idx + 1}: ${s.tag}`}
          >
            <span
              className={`${styles.dot} ${idx === i ? styles.dotActive : ""}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
