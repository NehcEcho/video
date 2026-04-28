import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface VideoInputProps {
  onSubmit: (input: string) => void;
  isProcessing: boolean;
}

export function VideoInput({ onSubmit, isProcessing }: VideoInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input.trim());
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
    </div>
  );
}
