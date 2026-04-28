import { createHash } from "crypto";

const BILIBILI_API = "https://api.bilibili.com";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REFERER = "https://www.bilibili.com";

const MIXIN_KEY_ENC_TAB: number[] = Array.from({ length: 64 }, (_, i) => i);
const SORTED_MIXIN: number[] = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52];

function getMixinKey(orig: string): string {
  const result: string[] = [];
  for (const i of SORTED_MIXIN) {
    if (i < orig.length) result.push(orig[i]);
  }
  return result.join("").slice(0, 32);
}

interface WbiKeys {
  imgKey: string;
  subKey: string;
}

let cachedWbiKeys: WbiKeys | null = null;

async function fetchWbiKeys(): Promise<WbiKeys> {
  if (cachedWbiKeys) return cachedWbiKeys;

  const res = await fetch(`${BILIBILI_API}/x/web-interface/nav`, {
    headers: { "User-Agent": USER_AGENT, Referer: REFERER },
  });
  const data = await res.json() as any;
  const wbi = data?.data?.wbi_img;
  if (!wbi) throw new Error("Failed to get wbi keys from nav API");

  const imgUrl: string = wbi.img_url || "";
  const subUrl: string = wbi.sub_url || "";

  const imgKey = imgUrl.split("/").pop()?.split(".")[0] || "";
  const subKey = subUrl.split("/").pop()?.split(".")[0] || "";

  cachedWbiKeys = { imgKey, subKey };
  return cachedWbiKeys;
}

async function signParams(params: Record<string, any>): Promise<Record<string, any>> {
  const { imgKey, subKey } = await fetchWbiKeys();
  const mixinKey = getMixinKey(imgKey + subKey);

  const now = Math.floor(Date.now() / 1000);
  const signed: Record<string, any> = { ...params, wts: now };

  const keys = Object.keys(signed).sort();
  const queryStr = keys.map(k => `${k}=${encodeURIComponent(String(signed[k]))}`).join("&");
  const hash = createHash("md5").update(queryStr + mixinKey).digest("hex");

  signed.w_rid = hash;
  return signed;
}

async function biliFetch(path: string, params?: Record<string, any>, needWbi = false): Promise<any> {
  let url = `${BILIBILI_API}${path}`;
  let finalParams = params || {};

  if (needWbi && params) {
    finalParams = await signParams(params);
  }

  const queryKeys = Object.keys(finalParams);
  if (queryKeys.length > 0) {
    const qs = queryKeys.map(k => `${k}=${encodeURIComponent(String(finalParams[k]))}`).join("&");
    url += `?${qs}`;
  }

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Referer: REFERER },
  });

  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`BiliBili API error (${data.code}): ${data.message}`);
  }
  return data.data;
}

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

interface BiliSubtitle {
  lan: string;
  lan_doc: string;
  subtitle_url: string;
}

export async function getVideoInfo(bvid: string): Promise<VideoInfo> {
  const data = await biliFetch("/x/web-interface/view", { bvid });

  return {
    bvid: data.bvid,
    title: data.title || "",
    author: data.owner?.name || "",
    duration: data.duration || 0,
    views: data.stat?.view || 0,
    description: data.desc || "",
    thumbnail: data.pic || "",
    cid: String(data.cid || ""),
    hasSubtitles: false,
  };
}

export async function extractSubtitles(bvid: string, cid: string): Promise<SubtitleResult | null> {
  const data = await biliFetch("/x/player/wbi/v2", { bvid, cid }, true);
  const subtitles: BiliSubtitle[] = data?.subtitle?.subtitles || [];

  if (subtitles.length === 0) return null;

  const zhSub = subtitles.find(s => s.lan?.startsWith("zh")) || subtitles[0];
  const subUrl = zhSub.subtitle_url;
  if (!subUrl) return null;

  const subRes = await fetch(subUrl.startsWith("http") ? subUrl : `https:${subUrl}`, {
    headers: { "User-Agent": USER_AGENT, Referer: REFERER },
  });
  const subData = await subRes.json();

  return parseSubtitle(subData);
}

function parseSubtitle(data: any): SubtitleResult {
  const body: any[] = data.body || [];
  const segments: SubtitleSegment[] = [];

  for (const item of body) {
    const text = (item.content || "").trim();
    if (text) {
      segments.push({
        start: item.from || 0,
        duration: (item.to || 0) - (item.from || 0),
        text,
      });
    }
  }

  const fullText = segments.map(s => s.text).join("\n");
  return { text: fullText, segments };
}

export async function getAudioUrl(bvid: string, cid: string): Promise<string> {
  const data = await biliFetch("/x/player/wbi/playurl", {
    bvid,
    cid,
    fnval: 16,
    fourk: 1,
  }, true);

  const dash = data?.dash;
  if (dash?.audio?.length > 0) {
    return dash.audio[0].baseUrl || dash.audio[0].base_url || dash.audio[0].url || "";
  }

  const durl = data?.durl;
  if (durl?.length > 0 && durl[0].url) {
    return durl[0].url;
  }

  throw new Error("No audio URL found in playurl response");
}

export async function downloadAudio(audioUrl: string, outputPath: string): Promise<void> {
  const res = await fetch(audioUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: REFERER,
      Origin: "https://www.bilibili.com",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download audio: HTTP ${res.status}`);
  }

  const { writeFile } = await import("fs/promises");
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outputPath, buffer);
}
