export interface VideoInfo {
  bvid: string;
  title: string;
  author: string;
  duration: number;
  views: number;
  description: string;
  thumbnail: string;
  cid: string;
  hasSubtitles: boolean;
}

export interface SubtitleSegment {
  start: number;
  duration: number;
  text: string;
}

export interface SubtitleData {
  text: string;
  segments: SubtitleSegment[];
  hasSubtitles: boolean;
  isTranscribed?: boolean;
}

export interface StepEvent {
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  label: string;
  error?: string;
  bvid?: string;
  videoInfo?: VideoInfo;
  length?: number;
}

export interface ProcessCallbacks {
  onStep: (step: StepEvent) => void;
  onVideoInfo: (info: VideoInfo) => void;
  onSubtitle: (data: SubtitleData) => void;
  onTranscribeToken?: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function processVideo(
  input: string,
  apiKey: string,
  callbacks: ProcessCallbacks
): Promise<void> {
  const response = await fetch("/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, apiKey }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "请求失败" }));
    callbacks.onError(err.error || `HTTP ${response.status}`);
    return;
  }

  if (!response.body) {
    callbacks.onError("无法读取响应流");
    return;
  }

  await readSSE(response.body, {
    step: (data) => callbacks.onStep(data),
    videoInfo: (data) => callbacks.onVideoInfo(data),
    subtitle: (data) => callbacks.onSubtitle(data),
    transcribeToken: callbacks.onTranscribeToken ? (data) => callbacks.onTranscribeToken!(data.token) : undefined,
  });

  callbacks.onDone();
}

async function readSSE(
  body: ReadableStream<Uint8Array>,
  handlers: Record<string, ((data: any) => void) | undefined>
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const lines = part.split("\n");
      let eventType = "";
      let dataStr = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          dataStr = line.slice(6).trim();
        }
      }

      if (!dataStr) continue;

      try {
        const data = JSON.parse(dataStr);
        const handler = handlers[eventType];
        if (handler) handler(data);
      } catch {}
    }
  }
}
