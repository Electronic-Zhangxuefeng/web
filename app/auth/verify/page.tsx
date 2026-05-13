"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import styles from "./verify.module.css";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const masked =
    user.length <= 2
      ? user[0] + "***"
      : user[0] + "***" + user[user.length - 1];
  return `${masked}@${domain}`;
}

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    const nextEmpty = newCode.findIndex((c) => !c);
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("请输入完整的 6 位验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } =
        await authClient.emailOtp.verifyEmail({
          email,
          otp: fullCode,
        });
      if (verifyError) {
        setError(verifyError.message || "验证失败,请重试");
      } else {
        sessionStorage.removeItem("verify_email");
        router.push("/dashboard");
      }
    } catch {
      setError("网络错误,请重试");
    } finally {
      setLoading(false);
    }
  }, [code, email, router]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (code.every((c) => c)) {
      handleVerify();
    }
  }, [code, handleVerify]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
    } catch {
      setError("发送失败,请重试");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/auth" className={styles.backLink}>
          ← 返回
        </Link>

        <h1 className={styles.title}>验证邮箱</h1>
        <p className={styles.subtitle}>
          验证码已发送到{" "}
          <strong>{email ? maskEmail(email) : "你的邮箱"}</strong>
        </p>

        <div className={styles.codeRow} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={styles.codeInput}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.verifyBtn}
          onClick={handleVerify}
          disabled={loading || code.some((c) => !c)}
        >
          {loading ? "验证中..." : "验证"}
        </button>

        <div className={styles.resend}>
          {canResend ? (
            <button className={styles.resendBtn} onClick={handleResend}>
              没收到? 重新发送
            </button>
          ) : (
            <span className={styles.resendWait}>
              {countdown} 秒后可重新发送
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
