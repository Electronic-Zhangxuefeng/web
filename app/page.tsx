import Link from "next/link";
import styles from "./page.module.css";

const STATS = [
  {
    big: "79.5%",
    copy: "学生在填报志愿时感到迷茫。主因是对自己喜好不明确、对专业了解有限。",
    src: "央视新闻 · 162 所高校 2,048 份问卷 (2023)",
  },
  {
    big: "79%",
    copy: "受访大学生曾想过转专业。其中 60% 是因为本专业发展前景不及预期——而这本可以在填报前就问清楚。",
    src: "中国青年报 · 2,002 人调查 (2016)",
  },
  {
    big: "¥20,000",
    copy: "是市面 IP 升学咨询的常见报价。央视调查显示志愿填报付费市场已接近 10 亿元。",
    src: "央视新闻 · 2024 高考志愿填报市场调查",
  },
];

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
    num: "01",
    title: "填问卷",
    desc: "告诉我们目标院校、专业、最关心的维度——就业、保研、出国、转专业、生活体验……",
  },
  {
    num: "02",
    title: "看匹配",
    desc: "平台呈现 3–5 位对口在读生，看他们的简介与历史评价，挑你看得顺眼的人。",
  },
  {
    num: "03",
    title: "下单沟通",
    desc: "站内担保支付，站内视频/文字沟通——全程无需加任何微信。",
  },
  {
    num: "04",
    title: "双向评价",
    desc: "完成咨询后才结算。双方互相打分，沉淀一个能被反复信任的网络。",
  },
];

const REASONS = [
  {
    icon: "对",
    title: "对口在读",
    desc: "密院学长讲密院，复旦中文讲中文。不是一个人讲所有专业的「通才独白」，而是上万对口在读生服务上百万家庭。",
  },
  {
    icon: "担",
    title: "平台担保",
    desc: "咨询完成 + 双向打分后才结算给学长学姐。参考闲鱼、Airbnb 的担保账户模式——质量、隐私、售后，平台一体兜底。",
  },
  {
    icon: "匿",
    title: "全程匿名",
    desc: "站内沟通工具，无需加任何微信。学长学姐与家长之间不互留联系方式，隐私从首单到结案。",
  },
  {
    icon: "普",
    title: "普惠定价",
    desc: "相对于市面 ¥20,000 一次的 IP 咨询，几乎是一杯奶茶 + 一顿便饭的距离。",
  },
];

