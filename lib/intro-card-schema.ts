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

const boolWithText = (max: number) =>
  z.object({
    had: z.boolean().default(false),
    text: z.string().max(max).default(""),
  });

// 一句话简介统一字数上限
export const ONE_LINER_MAX = 120;
export const SUPPLEMENT_MAX = 200;

export const personalExpSchema = z.object({
  paths: z.array(z.enum(PATH_OPTIONS.map((p) => p.key) as [PathKey, ...PathKey[]])).default([]),
  research: boolWithText(ONE_LINER_MAX),
  internship: boolWithText(ONE_LINER_MAX),
  competition: boolWithText(ONE_LINER_MAX),
  zongping: boolWithText(ONE_LINER_MAX),
  program: boolWithText(ONE_LINER_MAX),
  transfer: boolWithText(ONE_LINER_MAX),
  supplement: z.string().max(SUPPLEMENT_MAX).default(""),
});
export type PersonalExp = z.infer<typeof personalExpSchema>;

export const DISPLAY_TITLE_OPTIONS = ["学姐", "学长"] as const;
export type DisplayTitle = (typeof DISPLAY_TITLE_OPTIONS)[number];

export const introCardSchema = z.object({
  _lastStep: z.number().int().min(0).max(3).default(0),
  displayInitial: z.string().max(2).default(""),
  displayTitle: z.enum(["", ...DISPLAY_TITLE_OPTIONS]).default(""),
  schoolEval: schoolEvalSchema,
  personalExp: personalExpSchema,
});
export type IntroCard = z.infer<typeof introCardSchema>;

export function defaultIntroCard(): IntroCard {
  return introCardSchema.parse({
    _lastStep: 0,
    displayInitial: "",
    displayTitle: "",
    schoolEval: {
      career: { note: "" },
      teaching: { note: "" },
      life: { note: "" },
      care: { note: "" },
      practice: { note: "" },
      pros: "",
      cons: "",
    },
    personalExp: {
      paths: [],
      research: { had: false, text: "" },
      internship: { had: false, text: "" },
      competition: { had: false, text: "" },
      zongping: { had: false, text: "" },
      program: { had: false, text: "" },
      transfer: { had: false, text: "" },
      supplement: "",
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
    displayTitle:
      r.displayTitle === "学姐" || r.displayTitle === "学长" ? r.displayTitle : "",
    schoolEval: schoolEvalParsed.success ? schoolEvalParsed.data : base.schoolEval,
    personalExp: personalExpParsed.success ? personalExpParsed.data : base.personalExp,
  };
}
