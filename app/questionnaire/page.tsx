"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import styles from "./page.module.css";

const STORAGE_KEY = "wjzl_questionnaire";

// ─── Schema ─────────────────────────────────────────────────────────────────

type QuestionType = "radio" | "checkbox" | "text" | "textarea";

interface Question {
  id: string;
  type: QuestionType;
  q: string;
  required?: boolean;
  opts?: string[];
  placeholder?: string;
  hint?: string;
  max?: number;
  rows?: number;
}

interface Step {
  title: string;
  sub: string;
  qs: Question[];
}

const STEPS: Step[] = [
  {
    title: "关于你",
    sub: "先简单聊聊你的情况，我们会按这个去找最对口的人。",
    qs: [
      {
        id: "role",
        type: "radio",
        q: "你是？",
        required: true,
        opts: ["学生本人", "家长", "老师", "其他"],
      },
      {
        id: "province",
        type: "radio",
        q: "高考地区？",
        required: true,
        opts: ["上海", "非上海"],
      },
      {
        id: "stage",
        type: "radio",
        q: "你处在哪个阶段？",
        required: true,
        opts: ["高三 · 出分前", "高三 · 出分后", "高一 / 高二", "复读", "其他"],
      },
    ],
  },
  {
    title: "你想问什么",
    sub: "方向越具体，我们能给你的候选越对口。",
    qs: [
      {
        id: "major",
        type: "checkbox",
        q: "意向专业类别？",
        required: true,
        hint: "可多选",
        max: 3,
        opts: [
          "工学，如计算机、电子信息、土木、机械、交通工程等",
          "理学，如数学、物理、化学、生物等",
          "文学，如汉语言文学、英语、新闻传播等",
          "商学，如经济学、金融学、财政学等",
          "管理学，如工商管理、公共管理、会计、信息管理等",
          "法学",
          "医学",
          "艺术学",
          "教育学",
          "农学",
          "其他",
        ],
      },
      {
        id: "focus",
        type: "checkbox",
        q: "最关心哪些维度？",
        required: true,
        hint: "至少选 1 项，建议不超过 3 项",
        max: 3,
        opts: [
          "真实学习负担",
          "就业前景",
          "保研机会",
          "出国去向",
          "转专业难度",
          "师资氛围",
          "生活体验",
          "男女比例",
          "学费 / 奖学金",
          "课外活动",
        ],
      },
      {
        id: "tilt",
        type: "radio",
        q: "总体上更偏哪个方向？",
        required: true,
        opts: ["偏就业向", "偏学术向 / 保研", "偏出国向", "偏体验感", "自己也还没想好"],
      },
    ],
  },
  {
    title: "还有什么想说的",
    sub: "完成问卷后，我们 24 小时内给你 3–5 位对口在读生。",
    qs: [
      {
        id: "note",
        type: "textarea",
        q: "还有什么想多说一句的？",
        placeholder: "比如：我特别在意 XX 专业的就业方向 / 希望对方有 XX 经历……",
        hint: "选填",
        rows: 5,
      },
    ],
  },
];

