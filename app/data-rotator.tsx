"use client";

import { useState, useEffect } from "react";
import styles from "./data-rotator.module.css";

const CCTV_2023 =
  "https://news.cctv.com/2023/06/30/ARTIqh7k2paDY6FGhERPosHV230630.shtml";
const CCTV_2024 =
  "https://news.cctv.com/2024/07/02/ARTII8DoXRNvwwt6D2Upi6lO240702.shtml";
const THEPAPER =
  "https://www.thepaper.cn/newsDetail_forward_1429824";
const YOUTH_CN =
  "https://edu.youth.cn/wzlb/202110/t20211019_13268478.htm";
const PEOPLE_CN =
  "http://edu.people.com.cn/n1/2016/0920/c1053-28725477.html";

const INSIGHTS = [
  {
    tag: "如果重来",
    big: "72%",
    copy: "的人表示如果可以重来，想重新选择专业。填志愿时那几天的信息差，变成了四年的代价。",
    src: "澎湃新闻 · 高考志愿填报调查",
    url: THEPAPER,
  },
  {
    tag: "转专业冲动",
    big: "79%",
    copy: "的受访者大学时想过转专业——其中 60.2% 是因为感觉本专业发展前景不好。问题的根源，在入学前。",
    src: "中国青年报 · 2,002 人社会调查 (2016)",
    url: PEOPLE_CN,
  },
  {
    tag: "不满意率",
    big: "50.8%",
    copy: "的大学生对所学专业满意度为“一般”或“不满意”。其中 46% 反馈学习内容与入学前的想象不一致。",
    src: "中国青年网 · 10,545 名大学生问卷调查 (2021)",
    url: YOUTH_CN,
  },
  {
    tag: "填报迷茫",
    big: "79.5%",
    copy: "的学生在填报志愿时感到迷茫。主因是对自己的喜好和特长不明确 (65.8%)，以及对专业了解有限 (55.4%)。",
    src: "央视新闻 · 162 所高校 2,048 份问卷 (2023)",
    url: CCTV_2023,
  },
  {
    tag: "价格乱象",
    big: "¥20,000",
    copy: "是市面 IP 升学咨询的常见报价。央视调查显示志愿填报付费市场已接近 10 亿元——而你需要的，只是一个真正读过这个专业的人。",
    src: "央视新闻 · 2024 高考志愿填报市场调查",
    url: CCTV_2024,
  },
];

export default function DataRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % INSIGHTS.length), 3500);
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
          <span>{"信息差研究 · DATA SHEET"}</span>
          <span className={styles.dash}>{"—"}</span>
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
          <div className={styles.source}>
            {"来源："}
            <a href={cur.url} target="_blank" rel="noopener noreferrer">
              {cur.src} {"↗"}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.dots}>
        {INSIGHTS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={styles.dotBtn}
            aria-label={"数据 " + (idx + 1) + ": " + s.tag}
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
