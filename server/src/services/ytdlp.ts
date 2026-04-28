import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, readFile, unlink, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);

const TEMP_DIR = join(process.cwd(), "temp");
const YT_DLP_PATH = "yt-dlp";

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

export interface SubtitleResult {
  text: string;
  segments: SubtitleSegment[];
}

export interface SubtitleSegment {
  start: number;
  duration: number;
  text: string;
}

function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    return mkdir(TEMP_DIR, { recursive: true });
  }
  return Promise.resolve();
}

function secondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

async function runYtDlp(args: string[], timeout = 120000): Promise<string> {
  try {
    const { stdout } = await execFileAsync(YT_DLP_PATH, args, {
      timeout,
      maxBuffer: 50 * 1024 * 1024,
    });
    return stdout;
  } catch (error: any) {
    if (error.stderr) {
      throw new Error(`yt-dlp error: ${error.stderr}`);
    }
    throw error;
  }
}

export async function getVideoInfo(bvid: string): Promise<VideoInfo> {
  const url = `https://www.bilibili.com/video/${bvid}`;
  const jsonStr = await runYtDlp([
    "--dump-json",
    "--no-playlist",
    url,
  ]);

  const data = JSON.parse(jsonStr);

  return {
    bvid,
    title: data.title || data.fulltitle || "",
    author: data.uploader || data.channel || "",
    duration: data.duration || 0,
    views: data.view_count || 0,
    description: data.description || "",
    thumbnail: data.thumbnail || "",
    cid: String(data.id || ""),
    hasSubtitles: !!(data.subtitles || data.automatic_captions),
  };
}

export async function extractSubtitles(bvid: string): Promise<SubtitleResult | null> {
  await ensureTempDir();
  const url = `https://www.bilibili.com/video/${bvid}`;
  const outputTemplate = join(TEMP_DIR, `${bvid}`);

  try {
    await runYtDlp([
      "--write-auto-subs",
      "--write-subs",
      "--sub-format", "json3",
      "--sub-langs", "all",
      "--skip-download",
      "--output", outputTemplate,
      "--no-playlist",
      url,
    ], 180000);

    const possiblePaths = [
      `${outputTemplate}.zh-Hans.json3`,
      `${outputTemplate}.zh-CN.json3`,
      `${outputTemplate}.zh.json3`,
      `${outputTemplate}.en.json3`,
    ];

    let rawSubs: string | null = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        rawSubs = await readFile(p, "utf-8");
        try { await unlink(p); } catch {}
        break;
      }
    }

    if (!rawSubs) {
      const files = await readdir(TEMP_DIR);
      const subFile = files.find(f => f.startsWith(bvid) && f.endsWith(".json3"));
      if (subFile) {
        const filePath = join(TEMP_DIR, subFile);
        rawSubs = await readFile(filePath, "utf-8");
        try { await unlink(filePath); } catch {}
      }
    }

    if (!rawSubs) return null;

    return parseJson3Subtitle(rawSubs);
  } catch {
    return null;
  }
}

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Array<{ utf8: string }>;
}

function parseJson3Subtitle(raw: string): SubtitleResult {
  const data = JSON.parse(raw);
  const events: Json3Event[] = data.events || [];

  const segments: SubtitleSegment[] = [];
  for (const ev of events) {
    if (ev.segs) {
      const text = ev.segs.map(s => s.utf8).join("").trim();
      if (text) {
        segments.push({
          start: (ev.tStartMs || 0) / 1000,
          duration: (ev.dDurationMs || 0) / 1000,
          text,
        });
      }
    }
  }

  const fullText = segments.map(s => s.text).join("\n");
  return { text: fullText, segments };
}

export async function extractAudio(bvid: string): Promise<string> {
  await ensureTempDir();
  const url = `https://www.bilibili.com/video/${bvid}`;
  const outputPath = join(TEMP_DIR, `${bvid}_audio.wav`);

  await runYtDlp([
    "--extract-audio",
    "--audio-format", "wav",
    "--audio-quality", "0",
    "--output", outputPath,
    "--no-playlist",
    "--no-keep-video",
    url,
  ], 300000);

  return outputPath;
}

export function getAudioFilePath(bvid: string): string {
  return join(TEMP_DIR, `${bvid}_audio.wav`);
}