const FAKE_MATCHES = [
  {
    initial: "陈",
    name: "陈学姐",
    school: "上海交通大学 · 电子信息与电气工程学院",
    year: "大三在读",
    bio: "密院方向，大一进来时也纠结过转专业。现在保研本校直博，对就业和保研都比较了解，擅长帮你理清方向。",
    tags: ["保研经验", "转专业经历", "密院生活"],
    rating: 4.9,
    reviews: 23,
  },
  {
    initial: "林",
    name: "林学长",
    school: "复旦大学 · 中国语言文学系",
    year: "大四在读",
    bio: "高考完全不知道中文系在学什么就填了。现在回头看觉得选对了，但过程中踩了不少坑，愿意分享真实体验。",
    tags: ["文科视角", "综评面试", "就业去向"],
    rating: 4.8,
    reviews: 17,
  },
  {
    initial: "王",
    name: "王学姐",
    school: "同济大学 · 建筑与城市规划学院",
    year: "研一在读",
    bio: "本科同济建筑，现在读研。对建筑学的课程强度、设计课压力、出国申请都有一手经验。",
    tags: ["建筑学", "出国申请", "课程压力"],
    rating: 5.0,
    reviews: 31,
  },
  {
    initial: "张",
    name: "张学长",
    school: "上海交通大学 · 安泰经济与管理学院",
    year: "大三在读",
    bio: "从工科转到经管的过来人。了解转专业流程、经管类就业实习节奏，也能聊聊工科和商科的体感差异。",
    tags: ["转专业", "实习经验", "经管方向"],
    rating: 4.7,
    reviews: 12,
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function RadioQ({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.optionsWrap}>
      {q.opts!.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`${styles.pill} ${value === opt ? styles.pillSelected : ""}`}
          onClick={() => onChange(opt)}
        >
          <span
            className={`${styles.radioCircle} ${value === opt ? styles.radioCircleSelected : ""}`}
          >
            {value === opt && <span className={styles.radioDot} />}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

function CheckboxQ({
  q,
  value = [],
  onChange,
}: {
  q: Question;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const max = q.max || Infinity;
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else if (value.length < max) onChange([...value, opt]);
  };
  return (
    <div className={styles.optionsWrap}>
      {q.opts!.map((opt) => {
        const sel = value.includes(opt);
        const disabled = !sel && value.length >= max;
        return (
          <button
            key={opt}
            type="button"
            className={`${styles.pill} ${sel ? styles.pillSelected : ""}`}
            onClick={() => toggle(opt)}
            disabled={disabled}
          >
            <span
              className={`${styles.checkboxSquare} ${sel ? styles.checkboxSquareSelected : ""}`}
            >
              {sel && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5.5 L4 8 L9 2"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TextQ({
  q,
  value = "",
  onChange,
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      className={styles.textInput}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder}
    />
  );
}

function TextareaQ({
  q,
  value = "",
  onChange,
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className={styles.textArea}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder}
      rows={q.rows || 4}
    />
  );
}

function QuestionBlock({
  q,
  value,
  onChange,
  error,
  index,
}: {
  q: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  index: number;
}) {
  return (
    <div className={styles.question}>
      <div className={styles.questionHeader}>
        <div className={styles.questionNum}>
          Q{String(index + 1).padStart(2, "0")}
        </div>
        <div style={{ flex: 1 }}>
          <div className={styles.questionText}>
            {q.q}
            {q.required && <span className={styles.required}>*</span>}
          </div>
          {q.hint && <div className={styles.questionHint}>{q.hint}</div>}
        </div>
      </div>

      <div className={styles.answerArea}>
        {q.type === "radio" && (
          <RadioQ q={q} value={value as string} onChange={onChange as (v: string) => void} />
        )}
        {q.type === "checkbox" && (
          <CheckboxQ
            q={q}
            value={(value as string[]) || []}
            onChange={onChange as (v: string[]) => void}
          />
        )}
        {q.type === "text" && (
          <TextQ q={q} value={value as string} onChange={onChange as (v: string) => void} />
        )}
        {q.type === "textarea" && (
          <TextareaQ q={q} value={value as string} onChange={onChange as (v: string) => void} />
        )}
      </div>

      {error && (
        <div className={styles.errorMsg}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <div className={styles.progressBar}>
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={i} style={{ display: "contents" }}>
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${
                  done
                    ? styles.stepCircleDone
                    : active
                      ? styles.stepCircleActive
                      : styles.stepCircleFuture
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7 L6 11 L12 3"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className={styles.stepLabel}>
                <div
                  className={`${styles.stepTitle} ${
                    done || active ? styles.stepTitleActive : styles.stepTitleFaded
                  }`}
                >
                  {s.title}
                </div>
                <div className={styles.stepTag}>STEP {String(i + 1).padStart(2, "0")}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${done ? styles.stepLineDone : styles.stepLinePending}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MatchResults() {
  return (
    <div className={styles.matchWrap}>
      <div className={styles.matchHeader}>
        <div className={styles.matchEyebrow}>Match complete</div>
        <h2 className={styles.matchTitle}>为你找到了 {FAKE_MATCHES.length} 位对口学长学姐</h2>
        <p className={styles.matchSub}>
          以下是基于你的问卷匹配到的在读生，注册后即可查看完整资料并发起咨询。
        </p>
      </div>

      <div className={styles.matchGrid}>
        {FAKE_MATCHES.map((m, i) => (
          <div
            key={m.name}
            className={`${styles.matchCard} ${i >= 2 ? styles.matchBlur : ""}`}
            style={i >= 2 ? { filter: "blur(3px)", userSelect: "none" } : undefined}
          >
            <div className={styles.matchAvatar}>{m.initial}</div>
            <div className={styles.matchInfo}>
              <div className={styles.matchName}>{m.name}</div>
              <div className={styles.matchSchool}>
                {m.school} · {m.year}
              </div>
              <div className={styles.matchBio}>{m.bio}</div>
              <div className={styles.matchTags}>
                {m.tags.map((t) => (
                  <span key={t} className={styles.matchTag}>
                    {t}
                  </span>
                ))}
              </div>
              <div className={styles.matchRating}>
                <span className={styles.matchStar}>★</span>
                {m.rating}
                <span>·</span>
                <span>{m.reviews} 次咨询</span>
              </div>
            </div>
          </div>
        ))}

        <div className={styles.matchLockOverlay}>
          <div className={styles.matchLock}>
            <div className={styles.matchLockIcon}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8" width="12" height="8" rx="2" fill="#ffffff" />
                <path
                  d="M6 8V5a3 3 0 0 1 6 0v3"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className={styles.matchLockText}>注册后查看全部匹配结果</div>
          </div>
        </div>
      </div>

      <div className={styles.matchCta}>
        <h3 className={styles.matchCtaTitle}>注册解锁全部匹配</h3>
        <p className={styles.matchCtaSub}>
          免费注册，查看完整学长学姐资料、历史评价，选择你最想聊的那位。
        </p>
        <Link className={styles.matchCtaBtn} href={`/auth?redirect=${encodeURIComponent("/questionnaire?results=1")}`}>
          注册 / 登录 <span>→</span>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function QuestionnaireInner() {
  const searchParams = useSearchParams();
  const showResults = searchParams.get("results") === "1";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers(parsed);
          if (showResults) setSubmitted(true);
        }
      } catch {}
    }, 0);

    return () => window.clearTimeout(timer);
  }, [showResults]);

  const cur = STEPS[step];

  const setAnswer = (id: string, v: unknown) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    cur.qs.forEach((q) => {
      if (!q.required) return;
      const v = answers[q.id];
      if (q.type === "checkbox") {
        if (!v || (v as string[]).length === 0) e[q.id] = "请至少选择一项";
      } else if (q.type === "text" || q.type === "textarea") {
        if (!v || !(v as string).trim()) e[q.id] = "这一栏需要填一下";
        if (
          q.id === "contact" &&
          v &&
          !/(@.+\..+|\d{6,})/.test((v as string).trim())
        ) {
          e[q.id] = "看起来不太像邮箱或手机号，再确认一下？";
        }
      } else {
        if (!v) e[q.id] = "请选择一项";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch {}
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalQs = STEPS.reduce((n, s) => n + s.qs.length, 0);
  const answeredQs = STEPS.flatMap((s) => s.qs).filter((q) => {
    const v = answers[q.id];
    if (Array.isArray(v)) return v.length > 0;
    return v != null && (typeof v !== "string" || v.trim() !== "");
  }).length;

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoMark}>
            <div className={styles.logoChar}>津</div>
          </div>
          <div className={styles.logoTextWrap}>
            <div className={styles.logoName}>问津 · 指路</div>
            <div className={styles.logoSub}>INTAKE FORM</div>
          </div>
        </Link>
        <Link href="/" className={styles.backLink}>
          <span>←</span> 返回首页
        </Link>
      </header>

      {submitted ? (
        <MatchResults />
      ) : (
        <>
          {/* Progress */}
          <div className={styles.progressWrap}>
            <StepProgress step={step} />
          </div>

          {/* Form */}
          <main className={styles.formWrap}>
            <div className={styles.formCard} key={step}>
              <div className={styles.formStep}>
                第 {step + 1} 节 / {STEPS.length}
              </div>
              <h2 className={styles.formTitle}>{cur.title}</h2>
              <p className={styles.formSub}>{cur.sub}</p>

              <div className={styles.questions}>
                {cur.qs.map((q, i) => {
                  const absIdx =
                    STEPS.slice(0, step).reduce((n, s) => n + s.qs.length, 0) + i;
                  return (
                    <QuestionBlock
                      key={q.id}
                      q={q}
                      index={absIdx}
                      value={answers[q.id]}
                      error={errors[q.id]}
                      onChange={(v) => setAnswer(q.id, v)}
                    />
                  );
                })}
              </div>

              <div className={styles.navRow}>
                <button
                  className={styles.backBtn}
                  onClick={back}
                  disabled={step === 0}
                >
                  <span>←</span> 上一步
                </button>

                <div className={styles.progressCount}>
                  已答 {answeredQs} / {totalQs}
                </div>

                <button className={styles.nextBtn} onClick={next}>
                  {step === STEPS.length - 1 ? "提交问卷" : "下一步"}
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className={styles.reassurance}>
              {[
                "2 分钟左右就能填完",
                "不需要注册账号",
                "看到匹配再决定要不要付费",
                "不会被推送 / 不会公开",
              ].map((x) => (
                <div key={x} className={styles.reassuranceItem}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6.5 L5 9 L10 3"
                      stroke="#b8472d"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {x}
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense>
      <QuestionnaireInner />
    </Suspense>
  );
}
