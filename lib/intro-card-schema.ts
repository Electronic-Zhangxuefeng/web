// web/lib/intro-card-schema.ts
import { z } from "zod";

// 学校评价维度 keys
export const SCHOOL_EVAL_DIMENSIONS = [
  "career",
  "teaching",
  "life",
  "care",
  "practice",
] as const;
export type SchoolEvalDimension = (typeof SCHOOL_EVAL_DIMENSIONS)[number];

// B2 主路径枚举
export const PATH_OPTIONS = [
  { key: "postgrad_domestic", label: "保研 / 直博" },
  { key: "study_abroad", label: "出国留学" },
  { key: "kaoyan", label: "国内考研" },
  { key: "employment", label: "直接就业" },
  { key: "civil_exam", label: "考公 / 考编" },
  { key: "gap_other", label: "Gap / 其它" },
] as const;
export type PathKey = (typeof PATH_OPTIONS)[number]["key"];

export const YEAR_OPTIONS = [
  "大一", "大二", "大三", "大四",
  "研一", "研二", "研三",
  "博士在读", "毕业 1 年内",
] as const;

const dimensionSchema = z.object({
  score: z.number().int().min(0).max(5).default(0), // 历史字段，保留以兼容旧数据
  note: z.string().max(150).default(""),
});

export const schoolEvalSchema = z.object({
  career: dimensionSchema,
  teaching: dimensionSchema,
  life: dimensionSchema,
  care: dimensionSchema,
  practice: dimensionSchema,
  pros: z.string().max(300).default(""),
  cons: z.string().max(300).default(""),
});
export type SchoolEval = z.infer<typeof schoolEvalSchema>;

const longText = (max: number) =>
  z.object({
    filled: z.boolean().default(false),
    text: z.string().max(max).default(""),
  });

const boolWithText = (max: number) =>
  z.object({
    had: z.boolean().default(false),
    text: z.string().max(max).default(""),
  });

export const personalExpSchema = z.object({
  majorMain: z.string().max(60).default(""),
  majorOthers: z.array(z.string().max(20)).max(6).default([]),
  paths: z.array(z.enum(PATH_OPTIONS.map((p) => p.key) as [PathKey, ...PathKey[]])).default([]),
  research: longText(500),
  internship: longText(500),
  competition: longText(500),
  zongping: boolWithText(400),
  program: z.object({
    had: z.boolean().default(false),
    name: z.string().max(40).default(""),
    text: z.string().max(400).default(""),
  }),
  transfer: boolWithText(400),
  postgradDomestic: z.string().max(400).default(""),
  studyAbroad: z.string().max(400).default(""),
  exam: z.string().max(400).default(""),
  employment: z.string().max(400).default(""),
});
export type PersonalExp = z.infer<typeof personalExpSchema>;

export const introCardSchema = z.object({
  _lastStep: z.number().int().min(0).max(3).default(0),
  displayInitial: z.string().max(2).default(""),
  schoolEval: schoolEvalSchema,
  personalExp: personalExpSchema,
});
export type IntroCard = z.infer<typeof introCardSchema>;

export function defaultIntroCard(): IntroCard {
  return introCardSchema.parse({
    _lastStep: 0,
    displayInitial: "",
    schoolEval: {
      career: { score: 0, note: "" },
      teaching: { score: 0, note: "" },
      life: { score: 0, note: "" },
      care: { score: 0, note: "" },
      practice: { score: 0, note: "" },
      pros: "",
      cons: "",
    },
    personalExp: {
      majorMain: "",
      majorOthers: [],
      paths: [],
      research: { filled: false, text: "" },
      internship: { filled: false, text: "" },
      competition: { filled: false, text: "" },
      zongping: { had: false, text: "" },
      program: { had: false, name: "", text: "" },
      transfer: { had: false, text: "" },
      postgradDomestic: "",
      studyAbroad: "",
      exam: "",
      employment: "",
    },
  });
}

/**
 * 把后端返回的旧 / 不完整 introCard 合并成新的完整结构。
 * 旧字段（whyMajor 等）会被自然丢弃。
 */
export function mergeIntroCard(raw: unknown): IntroCard {
  const base = defaultIntroCard();
  if (!raw || typeof raw !== "object") return base;
  const result = introCardSchema.safeParse(raw);
  if (result.success) return result.data;
  // Partial merge: re-parse each subtree so zod fills missing defaults.
  const r = raw as Record<string, unknown>;
  const schoolEvalParsed = schoolEvalSchema.safeParse(r.schoolEval);
  const personalExpParsed = personalExpSchema.safeParse(r.personalExp);
  return {
    _lastStep:
      typeof r._lastStep === "number" && r._lastStep >= 0 && r._lastStep <= 3
        ? r._lastStep
        : 0,
    displayInitial:
      typeof r.displayInitial === "string" ? r.displayInitial.slice(0, 2) : "",
    schoolEval: schoolEvalParsed.success ? schoolEvalParsed.data : base.schoolEval,
    personalExp: personalExpParsed.success ? personalExpParsed.data : base.personalExp,
  };
}