export default function Home() {
  return (
    <div className={styles.shell}>
      <header className={styles.nav}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>津</div>
          <span className={styles.brandText}>问津</span>
          <span className={styles.brandSub}>FOR FAMILIES</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#why">为什么选我们</a>
          <a href="#how">如何参与</a>
          <a href="#about">关于</a>
          <Link href="/auth?mode=login">登录</Link>
          <Link href="/questionnaire" className={styles.navBtn}>
            立刻开始
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span>首批 200 位对口在读生 · 6 月 9 日 17:00 上线</span>
            </div>
            <h1 className={styles.heroTitle}>
              找个<span className={styles.heroAccent}>过来人</span>，
              <br />
              问个明白。
            </h1>
            <p className={styles.heroSub}>
              匹配履历相近的学长学姐，花一顿饭钱，让 TA 为你深度解答
              <br />
              专业志愿、综评面试、大学生涯规划的种种疑惑。
            </p>
            <div className={styles.heroCta}>
              <Link href="/questionnaire" className={styles.btnPrimary}>
                填一份意向问卷 <span>→</span>
              </Link>
              <a href="#how" className={styles.btnGhost}>
                看看流程
              </a>
            </div>
            <div className={styles.heroMeta}>2 分钟 · 不需要注册 · 看到匹配再决定要不要付费</div>
          </div>
        </section>

        {/* Why this matters */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionEyebrow}>Why it matters</div>
              <h2 className={styles.sectionTitle}>填志愿这件事，本不该这么难</h2>
              <p className={styles.sectionSub}>
                每年都有几十万家庭在专业选择上花掉数万元中介费，得到的却是脱离一线的「通才」建议。
                你需要的，是一个真正读过这条路的人。
              </p>
            </div>
            <div className={styles.statGrid}>
              {STATS.map((s) => (
                <div key={s.big} className={styles.statCard}>
                  <div className={styles.statBig}>{s.big}</div>
                  <div className={styles.statCopy}>{s.copy}</div>
                  <div className={styles.statSrc}>{s.src}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* School strip */}
        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeadCenter}>
              <div className={styles.sectionEyebrow}>Coverage</div>
              <h2 className={styles.sectionTitle}>首批覆盖院校</h2>
              <p className={styles.sectionSub}>
                持续扩展。每所院校配多位对口专业的在读学长学姐，覆盖从本科到博士。
              </p>
            </div>
            <div className={styles.schoolWrap}>
              {SCHOOLS.map((s) => (
                <div key={s.abbr} className={styles.schoolChip}>
                  <span className={styles.schoolAbbr}>{s.abbr}</span>
                  <span>{s.name}</span>
                  <span className={styles.schoolDot} />
                  <span className={styles.schoolCount}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.section} id="how">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionEyebrow}>How it works</div>
              <h2 className={styles.sectionTitle}>从一个问题，到一通真实对话</h2>
              <p className={styles.sectionSub}>
                四步走完。中间不需要加任何微信，看到匹配的人再决定是否往下走。
              </p>
            </div>
            <div className={styles.stepsList}>
              {STEPS.map((s) => (
                <div key={s.num} className={styles.stepCard}>
                  <div className={styles.stepNum}>STEP {s.num}</div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className={styles.section} id="why">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionEyebrow}>Why us</div>
              <h2 className={styles.sectionTitle}>为什么选择问津</h2>
              <p className={styles.sectionSub}>
                我们不卖话术。卖的是真实经历——并替你把所有麻烦兜住。
              </p>
            </div>
            <div className={styles.reasonGrid}>
              {REASONS.map((r) => (
                <div key={r.title} className={styles.reasonCard}>
                  <div className={styles.reasonIcon}>{r.icon}</div>
                  <div>
                    <h3 className={styles.reasonTitle}>{r.title}</h3>
                    <p className={styles.reasonDesc}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaInner}>
            <h2 className={styles.finalCtaTitle}>
              你正在纠结的路，<br />
              有人<span className={styles.heroAccent}>曾走过</span>。
            </h2>
            <p className={styles.finalCtaSub}>
              先填一份意向问卷。两分钟，看到匹配的人再决定要不要付费。
            </p>
            <Link href="/questionnaire" className={styles.btnPrimary}>
              填一份意向问卷 <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer} id="about">
        <div className={styles.footerTop}>
          <div className={styles.footerBrandBlock}>
            <div className={styles.footerBrand}>
              <div className={styles.brandLogo}>津</div>
              <span className={styles.brandText}>问津 · 指路</span>
            </div>
            <p className={styles.footerDesc}>
              对口学长学姐 · 升学专业咨询。平台担保、全程站内沟通，让每一个想填好志愿的家庭，
              都能找到一位「读这个专业的真人」问个明白。
            </p>
          </div>
          <div>
            <p className={styles.footerColTitle}>产品</p>
            <div className={styles.footerCol}>
              <a href="#how">如何参与</a>
              <a href="#why">为什么选我们</a>
              <Link href="/questionnaire">填问卷</Link>
              <Link href="/auth?mode=login">登录</Link>
            </div>
          </div>
          <div>
            <p className={styles.footerColTitle}>条款</p>
            <div className={styles.footerCol}>
              <a href="#faq">常见问题</a>
              <a href="/privacy">隐私协议</a>
              <a href="/terms">用户协议</a>
              <a href="mailto:hello@wenjin-zhilu.com">联系我们</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div>© 2026 问津 · 指路</div>
          <div>在他们读过的路上，问一次清楚</div>
        </div>
      </footer>
    </div>
  );
}
