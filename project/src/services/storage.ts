const STORAGE_KEYS = {
  API_KEY: "bili_transcriber_api_key",
  MODEL: "bili_transcriber_model",
  HISTORY: "bili_transcriber_history",
} as const;

const DEFAULT_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Thinking";

export interface HistoryEntry {
  id: string;
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
  timestamp: string;
  subtitleText: string;
  summaryText: string;
  createdAt: number;
}

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

export function getModel(): string {
  return localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULT_MODEL;
}

export function saveModel(model: string): void {
  localStorage.setItem(STORAGE_KEYS.MODEL, model);
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  history.unshift(newEntry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  return newEntry;
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}
