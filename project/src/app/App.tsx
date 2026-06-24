import { useState, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { VideoInput, TranscribeMode } from "./components/VideoInput";
import { VideoInfoCard } from "./components/VideoInfoCard";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { TranscriptResult } from "./components/TranscriptResult";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { HistorySidebar } from "./components/HistorySidebar";
import { processVideo, VideoInfo, SubtitleSegment, StepEvent, SubtitleData } from "@/services/api";
import { getApiKey, getHistory, saveHistoryEntry, deleteHistoryEntry, HistoryEntry } from "@/services/storage";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
}

interface Task {
  id: string;
  state: "processing" | "completed" | "error";
  steps: Step[];
  videoInfo: VideoInfo | null;
  subtitleText: string;
  subtitleSegments: SubtitleSegment[];
  isTranscribed: boolean;
  errorMsg: string;
}

interface TaskMeta {
  title: string;
  author: string;
  thumbnail: string;
  bvid: string;
  subtitleText: string;
}

const INITIAL_STEPS: Step[] = [
  { id: "parse", label: "解析视频链接", status: "pending" },
  { id: "info", label: "获取视频信息", status: "pending" },
  { id: "subtitle", label: "提取字幕内容", status: "pending" },
  { id: "transcribe", label: "AI 语音识别", status: "pending" },
  { id: "complete", label: "提取完成", status: "pending" },
];

const BV_REGEX = /BV[a-zA-Z0-9]{10}/;
const BILIBILI_URL_REGEX = /bilibili\.com\/video\/(BV[a-zA-Z0-9]{10})/;

