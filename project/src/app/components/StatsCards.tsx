import { FileText, Clock, Zap, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalTranscripts: number;
  totalWords: number;
  totalDuration: string;
  avgSpeed: string;
}

export function StatsCards({ totalTranscripts, totalWords, totalDuration, avgSpeed }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-xs text-teal-600 font-medium">+12%</span>
        </div>
        <div className="text-2xl font-semibold text-foreground mb-1">{totalTranscripts}</div>
        <div className="text-xs text-muted-foreground">累计转写</div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-xs text-cyan-600 font-medium">本月</span>
        </div>
        <div className="text-2xl font-semibold text-foreground mb-1">{totalWords.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">总字数</div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs text-blue-600 font-medium">总时长</span>
        </div>
        <div className="text-2xl font-semibold text-foreground mb-1">{totalDuration}</div>
        <div className="text-xs text-muted-foreground">音频时长</div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs text-purple-600 font-medium">平均</span>
        </div>
        <div className="text-2xl font-semibold text-foreground mb-1">{avgSpeed}</div>
        <div className="text-xs text-muted-foreground">处理速度</div>
      </div>
    </div>
  );
}
