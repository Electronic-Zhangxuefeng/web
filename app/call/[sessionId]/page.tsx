"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import * as zego from "@/lib/zego";
import styles from "./call.module.css";

type CallState = "loading" | "waiting" | "active" | "countdown" | "ended";
type CallTokenResponse = {
  token: string;
  roomID: string;
  userID: string;
  peerUserID: string;
  peerName?: string;
  appID: number;
  durationMins: number;
};

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: session, isPending } = authClient.useSession();
  const [callState, setCallState] = useState<CallState>("loading");
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [durationMins, setDurationMins] = useState(30);
  const [peerName, setPeerName] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roomIdRef = useRef("");
  const endedRef = useRef(false);
  const callStartedRef = useRef(false);
  const startReportInFlightRef = useRef(false);
  const startReportSentRef = useRef(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth?mode=login");
    }
  }, [session, isPending, router]);

  const endCall = useCallback(async (options?: { reportEnd?: boolean }) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const shouldReportEnd = options?.reportEnd ?? true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }

    try {
      await zego.leaveRoom(roomIdRef.current);
    } catch (error) {
      console.error(error);
    } finally {
      zego.destroy();
    }

    if (shouldReportEnd) {
      try {
        await fetch("/api/call/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error(error);
      }
    }
    setCallState("ended");
  }, [sessionId]);

  useEffect(() => {
    if (isPending || !session) return;

    let cancelled = false;
    endedRef.current = false;
    callStartedRef.current = false;
    startReportInFlightRef.current = false;
    startReportSentRef.current = false;

    async function init() {
      const res = await fetch(`/api/call/token?sessionId=${sessionId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        router.replace("/dashboard");
        return;
      }
      const data = (await res.json()) as CallTokenResponse;
      if (cancelled) return;

      roomIdRef.current = data.roomID;
      setElapsed(0);
      setDurationMins(data.durationMins);
      setPeerName(data.peerName || "对方");

      await zego.createEngine(data.appID);
      if (cancelled) return;

      const startCall = async () => {
        if (cancelled || endedRef.current) return;

        if (!callStartedRef.current) {
          callStartedRef.current = true;
          setCallState("active");

          const startTime = Date.now();
          timerRef.current = setInterval(() => {
            const secs = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(secs);

            const totalSecs = data.durationMins * 60;
            const remaining = totalSecs - secs;
            if (remaining <= 300 && remaining > 0) {
              setCallState("countdown");
            }
            if (remaining <= 0) {
              void endCall();
            }
          }, 1000);
        }

        if (startReportSentRef.current || startReportInFlightRef.current) return;

        startReportInFlightRef.current = true;
        try {
          const startedRes = await fetch("/api/call/started", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionId }),
          });
          if (!startedRes.ok) {
            throw new Error("Failed to mark call as started");
          }
          startReportSentRef.current = true;
        } catch (error) {
          console.error(error);
        } finally {
          startReportInFlightRef.current = false;
        }
      };

      zego.onRoomStreamUpdate((type) => {
        if (type === "ADD") void startCall();
      });

      zego.onRoomUserUpdate(async (type, userList) => {
        if (type === "ADD" && !cancelled) {
          if (userList.length > 0) {
            setPeerName(userList[0].userName ?? "对方");
          }
          void startCall();
        }
      });

      statusPollRef.current = setInterval(async () => {
        if (cancelled || endedRef.current) return;
        try {
          const statusRes = await fetch(`/api/call/status/${sessionId}`, {
            credentials: "include",
          });
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();
          if (statusData.status === "ended") {
            void endCall({ reportEnd: false });
          }
        } catch (error) {
          console.error(error);
        }
      }, 2000);

      const u = session!.user as { name?: string; email?: string };
      const userName = u.name || u.email || "用户";
      setCallState("waiting");
      await zego.joinRoom(data.token, data.roomID, data.userID, userName, data.peerUserID);
      if (cancelled) {
        await zego.leaveRoom(data.roomID);
        zego.destroy();
      }
    }

    init();

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusPollRef.current) clearInterval(statusPollRef.current);
      void zego.leaveRoom(roomIdRef.current);
      zego.destroy();
    };
  }, [isPending, session, sessionId, router, endCall]);

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function remainingTime(): number {
    return durationMins * 60 - elapsed;
  }

  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const isMentor = user?.role === "mentor";
  const avatarBg = isMentor ? "#b8472d" : "#3d5c4d";
  const avatarLetter = peerName ? peerName[0] : "?";

  if (isPending || !session) {
    return <div className={styles.page}><div className={styles.loading}>加载中...</div></div>;
  }

  if (callState === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>连接中...</span>
        </div>
      </div>
    );
  }

  if (callState === "ended") {
    return (
      <div className={styles.page}>
        <div className={styles.endedIcon}>&#10003;</div>
        <h2 className={styles.endedTitle}>通话已结束</h2>
        <p className={styles.endedDuration}>本次通话时长：{formatTime(elapsed)}</p>
        <p className={styles.endedNote}>通话记录生成中...</p>
        <button className={styles.backBtn} onClick={() => router.push("/dashboard")}>
          返回首页
        </button>
      </div>
    );
  }

  if (callState === "waiting") {
    return (
      <div className={styles.page}>
        <div className={`${styles.avatar} ${styles.avatarWaiting}`} style={{ background: avatarBg }}>
          {avatarLetter}
        </div>
        <h2 className={styles.userName}>{peerName || "对方"}</h2>
        <p className={styles.waitingText}>等待对方加入...</p>
        <div className={styles.spinner} />
        <button className={styles.cancelBtn} onClick={() => { void endCall(); router.push("/dashboard"); }}>
          取消
        </button>
      </div>
    );
  }

  const isCountdown = callState === "countdown";

  return (
    <div className={styles.page}>
      {isCountdown ? (
        <div className={`${styles.timer} ${styles.timerWarning}`}>
          剩余时间 <span className={styles.timerValue}>{formatTime(remainingTime())}</span>
        </div>
      ) : (
        <div className={styles.timer}>{formatTime(elapsed)}</div>
      )}

      <div className={styles.avatar} style={{ background: avatarBg }}>{avatarLetter}</div>
      <h2 className={styles.userName}>{peerName || "对方"}</h2>
      <p className={styles.userDetail}>&nbsp;</p>
      <div>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>通话中</span>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.controlBtn} ${muted ? styles.controlBtnActive : ""}`}
          onClick={() => setMuted(zego.toggleMute())}
          title={muted ? "取消静音" : "静音"}
        >
          {muted ? "🔇" : "🎤"}
        </button>
        <button className={`${styles.controlBtn} ${styles.hangupBtn}`} onClick={() => void endCall()} title="挂断">
          📞
        </button>
        <button className={styles.controlBtn} title="扬声器">
          🔊
        </button>
      </div>
    </div>
  );
}
