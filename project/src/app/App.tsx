import { useState, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { VideoInput } from "./components/VideoInput";
import { VideoInfoCard } from "./components/VideoInfoCard";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { TranscriptResult } from "./components/TranscriptResult";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { HistorySidebar } from "./components/HistorySidebar";
import { processVideo, VideoInfo, SubtitleSegment, StepEvent, SubtitleData } from "@/services/api";
import { getApiKey, getHistory, saveHistoryEntry, deleteHistoryEntry, HistoryEntry } from "@/services/storage";

type AppState = "idle" | "processing" | "completed";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
}

const INITIAL_STEPS: Step[] = [
  { id: "parse", label: "解析视频链接", status: "pending" },
  { id: "info", label: "获取视频信息", status: "pending" },
  { id: "subtitle", label: "提取字幕内容", status: "pending" },
  { id: "transcribe", label: "AI 语音识别", status: "pending" },
  { id: "complete", label: "提取完成", status: "pending" },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [subtitleText, setSubtitleText] = useState("");
  const [subtitleSegments, setSubtitleSegments] = useState<SubtitleSegment[]>([]);
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>(() => getHistory());

  const currentRef = useRef({ title: "", author: "", thumbnail: "", bvid: "", subtitleText: "" });

  const saveToHistory = useCallback(() => {
    const cur = currentRef.current;
    if (!cur.bvid || !cur.title) return;
    saveHistoryEntry({
      bvid: cur.bvid,
      title: cur.title,
      author: cur.author,
      thumbnail: cur.thumbnail,
      timestamp: new Date().toLocaleString(),
      subtitleText: cur.subtitleText,
    });
    setHistoryItems(getHistory());
  }, []);

  const handleLoadHistory = useCallback((id: string) => {
    const items = getHistory();
    const item = items.find(h => h.id === id);
    if (!item) return;
    setVideoInfo({
      bvid: item.bvid, title: item.title, author: item.author,
      duration: 0, views: 0, description: "", thumbnail: item.thumbnail,
      cid: "", hasSubtitles: !!item.subtitleText,
    });
    setSubtitleText(item.subtitleText);
    setSubtitleSegments([]);
    setIsTranscribed(false);
    setAppState("completed");
    setHistoryOpen(false);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleSubmit = async (input: string) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    setAppState("processing");
    setSteps(INITIAL_STEPS.map(s => ({ ...s })));
    setVideoInfo(null);
    setSubtitleText("");
    setSubtitleSegments([]);
    setIsTranscribed(false);
    setErrorMsg("");

    currentRef.current = { title: "", author: "", thumbnail: "", bvid: "", subtitleText: "" };

    const updateStep = (stepId: string, status: Step["status"], label?: string) => {
      setSteps(prev => prev.map(s =>
        s.id === stepId ? { ...s, status, ...(label ? { label } : {}) } : s
      ));
    };

    await processVideo(input, apiKey, {
      onStep: (event: StepEvent) => {
        updateStep(event.step, event.status, event.label);
      },
      onVideoInfo: (info: VideoInfo) => {
        setVideoInfo(info);
        currentRef.current.bvid = info.bvid;
        currentRef.current.title = info.title;
        currentRef.current.author = info.author;
        currentRef.current.thumbnail = info.thumbnail;
      },
      onSubtitle: (data: SubtitleData) => {
        setSubtitleText(data.text);
        setSubtitleSegments(data.segments);
        setIsTranscribed(!!data.isTranscribed);
        currentRef.current.subtitleText = data.text;
      },
      onTranscribeToken: (token) => {
        setSubtitleText(prev => {
          const next = prev + token;
          currentRef.current.subtitleText = next;
          return next;
        });
      },
      onDone: () => {
        setAppState("completed");
        saveToHistory();
      },
      onError: (error: string) => {
        setErrorMsg("提取失败: " + error);
        setAppState("completed");
      },
    });
  };

  const handleSaveSettings = () => {};

  const handleReset = () => {
    setAppState("idle");
    setSteps(INITIAL_STEPS.map(s => ({ ...s })));
    setVideoInfo(null);
    setSubtitleText("");
    setSubtitleSegments([]);
    setIsTranscribed(false);
    setErrorMsg("");
  };

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

  const displayVideoInfo = videoInfo ? {
    bvid: videoInfo.bvid,
    title: videoInfo.title,
    author: videoInfo.author,
    duration: formatDuration(videoInfo.duration),
    views: formatViews(videoInfo.views),
    thumbnail: videoInfo.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
  } : null;

  const hasText = subtitleText.length > 0;

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
        {appState === "idle" && (
          <VideoInput onSubmit={handleSubmit} isProcessing={false} />
        )}

        {(appState === "processing" || appState === "completed") && (
          <>
            <div className="pt-6">
              {displayVideoInfo && <VideoInfoCard info={displayVideoInfo} />}
            </div>

            {appState === "processing" && (
              <ProcessingStatus steps={steps.filter(s => {
                if (s.id === "transcribe" && s.status === "pending") return false;
                return true;
              })} />
            )}

            {appState === "completed" && (
              <>
                {hasText && (
                  <TranscriptResult
                    segments={subtitleSegments.length > 0
                      ? subtitleSegments.map(s => ({
                          time: formatDuration(s.start),
                          text: s.text,
                        }))
                      : subtitleText.split("\n").filter(Boolean).map((text, i) => ({
                          time: "",
                          text,
                        }))
                    }
                    fullText={subtitleText}
                    label={isTranscribed ? "AI 转写结果" : "字幕结果"}
                  />
                )}

                {!hasText && errorMsg && (
                  <div className="w-full max-w-3xl mx-auto px-6 pb-6">
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                      <p className="text-red-700 text-sm font-medium mb-1">提取失败</p>
                      <p className="text-red-600 text-xs font-mono break-all">{errorMsg}</p>
                      <p className="text-red-400 text-xs mt-1">请检查 API Key 是否正确</p>
                    </div>
                  </div>
                )}

                <div className="w-full max-w-3xl mx-auto px-6 pb-12">
                  <button
                    onClick={handleReset}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-teal-300 hover:border-teal-400 hover:bg-teal-50/50 text-teal-700 font-medium transition-colors"
                  >
                    处理新视频
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
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
