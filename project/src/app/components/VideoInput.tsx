import { useState } from "react";
import { Search, Sparkles, UserCircle, FileText } from "lucide-react";

export type TranscribeMode = "speaker" | "plain";

interface VideoInputProps {
  onSubmit: (input: string, mode: TranscribeMode) => void;
  isProcessing: boolean;
}

const MODE_OPTIONS: { id: TranscribeMode; icon: typeof UserCircle; title: string; description: string }[] = [
  {
    id: "speaker",
    icon: UserCircle,
    title: "说话人识别",
    description: "自动区分不同角色，标注「角色A」「角色B」",
  },
  {
    id: "plain",
    icon: FileText,
    title: "纯文本转写",
    description: "只输出文字内容，不区分说话人",
  },
];

export function VideoInput({ onSubmit, isProcessing }: VideoInputProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TranscribeMode>("speaker");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim(), mode);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs text-teal-700">智能音频转写</span>
        </div>
        <h2 className="text-2xl mb-2 text-foreground">开始转写视频</h2>
        <p className="text-sm text-muted-foreground">支持 B 站视频链接或 BV 号</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 B 站链接或输入 BV 号，例如：BV1xx411c7mD"
            disabled={isProcessing}
            className="w-full h-14 pl-12 pr-32 rounded-xl border border-border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isProcessing ? "处理中..." : "开始转写"}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>示例:</span>
          <button
            type="button"
            onClick={() => setInput("BV1xx411c7mD")}
            className="hover:text-teal-600 transition-colors"
          >
            BV1xx411c7mD
          </button>
          <button
            type="button"
            onClick={() => setInput("https://www.bilibili.com/video/BV1xx411c7mD")}
            className="hover:text-teal-600 transition-colors"
          >
            完整链接
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-3">转写模式</p>
        <div className="grid grid-cols-2 gap-3">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-teal-500 bg-teal-50/60 shadow-sm"
                    : "border-border bg-white hover:border-teal-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected
                    ? "bg-teal-100"
                    : "bg-gray-50"
                }`}>
                  <Icon className={`w-5 h-5 ${selected ? "text-teal-600" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium mb-0.5 ${selected ? "text-teal-700" : "text-foreground"}`}>
                    {opt.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{opt.description}</div>
                </div>
                {selected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
