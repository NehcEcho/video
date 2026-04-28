import { Router, Request, Response } from "express";
import { extractBvid } from "../utils/bvid.js";
import {
  getVideoInfo,
  extractSubtitles,
  getAudioUrl,
  downloadAudio,
  VideoInfo,
  SubtitleSegment,
} from "../services/bilibili.js";
import {
  transcodeToMono16k,
  audioToBase64,
  cleanupFile,
} from "../services/ffmpeg.js";
import {
  transcribeAudio,
} from "../services/siliconflow.js";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const TEMP_DIR = join(process.cwd(), "temp");

function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }
}

const router = Router();

router.post("/process", async (req: Request, res: Response) => {
  try {
    const { input, apiKey } = req.body;

    if (!input) {
      res.status(400).json({ error: "请输入 B站链接或 BV 号" });
      return;
    }
    if (!apiKey) {
      res.status(400).json({ error: "请提供 SiliconFlow API Key" });
      return;
    }

    const bvid = extractBvid(input);
    if (!bvid) {
      res.status(400).json({ error: "无法识别有效的 BV 号，请检查输入" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("step", { step: "parse", status: "processing", label: "解析视频链接" });
    send("step", { step: "parse", status: "completed", label: "解析视频链接", bvid });

    send("step", { step: "info", status: "processing", label: "获取视频信息" });
    let videoInfo: VideoInfo;
    try {
      videoInfo = await getVideoInfo(bvid);
    } catch (e: any) {
      send("step", { step: "info", status: "error", label: "获取视频信息失败", error: e.message });
      res.end();
      return;
    }
    send("step", { step: "info", status: "completed", label: "获取视频信息", videoInfo });
    send("videoInfo", videoInfo);

    send("step", { step: "subtitle", status: "processing", label: "提取字幕内容" });
    const subtitleResult = await extractSubtitles(bvid, videoInfo.cid);

    let subtitleText = "";
    let segments: SubtitleSegment[] = [];

    if (subtitleResult && subtitleResult.text.trim()) {
      subtitleText = subtitleResult.text;
      segments = subtitleResult.segments;
      send("step", { step: "subtitle", status: "completed", label: "字幕提取完成", length: subtitleText.length });
      send("subtitle", { text: subtitleText, segments, hasSubtitles: true });
    } else {
      send("step", { step: "subtitle", status: "completed", label: "无可用字幕，AI 转写中" });

      try {
        ensureTempDir();
        const audioPath = join(TEMP_DIR, `${bvid}_audio.m4s`);

        send("step", { step: "transcribe", status: "processing", label: "转写: 获取音频流" });
        const audioUrl = await getAudioUrl(bvid, videoInfo.cid);

        send("step", { step: "transcribe", status: "processing", label: "转写: 下载音频" });
        await downloadAudio(audioUrl, audioPath);

        send("step", { step: "transcribe", status: "processing", label: "转写: 音频转码" });
        const processedPath = await transcodeToMono16k(audioPath);
        try { await cleanupFile(audioPath); } catch {}

        const audioB64 = await audioToBase64(processedPath);
        await cleanupFile(processedPath);

        send("step", { step: "transcribe", status: "processing", label: "转写: AI 语音识别中" });

        const transcript = await transcribeAudio(audioB64, apiKey, (token) => {
          send("transcribeToken", { token });
        });

        subtitleText = transcript;
        send("step", { step: "transcribe", status: "completed", label: "AI 转写完成" });
        send("subtitle", { text: transcript, segments: [], hasSubtitles: false, isTranscribed: true });
      } catch (e: any) {
        send("step", { step: "transcribe", status: "error", label: "AI 转写失败", error: e.message });
        send("subtitle", { text: "", segments: [], hasSubtitles: false, isTranscribed: false });
      }
    }

    send("step", { step: "complete", status: "completed", label: "提取完成" });
    res.end();
  } catch (e: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: e.message || "服务器内部错误" });
    } else {
      res.end();
    }
  }
});

router.post("/info", async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    const bvid = extractBvid(input || "");
    if (!bvid) {
      res.status(400).json({ error: "无法识别有效的 BV 号" });
      return;
    }
    const info = await getVideoInfo(bvid);
    res.json(info);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
