"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth?mode=login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className={styles.loading}>
        <p>加载中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user as { name?: string; email?: string; role?: string };
  const isMentor = user?.role === "mentor";
  const accentColor = isMentor ? "#3d5c4d" : "#b8472d";
  const roleLabel = isMentor ? "学长 / 学姐" : "家长 / 学生";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className={styles.page}>
      {/* Top Nav */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo} style={{ background: accentColor }}>
              {isMentor ? "路" : "问"}
            </div>
            <span className={styles.brandName}>问津 ｜ 指路</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.name || user?.email}</span>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              登出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>
            <span className={styles.wave}>&#128075;</span> 欢迎回来
          </h1>
          <div className={styles.roleChip} style={{ color: accentColor, borderColor: accentColor }}>
            {roleLabel}
          </div>
        </div>

        <div className={styles.cards}>
          <div className={styles.card} style={{ borderTopColor: accentColor }}>
            <h3 className={styles.cardTitle}>功能即将上线</h3>
            <p className={styles.cardDesc}>我们正在全力开发以下功能:</p>
            <ul className={styles.featureList}>
              {isMentor ? (
                <>
                  <li>完善个人资料与学籍验证</li>
                  <li>查看和接受咨询订单</li>
                  <li>站内通话与消息</li>
                  <li>收入与结算管理</li>
                </>
              ) : (
                <>
                  <li>填写咨询问卷</li>
                  <li>浏览匹配的学长学姐</li>
                  <li>下单与站内通话</li>
                  <li>评价与反馈</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
