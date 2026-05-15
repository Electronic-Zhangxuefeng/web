import Link from "next/link";
import styles from "./page.module.css";
import DataRotator from "./data-rotator";

const SCHOOLS = [
  { abbr: "SJTU", name: "上海交通大学", count: "142" },
  { abbr: "FUDAN", name: "复旦大学", count: "128" },
  { abbr: "TONGJI", name: "同济大学", count: "87" },
  { abbr: "ECNU", name: "华东师范大学", count: "64" },
  { abbr: "SUFE", name: "上海财经大学", count: "41" },
  { abbr: "SISU", name: "上海外国语大学", count: "28" },
  { abbr: "THU", name: "清华大学", count: "53" },
  { abbr: "PKU", name: "北京大学", count: "48" },
  { abbr: "RUC", name: "中国人民大学", count: "22" },
];

const STEPS = [
  {
    title: "填问卷",
    desc: "告诉我们目标院校、专业、最关心的维度——就业、保研、出国、转专业、生活体验……",
  },
  {
    title: "看匹配",
    desc: "平台呈现 3–5 位对口在读生,看他们的简介与历史评价,挑你看得顺眼的人。",
  },
  {
    title: "下单沟通",
    desc: "站内担保支付,站内视频/文字沟通工具——全程无需加任何微信。",
  },
  {
    title: "双向评价",
    desc: "完成咨询后才结算,双方互相打分,沉淀一个能被反复信任的网络。",
  },
];

const REASONS = [
  {
    title: "对口在读",
    desc: "密院学长讲密院,复旦中文讲中文。不是一个人讲所有专业的“通才独白”,而是 10,000 个对口在读生服务 1,000,000 个家庭。",
  },
  {
    title: "平台担保",
    desc: "咨询完成 + 双向打分后才结算给学长学姐。参考闲鱼、Airbnb 的担保账户模式——质量、隐私、售后,平台一体兜底。",
  },
  {
    title: "全程匿名",
    desc: "站内沟通工具,无需加任何微信。学长学姐与家长之间不互留联系方式,隐私从首单到结案。",
  },
  {
    title: "普惠定价",
    desc: "¥30 起。相对于市面 ¥20,000 一次的 IP 咨询,几乎是一杯奶茶 + 一顿便饭的距离。",
  },
];

