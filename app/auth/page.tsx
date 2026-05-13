"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Suspense } from "react";
import styles from "./auth.module.css";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") === "mentor" ? "mentor" : "parent";
  const isMentor = role === "mentor";

  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const accentColor = isMentor ? "#3d5c4d" : "#b8472d";

  const validateEmail = () => {
    if (isMentor && mode === "register") {
      if (!email.endsWith(".edu.cn")) {
        setError("指路人注册需使用 .edu.cn 邮箱");
        return false;
      }
    }
    if (!email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail()) return;
    if (password.length < 8) {
      setError("密码至少 8 个字符");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
          callbackURL: "/dashboard",
          ...({ role } as Record<string, string>),
        });
        if (signUpError) {
          if (signUpError.code === "USER_ALREADY_EXISTS") {
            await authClient.emailOtp.sendVerificationOtp({
              email,
              type: "email-verification",
            });
            sessionStorage.setItem("verify_email", email);
            router.push("/auth/verify");
            return;
          }
          setError(signUpError.message || "注册失败,请重试");
        } else {
          // Store email for verify page
          sessionStorage.setItem("verify_email", email);
          router.push("/auth/verify");
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });
        if (signInError) {
          if (signInError.message?.includes("verified") || signInError.code === "EMAIL_NOT_VERIFIED") {
            await authClient.emailOtp.sendVerificationOtp({
              email,
              type: "email-verification",
            });
            sessionStorage.setItem("verify_email", email);
            router.push("/auth/verify");
          } else {
            setError(signInError.message || "登录失败,请检查邮箱和密码");
          }
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("网络错误,请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Back to home */}
        <Link href="/" className={styles.backLink}>
          ← 返回首页
        </Link>

        {/* Role indicator */}
        <div className={styles.roleTag} style={{ color: accentColor }}>
          {isMentor ? "指路人" : "家长 / 学生"}
        </div>

        <h1 className={styles.title} style={{ color: accentColor }}>
          {mode === "register" ? "注册" : "登录"}
        </h1>
        <p className={styles.subtitle}>
          {isMentor
            ? "用你的大学邮箱注册,成为指路人"
            : "开始问津,找到你需要的学长学姐"}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>邮箱</label>
            <input
              type="email"
              className={styles.input}
              placeholder={
                isMentor && mode === "register"
                  ? "xxx@xxx.edu.cn"
                  : "your@email.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                borderColor: error ? "#dc2626" : undefined,
              }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>密码</label>
            <input
              type="password"
              className={styles.input}
              placeholder="至少 8 个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            style={{ background: accentColor, borderColor: accentColor }}
            disabled={loading}
          >
            {loading
              ? "处理中..."
              : mode === "register"
                ? "注册"
                : "登录"}
          </button>
        </form>

        <div className={styles.switchMode}>
          {mode === "register" ? (
            <span>
              已有账号?{" "}
              <button
                className={styles.switchBtn}
                style={{ color: accentColor }}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                去登录
              </button>
            </span>
          ) : (
            <span>
              没有账号?{" "}
              <button
                className={styles.switchBtn}
                style={{ color: accentColor }}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                去注册
              </button>
            </span>
          )}
        </div>

        {/* Switch role */}
        <div className={styles.switchRole}>
          {isMentor ? (
            <Link href="/auth?role=parent">我是家长 / 学生 →</Link>
          ) : (
            <Link href="/auth?role=mentor">我是学长 / 学姐 →</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
