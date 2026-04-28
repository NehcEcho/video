import { Settings, History } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  onHistoryClick: () => void;
}

export function Header({ onSettingsClick, onHistoryClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">B站视频转文字</h1>
            <p className="text-xs text-muted-foreground">Bilibili Video Transcription</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onHistoryClick}
            className="h-9 px-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-sm text-foreground"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">历史记录</span>
          </button>
          <button
            onClick={onSettingsClick}
            className="h-9 px-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-sm text-foreground"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">设置</span>
          </button>
        </div>
      </div>
    </header>
  );
}
