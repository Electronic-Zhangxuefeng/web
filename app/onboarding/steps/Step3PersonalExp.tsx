// web/app/onboarding/steps/Step3PersonalExp.tsx
"use client";
import styles from "../onboarding.module.css";
import { ChipInput } from "../components/ChipInput";
import { CharCounter } from "../components/CharCounter";
import { CollapsibleCard } from "../components/CollapsibleCard";
import { MultiChipSelect } from "../components/MultiChipSelect";
import { PATH_OPTIONS, type PersonalExp, type PathKey } from "@/lib/intro-card-schema";

type LongField = "research" | "internship" | "competition";
const LONG_FIELDS: Record<LongField, { title: string; placeholder: string }> = {
  research: {
    title: "B3 · 科研经历",
    placeholder:
      "按「项目方向 + 你的角色 + 实际产出」简单写。有论文/专利/课题组欢迎一起写。没有就填'暂无'。",
  },
  internship: {
    title: "B4 · 实习经历",
    placeholder: "按时间倒序：公司或团队、岗位、主要做的事。不要写敏感细节。",
  },
  competition: {
    title: "B5 · 竞赛经历",
    placeholder:
      "竞赛名 + 你的角色 + 获奖等级。数学建模、互联网+、商赛、ACM、艺术体育都可以。",
  },
};

type BoolField = "zongping" | "transfer";
const BOOL_FIELDS: Record<BoolField, { title: string; question: string; followUp: string }> = {
  zongping: {
    title: "B6 · 综评经历",
    question: "你是通过综合素质评价（综评）进入这所学校的吗？",
    followUp:
      "请讲讲你的综评准备过程、考核形式（笔/面/材料）、当年难度、给学弟学妹的建议。",
  },
  transfer: {
    title: "B8 · 转专业 / 插班生经历",
    question: "你是否转过专业、或通过插班生考试进入这所学校？",
    followUp: "讲清楚：流程、难度、本校政策友好程度（接收名额/绩点要求/笔面形式）、你的体验。",
  },
};

function longStatus(v: { filled: boolean; text: string }) {
  return v.filled && v.text.trim() ? "filled" : "empty";
}
function boolStatus(v: { had: boolean; text: string }) {
  if (!v.had) return "skipped" as const;
  return v.text.trim() ? ("filled" as const) : ("empty" as const);
}
function programStatus(v: { had: boolean; name: string; text: string }) {
  if (!v.had) return "skipped" as const;
  return v.name.trim() && v.text.trim() ? ("filled" as const) : ("empty" as const);
}
function pathTextStatus(v: string) {
  return v.trim() ? "filled" : "empty";
}

