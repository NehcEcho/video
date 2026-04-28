import { execFile } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);
const TEMP_DIR = join(process.cwd(), "temp");

export async function transcodeToMono16k(inputPath: string): Promise<string> {
  const dotIndex = inputPath.lastIndexOf(".");
  const baseName = dotIndex > 0 ? inputPath.slice(0, dotIndex) : inputPath;
  const outputPath = `${baseName}_processed.wav`;

  await execFileAsync("ffmpeg", [
    "-i", inputPath,
    "-ac", "1",
    "-ar", "16000",
    "-sample_fmt", "s16",
    "-y",
    outputPath,
  ], { timeout: 120000 });

  return outputPath;
}

export async function audioToBase64(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return buffer.toString("base64");
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    }
  } catch {}
}