function Squiggle() {
  return (
    <svg
      width="100%"
      height="14"
      viewBox="0 0 320 14"
      preserveAspectRatio="none"
      style={{ display: "block", marginTop: -4 }}
    >
      <path
        d="M2 8 Q 40 2, 80 7 T 160 7 T 240 7 T 318 7"
        stroke="var(--amber)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReasonIcon({ index }: { index: number }) {
  const amber = "var(--amber)";
  const brown = "var(--brown)";
  const icons = [
    <svg key="target" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" stroke={amber} strokeWidth="2.5" />
      <circle cx="16" cy="16" r="5" fill={amber} />
      <path
        d="M22 10 L28 4 M28 4 L24 4 M28 4 L28 8"
        stroke={brown}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>,
    <svg key="shield" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3 L26 7 V16 C26 22 22 26 16 29 C10 26 6 22 6 16 V7 L16 3 Z"
        fill={amber}
      />
      <path
        d="M11 16 L15 20 L22 12"
        stroke={brown}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
    <svg key="eye" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M3 16 C7 10 11 8 16 8 C21 8 25 10 29 16 C25 22 21 24 16 24 C11 24 7 22 3 16 Z"
        fill="none"
        stroke={amber}
        strokeWidth="2.5"
      />
      <circle cx="16" cy="16" r="3.5" fill={brown} />
      <path
        d="M5 5 L27 27"
        stroke={amber}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>,
    <svg key="coin" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" fill={amber} />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="18"
        fontWeight="700"
        fill={brown}
      >
        ¥
      </text>
    </svg>,
  ];
  return icons[index] ?? null;
}

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── Nav ── */}
      <header className={styles.nav}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>
            <div className={styles.logoChar}>津</div>
          </div>
          <div className={styles.logoText}>
            <div className={styles.logoName}>问津 · 指路</div>
            <div className={styles.logoSub}>读过这条路的人 · 在等你来问</div>
          </div>
        </div>
        <nav className={styles.navLinks}>
          <a href="#how">如何参与</a>
          <a href="#why">为什么选择我们</a>
          <a href="#about">关于</a>
          <Link href="/auth?mode=login">登录</Link>
          <Link className={styles.navBtn} href="/questionnaire">
            立刻开始 →
          </Link>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowBadge}>NEW</span>
              <span className={styles.eyebrowText}>
                首批 200 位对口在读生 · 6 月 9 日 17:00 正式上线
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              找个{" "}
              <span className={styles.squiggleWrap}>
                过来人
                <div className={styles.squiggle}>
                  <Squiggle />
                </div>
              </span>
              ，
              <br />
              问个明白。
            </h1>

            <p className={styles.heroSub}>
              匹配履历相近的学长学姐，花一顿饭钱，让 TA 为你深度解答
              <br />
              专业志愿、综评面试、大学生涯规划的种种疑惑。
            </p>

            <div className={styles.heroCta}>
              <Link className={styles.btnPrimary} href="/questionnaire">
                填一份意向问卷 <span style={{ fontSize: 20 }}>→</span>
              </Link>
              <button className={styles.btnSecondary}>看一段示例对话</button>
            </div>

            <div className={styles.heroMeta}>
              2 分钟 · 不需要注册 · 看到匹配再决定要不要付费
            </div>
          </div>

          <DataRotator />
        </section>

        {/* ── School Strip ── */}
        <section className={styles.schools}>
          <div className={styles.schoolsLabel}>首 批 覆 盖 院 校</div>
          <div className={styles.schoolGrid}>
            {SCHOOLS.map((s) => (
              <div key={s.abbr} className={styles.schoolChip}>
                <div className={styles.schoolAbbr}>{s.abbr}</div>
                <span className={styles.schoolName}>{s.name}</span>
                <span className={styles.schoolDot} />
                <span className={styles.schoolCount}>{s.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className={styles.howSection} id="how">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>How it works</div>
            <h2 className={styles.sectionTitle}>
              从一个问题，到一通真实对话
            </h2>
            <p className={styles.sectionSub}>
              四步走完。中间不需要加任何微信、不需要先付钱——你看到匹配的人，再决定要不要往下走。
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepsLine} />
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.stepCard}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why us ── */}
        <section className={styles.reasons} id="why">
          <div className={styles.reasonsHeader}>
            <div className={styles.reasonsEyebrow}>Why us</div>
            <h2 className={styles.reasonsTitle}>为什么选择问津</h2>
          </div>
          <div className={styles.reasonsGrid}>
            {REASONS.map((r, i) => (
              <div key={r.title} className={styles.reasonCard}>
                <div className={styles.reasonIcon}>
                  <ReasonIcon index={i} />
                </div>
                <div>
                  <div className={styles.reasonTitle}>{r.title}</div>
                  <div className={styles.reasonDesc}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaEyebrow}>Ready?</div>
          <h2 className={styles.finalCtaTitle}>
            你正在纠结的路，
            <br />
            有人{" "}
            <span className={styles.highlight}>
              曾走过
              <div className={styles.highlightBar} />
            </span>
            。
          </h2>
          <Link className={styles.finalCtaBtn} href="/questionnaire">
            填一份意向问卷 →
          </Link>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogoWrap}>
              <div className={styles.footerLogoMark}>
                <div className={styles.footerLogoChar}>津</div>
              </div>
              <div>
                <div className={styles.footerLogoName}>问津 · 指路</div>
                <div className={styles.footerLogoSub}>
                  读过这条路的人 · 在等你来问
                </div>
              </div>
            </div>
            <p className={styles.footerDesc}>
              对口学长学姐 · 升学专业咨询
              <br />
              ¥30 起 · 平台担保 · 全程匿名
            </p>
          </div>

          <div className={styles.footerQr}>
            <div className={styles.footerQrItem}>
              <div className={styles.footerQrPlaceholder}>QR</div>
              <div className={styles.footerQrLabel}>微信公众号</div>
            </div>
            <div className={styles.footerQrItem}>
              <div className={styles.footerQrPlaceholder}>QR</div>
              <div className={styles.footerQrLabel}>小红书</div>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <a href="#about" id="about">
              关于我们
            </a>
            <a href="/auth?role=mentor">成为学长学姐</a>
            <a href="#faq">常见问题</a>
            <a href="/privacy">隐私协议</a>
            <a href="/terms">用户协议</a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>© 2026 问津 · 指路</div>
          <div className={styles.footerSlogan}>
            — 在他们读过的路上，问一次清楚 —
          </div>
        </div>
      </footer>
    </div>
  );
}