export function Step3PersonalExp({
  data,
  onChange,
  errors,
}: {
  data: PersonalExp;
  onChange: (patch: Partial<PersonalExp>) => void;
  errors: Record<string, string>;
}) {
  const hasPath = (k: PathKey) => data.paths.includes(k);

  const setLong =
    (key: LongField) =>
    (patch: Partial<{ filled: boolean; text: string }>) =>
      onChange({ [key]: { ...data[key], ...patch } } as Partial<PersonalExp>);

  const setBool =
    (key: BoolField) =>
    (patch: Partial<{ had: boolean; text: string }>) =>
      onChange({ [key]: { ...data[key], ...patch } } as Partial<PersonalExp>);

  return (
    <div>
      <h1 className={styles.title}>差异化经历</h1>
      <p className={styles.subtitle}>
        以下信息将展示在<strong>你的学长主页</strong>，是家长在该校多位学长里&ldquo;为什么选你&rdquo;的关键。
        诚实最重要：&ldquo;暂无&rdquo;比注水更好。
      </p>

      {/* B1 */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>B1 · 你的主方向（必填）</label>
        <input
          className={`${styles.input} ${errors.majorMain ? styles.inputError : ""}`}
          value={data.majorMain}
          maxLength={60}
          onChange={(e) => onChange({ majorMain: e.target.value })}
          placeholder="例：集成电路设计-数字 IC 方向"
        />
        {errors.majorMain && <span className={styles.errorText}>{errors.majorMain}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>熟悉的其它专业（选填，最多 6 个）</label>
        <ChipInput
          value={data.majorOthers}
          onChange={(v) => onChange({ majorOthers: v })}
          max={6}
          maxLen={20}
          placeholder="例：电子信息工程、微电子"
        />
      </div>

      {/* B2 */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>B2 · 你当前最倾向的路径（必填，可多选）</label>
        <p className={styles.hint} style={{ marginBottom: 8 }}>
          勾选后会自动展开对应的细节问题（B9–B12）。建议不超过 2 项，否则显得不聚焦。
        </p>
        <MultiChipSelect<PathKey>
          value={data.paths}
          onChange={(v) => onChange({ paths: v })}
          options={PATH_OPTIONS}
        />
        {errors.paths && <span className={styles.errorText}>{errors.paths}</span>}
      </div>

      {/* B3–B5 折叠卡 */}
      {(Object.keys(LONG_FIELDS) as LongField[]).map((key) => {
        const meta = LONG_FIELDS[key];
        const v = data[key];
        return (
          <CollapsibleCard key={key} title={meta.title} status={longStatus(v)}>
            <textarea
              className={styles.textarea}
              value={v.text}
              maxLength={500}
              rows={4}
              placeholder={meta.placeholder}
              onChange={(e) =>
                setLong(key)({ filled: e.target.value.trim().length > 0, text: e.target.value })
              }
            />
            <CharCounter value={v.text} max={500} />
          </CollapsibleCard>
        );
      })}

      {/* B6 综评 */}
      <CollapsibleCard title={BOOL_FIELDS.zongping.title} status={boolStatus(data.zongping)}>
        <YesNoBlock
          question={BOOL_FIELDS.zongping.question}
          value={data.zongping.had}
          onChange={(had) => setBool("zongping")({ had, text: had ? data.zongping.text : "" })}
        />
        {data.zongping.had && (
          <div style={{ marginTop: 12 }}>
            <p className={styles.hint}>{BOOL_FIELDS.zongping.followUp}</p>
            <textarea
              className={styles.textarea}
              value={data.zongping.text}
              maxLength={400}
              rows={4}
              onChange={(e) => setBool("zongping")({ text: e.target.value })}
            />
            <CharCounter value={data.zongping.text} max={400} />
          </div>
        )}
        {errors.zongping && <span className={styles.errorText}>{errors.zongping}</span>}
      </CollapsibleCard>

      {/* B7 特色培养计划 */}
      <CollapsibleCard title="B7 · 特色培养计划" status={programStatus(data.program)}>
        <YesNoBlock
          question="你是否在所在学校的特色培养项目里？（实验班 / 强基 / 拔尖 / 英才 / 卓越工程师 / 中外合办项目等）"
          value={data.program.had}
          onChange={(had) =>
            onChange({
              program: had ? { ...data.program, had } : { had: false, name: "", text: "" },
            })
          }
        />
        {data.program.had && (
          <>
            <div style={{ marginTop: 12 }}>
              <label className={styles.label}>项目名称</label>
              <input
                className={styles.input}
                value={data.program.name}
                maxLength={40}
                placeholder="例：致远工科荣誉计划"
                onChange={(e) => onChange({ program: { ...data.program, name: e.target.value } })}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className={styles.label}>项目介绍</label>
              <p className={styles.hint}>
                请说明：入选门槛、真实的培养特色，以及你认为的利与弊。
              </p>
              <textarea
                className={styles.textarea}
                value={data.program.text}
                maxLength={400}
                rows={4}
                onChange={(e) => onChange({ program: { ...data.program, text: e.target.value } })}
              />
              <CharCounter value={data.program.text} max={400} />
            </div>
          </>
        )}
        {errors.program && <span className={styles.errorText}>{errors.program}</span>}
      </CollapsibleCard>

      {/* B8 转专业 / 插班生 */}
      <CollapsibleCard title={BOOL_FIELDS.transfer.title} status={boolStatus(data.transfer)}>
        <YesNoBlock
          question={BOOL_FIELDS.transfer.question}
          value={data.transfer.had}
          onChange={(had) => setBool("transfer")({ had, text: had ? data.transfer.text : "" })}
        />
        {data.transfer.had && (
          <div style={{ marginTop: 12 }}>
            <p className={styles.hint}>{BOOL_FIELDS.transfer.followUp}</p>
            <textarea
              className={styles.textarea}
              value={data.transfer.text}
              maxLength={400}
              rows={4}
              onChange={(e) => setBool("transfer")({ text: e.target.value })}
            />
            <CharCounter value={data.transfer.text} max={400} />
          </div>
        )}
        {errors.transfer && <span className={styles.errorText}>{errors.transfer}</span>}
      </CollapsibleCard>

      {/* B9–B12 条件展开 */}
      {hasPath("postgrad_domestic") && (
        <CollapsibleCard
          title="B9 · 保研 / 直博细节"
          status={pathTextStatus(data.postgradDomestic)}
          defaultOpen
        >
          <p className={styles.hint}>
            本校保研还是外保？目标方向？目前进度（夏令营/预推免/已确定接收）？
          </p>
          <textarea
            className={styles.textarea}
            value={data.postgradDomestic}
            maxLength={400}
            rows={4}
            onChange={(e) => onChange({ postgradDomestic: e.target.value })}
          />
          <CharCounter value={data.postgradDomestic} max={400} />
          {errors.postgradDomestic && (
            <span className={styles.errorText}>{errors.postgradDomestic}</span>
          )}
        </CollapsibleCard>
      )}

      {hasPath("study_abroad") && (
        <CollapsibleCard
          title="B10 · 留学细节"
          status={pathTextStatus(data.studyAbroad)}
          defaultOpen
        >
          <p className={styles.hint}>
            目标国家与项目类型（授课硕/研究硕/PhD）、目前进度、可分享的语言/科研/选校经验。
          </p>
          <textarea
            className={styles.textarea}
            value={data.studyAbroad}
            maxLength={400}
            rows={4}
            onChange={(e) => onChange({ studyAbroad: e.target.value })}
          />
          <CharCounter value={data.studyAbroad} max={400} />
          {errors.studyAbroad && <span className={styles.errorText}>{errors.studyAbroad}</span>}
        </CollapsibleCard>
      )}

      {(hasPath("kaoyan") || hasPath("civil_exam")) && (
        <CollapsibleCard
          title="B11 · 考研 / 考编 / 考公细节"
          status={pathTextStatus(data.exam)}
          defaultOpen
        >
          <p className={styles.hint}>目标院校或岗位、目前进度、可分享的备考节奏与心得。</p>
          <textarea
            className={styles.textarea}
            value={data.exam}
            maxLength={400}
            rows={4}
            onChange={(e) => onChange({ exam: e.target.value })}
          />
          <CharCounter value={data.exam} max={400} />
          {errors.exam && <span className={styles.errorText}>{errors.exam}</span>}
        </CollapsibleCard>
      )}

      {hasPath("employment") && (
        <CollapsibleCard
          title="B12 · 直接就业细节"
          status={pathTextStatus(data.employment)}
          defaultOpen
        >
          <p className={styles.hint}>
            目标行业/岗位、已拿到的 offer 类型（不必透露公司名）、对家长可分享的行业入门建议。
          </p>
          <textarea
            className={styles.textarea}
            value={data.employment}
            maxLength={400}
            rows={4}
            onChange={(e) => onChange({ employment: e.target.value })}
          />
          <CharCounter value={data.employment} max={400} />
          {errors.employment && <span className={styles.errorText}>{errors.employment}</span>}
        </CollapsibleCard>
      )}
    </div>
  );
}

function YesNoBlock({
  question,
  value,
  onChange,
}: {
  question: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 13, color: "#1f1f1f", margin: "0 0 8px" }}>{question}</p>
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
    </div>
  );
}

export function validateStep3(d: PersonalExp): Record<string, string> {
  const e: Record<string, string> = {};
  if (!d.majorMain.trim()) e.majorMain = "请填写主方向";
  if (d.paths.length === 0) e.paths = "请至少选择一项当前路径";
  if (d.zongping.had && !d.zongping.text.trim()) e.zongping = "请填写综评经历";
  if (d.program.had && (!d.program.name.trim() || !d.program.text.trim()))
    e.program = "请填写项目名称与简介";
  if (d.transfer.had && !d.transfer.text.trim()) e.transfer = "请填写转专业 / 插班生经历";
  if (d.paths.includes("postgrad_domestic") && !d.postgradDomestic.trim())
    e.postgradDomestic = "请填写保研 / 直博细节";
  if (d.paths.includes("study_abroad") && !d.studyAbroad.trim())
    e.studyAbroad = "请填写留学细节";
  if ((d.paths.includes("kaoyan") || d.paths.includes("civil_exam")) && !d.exam.trim())
    e.exam = "请填写考研 / 考公 / 考编细节";
  if (d.paths.includes("employment") && !d.employment.trim()) e.employment = "请填写就业细节";
  return e;
}
