import { ZegoExpressEngine } from "zego-express-engine-webrtc";

let engine: ZegoExpressEngine | null = null;
let localStream: MediaStream | null = null;
let publishStreamID: string | null = null;

export function createEngine(appID: number): ZegoExpressEngine {
  if (engine) return engine;
  engine = new ZegoExpressEngine(appID, "wss://webliveroom-api.zego.im/ws");
  return engine;
}

export async function joinRoom(
  token: string,
  roomID: string,
  userID: string,
  userName: string
): Promise<void> {
  if (!engine) throw new Error("Engine not created");

  await engine.loginRoom(roomID, token, { userID, userName });

  localStream = await engine.createStream({ camera: { video: false, audio: true } });
  publishStreamID = `${roomID}_${userID}`;
  await engine.startPublishingStream(publishStreamID, localStream);
}

export async function leaveRoom(roomID: string): Promise<void> {
  if (!engine) return;

  if (localStream) {
    engine.destroyStream(localStream);
    localStream = null;
  }
  if (publishStreamID) {
    engine.stopPublishingStream(publishStreamID);
    publishStreamID = null;
  }
  await engine.logoutRoom(roomID);
}

export function toggleMute(): boolean {
  if (!localStream) return false;
  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) return false;
  audioTrack.enabled = !audioTrack.enabled;
  return !audioTrack.enabled;
}

export function onRoomUserUpdate(
  callback: (type: "ADD" | "DELETE", userList: { userID: string; userName?: string }[]) => void
): void {
  if (!engine) return;
  engine.on("roomUserUpdate", (roomID, updateType, userList) => {
    callback(updateType, userList);
  });
}

export function onRoomStreamUpdate(
  callback: (type: "ADD" | "DELETE", streamList: any[]) => void
): void {
  if (!engine) return;
  engine.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
    if (updateType === "ADD") {
      for (const stream of streamList) {
        const remoteStream = await engine!.startPlayingStream(stream.streamID);
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
      }
    }
    callback(updateType, streamList);
  });
}

export function destroy(): void {
  if (engine) {
    engine.off("roomUserUpdate");
    engine.off("roomStreamUpdate");
    engine = null;
  }
  localStream = null;
  publishStreamID = null;
}
