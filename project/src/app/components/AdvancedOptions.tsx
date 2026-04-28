import { useState } from "react";
import { ChevronDown, Settings2, FileJson, Sliders } from "lucide-react";

export function AdvancedOptions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto px-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white rounded-xl border border-border p-4 hover:border-teal-300 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-foreground">高级选项</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="mt-2 bg-white rounded-xl border border-border p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                音频质量
              </label>
              <select className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm">
                <option>原始质量</option>
                <option>高质量 (192kbps)</option>
                <option>中等质量 (128kbps)</option>
                <option>低质量 (64kbps)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">
                输出格式
              </label>
              <select className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm">
                <option>纯文本 (.txt)</option>
                <option>字幕文件 (.srt)</option>
                <option>JSON 数据 (.json)</option>
                <option>Markdown (.md)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Sliders className="w-3.5 h-3.5" />
                说话人识别
              </label>
              <select className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm">
                <option>关闭</option>
                <option>自动检测</option>
                <option>2 位说话人</option>
                <option>3 位说话人</option>
                <option>4+ 位说话人</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <FileJson className="w-3.5 h-3.5" />
                提示词 (Prompt)
              </label>
              <input
                type="text"
                placeholder="例如: 专业术语、人名等"
                className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">过滤背景音乐</p>
                <p className="text-xs text-muted-foreground">尝试去除背景音乐噪声</p>
              </div>
              <button className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors">
                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">智能摘要</p>
                <p className="text-xs text-muted-foreground">生成内容摘要和关键词</p>
              </div>
              <button className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors">
                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-foreground">并行处理</p>
                <p className="text-xs text-muted-foreground">多任务同时转写（需要更多资源）</p>
              </div>
              <button className="relative w-11 h-6 bg-teal-500 rounded-full transition-colors">
                <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
