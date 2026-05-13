import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.container + " " + styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>问</div>
            <div className={styles.brandText}>
              <div className={styles.name}>
                问津 <span className={styles.sep}>｜</span> 指路
              </div>
              <div className={styles.tag}>对口学长学姐 · 升学专业咨询</div>
            </div>
          </div>
          <nav className={styles.nav}>
            <a href="#manifesto">关于</a>
            <a href="#tiers">服务</a>
            <a href="#how">怎么用</a>
            <Link className={styles.btn} href="/auth">
              立刻开始 →
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ─── 双门 Hero ─── */}
        <section className={styles.heroWrap}>
          <div className={styles.container}>
            <div className={styles.heroSplit}>
              {/* 左:问津 */}
              <div className={`${styles.side} ${styles.left}`}>
                <div className={styles.who}>给 · 家长 / 学生</div>
                <h1 className={styles.word}>问津</h1>
                <p className={styles.hook}>
                  不知道问谁?
                  <br />
                  问那位真的在读的学长学姐。
                </p>
                <p className={styles.desc}>
                  每年六月,数百万家庭面对一份几百页的志愿手册。最该被问到的人 ——{" "}
                  <b>正在那所大学读那个专业的学长学姐</b>{" "}
                  —— 从来没人帮你对上。
                </p>
                <div className={styles.ctaRow}>
                  <Link className={styles.btn} href="/auth?role=parent">
                    开始问津 →
                  </Link>
                  <a className={`${styles.btn} ${styles.btnGhost}`} href="#tiers">
                    看三档服务
                  </a>
                </div>
                <div className={styles.meta}>
                  <span>
                    <b>对口在读</b>
                  </span>
                  <span className={styles.dot}>·</span>
                  <span>平台担保</span>
                  <span className={styles.dot}>·</span>
                  <span>全程匿名</span>
                  <span className={styles.dot}>·</span>
                  <span>无需加微信</span>
                </div>
              </div>

              {/* 右:指路 */}
              <div className={`${styles.side} ${styles.right}`}>
                <div className={styles.umbrellaMark}>
                  <svg viewBox="0 0 64 64" fill="none">
                    <path
                      d="M32 8 C16 8, 6 22, 6 30 L58 30 C58 22, 48 8, 32 8 Z"
                      stroke="#3d5c4d"
                      strokeWidth="1.6"
                      fill="none"
                    />
                    <path
                      d="M6 30 Q19 24, 32 30 Q45 36, 58 30"
                      stroke="#3d5c4d"
                      strokeWidth="1.6"
                      fill="none"
                    />
                    <line
                      x1="32"
                      y1="8"
                      x2="32"
                      y2="54"
                      stroke="#3d5c4d"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M32 54 Q32 60, 38 58"
                      stroke="#3d5c4d"
                      strokeWidth="1.6"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className={`${styles.who} ${styles.whoRight}`}>
                  给 · 学长 / 学姐
                </div>
                <h1 className={`${styles.word} ${styles.wordRight}`}>指路</h1>
                <p className={styles.hook}>
                  你淋过的雨,
                  <br />
                  可以为别人挡一阵。
                </p>
                <p className={styles.desc}>
                  当年没人回答你的问题,此刻{" "}
                  <b>你可以来为别人回答</b>
                  。平台撮合 + 担保结算,你只需要做你最熟悉的事 ——
                  讲讲你在读的那个专业。
                </p>
                <div className={styles.ctaRow}>
                  <Link
                    className={`${styles.btn} ${styles.btnUmbrella}`}
                    href="/auth?role=mentor"
                  >
                    来做指路人 →
                  </Link>
                  <a className={`${styles.btn} ${styles.btnGhost}`} href="#guide-how">
                    了解怎么做
                  </a>
                </div>
                <div className={styles.meta}>
                  <span>
                    <b>灵活接单</b>
                  </span>
                  <span className={styles.dot}>·</span>
                  <span>站内通话</span>
                  <span className={styles.dot}>·</span>
                  <span>完成后结算</span>
                  <span className={styles.dot}>·</span>
                  <span>双向打分</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Manifesto ─── */}
        <section className={styles.manifesto} id="manifesto">
          <div className={styles.container}>
            <blockquote className={styles.manifestoQuote}>
              <span className={styles.quoteMark}>「</span>淋过雨的人,
              <br />
              也许可以为<em>别人</em>撑一把伞。
              <span className={styles.quoteMark}>」</span>
            </blockquote>
            <div className={styles.manifestoBody}>
              我们身边几乎每一个同学,都有过填志愿时被坑、入学后想转专业、
              或者羡慕&ldquo;早知道当时找个学长问一问就好了&rdquo;的经历。
              <br />
              <br />
              这不是被夸大的痛点。填错志愿,真的会赔上四年。
              <br />
              而最讽刺的是 —— 答案一直就在身边,只是没人帮忙连起来。
            </div>
            <div className={styles.manifestoPair}>
              <div className={styles.manifestoLeft}>
                <b>问津</b>
                <p>
                  给家长的入口。一键找到读了这个专业、这所学校的真人,把你最关心的事问个明白。
                </p>
              </div>
              <div className={styles.manifestoRight}>
                <b>指路</b>
                <p>
                  给学长的入口。把你已经走过的那段路,变成别人少走的弯路。顺带挣个口粮。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 三档服务 ─── */}
        <section className={styles.sectionBordered} id="tiers">
          <div className={styles.container}>
            <div className={styles.kicker}>三档服务 · 给家长</div>
            <h2 className={styles.h2}>先问一句,还是深聊半小时,你定。</h2>
            <p className={styles.sectionSub}>
              三种规格 ——
              从一句轻问、到深聊半小时、再到三对一模拟面试。主力档支持一对一站内通话,完成咨询后才结算,平台担保,全程无需加微信。
            </p>

            <div className={styles.tiers}>
              <div className={styles.tier}>
                <div className={styles.ord}>壹</div>
                <h3>
                  文字一问
                  <br />
                  多人回复
                </h3>
                <p className={styles.tierFormat}>一个问题 · 3–10 人各答一段</p>
                <p className={styles.tierDesc}>
                  发一个具体问题,平台匹配多位对口在读生,每人给一段文字回复。一个问题听不同视角,适合&ldquo;我没想好要问哪一个人&rdquo;的早期阶段。
                </p>
                <div className={styles.tierMeta}>
                  <span>不限专业</span>
                  <span>异步回复</span>
                </div>
              </div>

              <div className={`${styles.tier} ${styles.tierMain}`}>
                <div className={styles.badge}>主力</div>
                <div className={styles.ord}>贰</div>
                <h3>
                  语音深聊
                  <br />
                  一对一
                </h3>
                <p className={styles.tierFormat}>30 分钟 · 站内通话</p>
                <p className={styles.tierDesc}>
                  精准匹配一位读这个专业、这所学校的学长学姐。可指定子方向 ——
                  就业、保研、出国、转专业、学习氛围、生活体验。
                </p>
                <div className={styles.tierMeta}>
                  <span>站内通话</span>
                  <span>平台担保</span>
                  <span>全程匿名</span>
                </div>
              </div>

              <div className={styles.tier}>
                <div className={styles.ord}>叁</div>
                <h3>
                  综评模拟面试
                  <br />
                  三对一
                </h3>
                <p className={styles.tierFormat}>8 分钟面试 + 2 分钟反馈</p>
                <p className={styles.tierDesc}>
                  3
                  位刚走过同所院校综评流程的学长姐,模拟真实面试场景并现场反馈。录像可回看。仅
                  6 月开放,首批覆盖沪上综评院校。
                </p>
                <div className={styles.tierMeta}>
                  <span>仅 6 月开放</span>
                  <span>沪上院校</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 怎么用 ─── */}
        <section className={styles.sectionBordered} id="how">
          <div className={styles.container}>
            <div className={styles.kicker}>怎么用</div>
            <h2 className={styles.h2}>不用加微信,四步问到答案。</h2>
            <p className={styles.sectionSub}>
              家长侧的标准流程。指路人侧的流程对称 ——
              完善个人信息、领单、通话、结算。
            </p>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepN}>01</div>
                <h4>填问卷</h4>
                <p>告诉我们目标院校、专业、最关心的维度。</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepN}>02</div>
                <h4>看匹配</h4>
                <p>呈现 3–5 位对口在读生,看简介与历史评价挑人。</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepN}>03</div>
                <h4>下单沟通</h4>
                <p>站内担保支付,站内沟通工具,无需任何微信。</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepN}>04</div>
                <h4>双向评价</h4>
                <p>完成后结算,双方打分,沉淀信任网络。</p>
              </div>
            </div>

            <div className={styles.launch} id="guide-how">
              <div>
                <div className={styles.launchKicker}>2026 / 06 / 09</div>
                <h3 className={styles.launchH3}>
                  高考最后一门考完,<em>17:00 准时上线。</em>
                </h3>
                <p className={styles.launchP}>
                  这是家长最愿意尝试新工具的两周。也是我们对自己的承诺 ——
                  用整个内测期把流程跑通,确保第一位下单的家长,等到的是一位真的在读那个专业的学长学姐。
                </p>
              </div>
              <div className={styles.launchDates}>
                <div>
                  <span>内测启动</span>
                  <b>2026 / 05</b>
                </div>
                <div>
                  <span>指路人招募</span>
                  <b>2026 / 05 下</b>
                </div>
                <div>
                  <span>核心内测</span>
                  <b>2026 / 06 初</b>
                </div>
                <div>
                  <span>正式发布</span>
                  <b>06 / 09 · 17:00</b>
                </div>
                <div>
                  <span>主力窗口</span>
                  <b>2026 / 07 – 08</b>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA 注册引导 ─── */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>准备好了?</h2>
              <p className={styles.ctaSub}>
                无论你是想找学长学姐问专业的家长,还是愿意分享经验的在读生,现在就可以注册。
              </p>
              <div className={styles.ctaButtons}>
                <Link className={styles.btn} href="/auth?role=parent">
                  我要问津 →
                </Link>
                <Link
                  className={`${styles.btn} ${styles.btnUmbrella}`}
                  href="/auth?role=mentor"
                >
                  我来指路 →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container + " " + styles.footerInner}>
          <div>&copy; 2026 · 问津 ｜ 指路</div>
          <div>
            <a href="mailto:hello@wenjin.cn">hello@wenjin.cn</a>
          </div>
          <div>沪 ICP 备 · 待申</div>
        </div>
      </footer>
    </>
  );
}