function extractMultipleBvids(input: string): string[] {
  const segments = input.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
  const bvids: string[] = [];
  const seen = new Set<string>();
  for (const seg of segments) {
    const urlMatch = seg.match(BILIBILI_URL_REGEX);
    const bvid = urlMatch ? urlMatch[1] : seg.match(BV_REGEX)?.[0];
    if (bvid && !seen.has(bvid)) {
      seen.add(bvid);
      bvids.push(bvid);
    }
  }
  return bvids;
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>(() => getHistory());

  const taskMetaRef = useRef<Record<string, TaskMeta>>({});

  const saveTaskToHistory = useCallback((taskId: string) => {
    const meta = taskMetaRef.current[taskId];
    if (!meta?.bvid || !meta?.title) return;
    saveHistoryEntry({
      bvid: meta.bvid,
      title: meta.title,
      author: meta.author,
      thumbnail: meta.thumbnail,
      timestamp: new Date().toLocaleString(),
      subtitleText: meta.subtitleText,
    });
    setHistoryItems(getHistory());
  }, []);

  const handleLoadHistory = useCallback((id: string) => {
    const items = getHistory();
    const item = items.find(h => h.id === id);
    if (!item) return;
    const taskId = `${Date.now()}-history-${Math.random().toString(36).slice(2, 6)}`;
    const videoInfo: VideoInfo = {
      bvid: item.bvid, title: item.title, author: item.author,
      duration: 0, views: 0, description: "", thumbnail: item.thumbnail,
      cid: "", hasSubtitles: !!item.subtitleText,
    };
    setTasks([{
      id: taskId,
      state: "completed",
      steps: INITIAL_STEPS.map(s => ({ ...s, status: "completed" as const })),
      videoInfo,
      subtitleText: item.subtitleText,
      subtitleSegments: [],
      isTranscribed: false,
      errorMsg: "",
    }]);
    setHistoryOpen(false);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleSubmit = useCallback((input: string, mode: TranscribeMode) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    const bvids = extractMultipleBvids(input);
    if (bvids.length === 0) return;

    const newTasks: Task[] = bvids.map((bvid, i) => {
      const id = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
      taskMetaRef.current[id] = { title: "", author: "", thumbnail: "", bvid, subtitleText: "" };
      return {
        id,
        state: "processing" as const,
        steps: INITIAL_STEPS.map(s => ({ ...s })),
        videoInfo: null,
        subtitleText: "",
        subtitleSegments: [],
        isTranscribed: false,
        errorMsg: "",
      };
    });

    setTasks(prev => [...prev, ...newTasks]);

    newTasks.forEach(task => {
      const taskId = task.id;
      const bvid = taskMetaRef.current[taskId].bvid;

      processVideo(bvid, apiKey, mode, {
        onStep: (event: StepEvent) => {
          setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              steps: t.steps.map(s =>
                s.id === event.step ? { ...s, status: event.status, ...(event.label ? { label: event.label } : {}) } : s
              ),
            };
          }));
        },
        onVideoInfo: (info: VideoInfo) => {
          const meta = taskMetaRef.current[taskId];
          if (meta) {
            meta.title = info.title;
            meta.author = info.author;
            meta.thumbnail = info.thumbnail;
          }
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, videoInfo: info } : t));
        },
        onSubtitle: (data: SubtitleData) => {
          const meta = taskMetaRef.current[taskId];
          if (meta) meta.subtitleText = data.text;
          setTasks(prev => prev.map(t => t.id === taskId ? {
            ...t, subtitleText: data.text, subtitleSegments: data.segments, isTranscribed: !!data.isTranscribed,
          } : t));
        },
        onTranscribeToken: (token: string) => {
          setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            const newText = t.subtitleText + token;
            const meta = taskMetaRef.current[taskId];
            if (meta) meta.subtitleText = newText;
            return { ...t, subtitleText: newText };
          }));
        },
        onDone: () => {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, state: "completed" } : t));
          saveTaskToHistory(taskId);
        },
        onError: (error: string) => {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, state: "error", errorMsg: "提取失败: " + error } : t));
        },
      }).catch(() => {});
    });
  }, [saveTaskToHistory]);

  const handleReset = () => {
    setTasks([]);
    setCollapsedTasks(new Set());
    taskMetaRef.current = {};
  };

  const toggleCollapse = useCallback((taskId: string) => {
    setCollapsedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  }, []);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 10000) return `${(views / 10000).toFixed(1)}万`;
    return String(views);
  };

  const formatVideoInfo = (info: VideoInfo) => ({
    bvid: info.bvid,
    title: info.title,
    author: info.author,
    duration: formatDuration(info.duration),
    views: formatViews(info.views),
    thumbnail: info.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
  });

  const allDone = tasks.length > 0 && tasks.every(t => t.state === "completed" || t.state === "error");

  const handleDismissTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    delete taskMetaRef.current[taskId];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <Header
        onSettingsClick={() => setSettingsOpen(true)}
        onHistoryClick={() => {
          refreshHistory();
          setHistoryOpen(true);
        }}
      />

      <main className="pt-8 pb-16">
        <VideoInput onSubmit={handleSubmit} isProcessing={false} />

        {tasks.length > 0 && (
          <>
            <div className="w-full max-w-3xl mx-auto px-6 my-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.state === "processing").length} 个处理中 · {tasks.filter(t => t.state === "completed").length} 个已完成
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                >
                  清空列表
                </button>
              </div>
            </div>

            {tasks.map((task, i) => {
              const hasText = task.subtitleText.length > 0;
              const displayInfo = task.videoInfo ? formatVideoInfo(task.videoInfo) : null;
              const showTranscribeStep = task.steps.some(s => s.id === "transcribe" && s.status !== "pending");

              return (
                <div key={task.id}>
                  {i > 0 && (
                    <div className="w-full max-w-3xl mx-auto px-6 my-8">
                      <div className="border-t-2 border-dashed border-gray-200" />
                    </div>
                  )}

                  {task.state === "processing" && (
                    <div className="w-full max-w-3xl mx-auto px-6 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                          {taskMetaRef.current[task.id]?.bvid || "..."}
                        </span>
                        <span>处理中</span>
                      </div>
                    </div>
                  )}

                  {displayInfo && <VideoInfoCard info={displayInfo} />}

                  {task.state === "completed" && taskMetaRef.current[task.id]?.bvid && (
                    <div className="w-full max-w-3xl mx-auto px-6 mb-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/download/video/${taskMetaRef.current[task.id].bvid}`}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          下载视频
                        </a>
                        <a
                          href={`/api/download/audio/${taskMetaRef.current[task.id].bvid}`}
                          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          下载音频
                        </a>
                      </div>
                    </div>
                  )}

                  {task.state === "processing" && (
                    <ProcessingStatus steps={task.steps.filter(s => {
                      if (s.id === "transcribe" && !showTranscribeStep) return false;
                      return true;
                    })} />
                  )}

                  {task.state === "completed" && hasText && (
                    <>
                      <div className="w-full max-w-3xl mx-auto px-6 mt-4">
                        <button
                          onClick={() => toggleCollapse(task.id)}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <svg className={`w-3.5 h-3.5 transition-transform ${collapsedTasks.has(task.id) ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>{collapsedTasks.has(task.id) ? "展开文本" : "收起文本"}</span>
                          <span className="text-muted-foreground">({task.subtitleText.length} 字)</span>
                        </button>
                      </div>

                      {!collapsedTasks.has(task.id) && (
                        <TranscriptResult
                          segments={task.subtitleSegments.length > 0
                            ? task.subtitleSegments.map(s => ({
                                time: formatDuration(s.start),
                                text: s.text,
                              }))
                            : task.subtitleText.split("\n").filter(Boolean).map((text, idx) => ({
                                time: "",
                                text,
                              }))
                          }
                          fullText={task.subtitleText}
                          label={task.isTranscribed ? "AI 转写结果" : "字幕结果"}
                        />
                      )}

                      {!collapsedTasks.has(task.id) && (
                        <div className="w-full max-w-3xl mx-auto px-6 mt-2 pb-2">
                          <button
                            onClick={() => toggleCollapse(task.id)}
                            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            <span>收起文本</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {(task.state === "error" || (task.state === "completed" && !hasText && task.errorMsg)) && (
                    <div className="w-full max-w-3xl mx-auto px-6 pb-6">
                      <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                        <p className="text-red-700 text-sm font-medium mb-1">提取失败</p>
                        <p className="text-red-600 text-xs font-mono break-all">{task.errorMsg}</p>
                        <p className="text-red-400 text-xs mt-1">请检查 API Key 是否正确</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={() => {}}
      />
      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={historyItems}
        onItemClick={handleLoadHistory}
        onItemDelete={(id) => {
          deleteHistoryEntry(id);
          refreshHistory();
        }}
      />
    </div>
  );
}
