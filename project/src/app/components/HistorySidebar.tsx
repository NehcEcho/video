import { X, Clock, Trash2, FileText } from "lucide-react";
import type { HistoryEntry } from "@/services/storage";
import { clearHistory } from "@/services/storage";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryEntry[];
  onItemClick: (id: string) => void;
  onItemDelete: (id: string) => void;
}

function formatTimeAgo(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function HistorySidebar({ isOpen, onClose, items, onItemClick, onItemDelete }: HistorySidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-border shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="font-semibold text-foreground">历史记录</h2>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-xs text-teal-700">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">暂无历史记录</p>
              <p className="text-xs text-muted-foreground">转写的视频会自动保存在这里</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white hover:bg-accent border border-border rounded-lg p-4 transition-colors cursor-pointer"
                  onClick={() => onItemClick(item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{item.bvid}</span>
                        <span>·</span>
                        <span>{item.author}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-xs text-teal-700">
                          {item.subtitleText.length} 字
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemDelete(item.id);
                      }}
                      className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4">
            <button
              onClick={() => {
                clearHistory();
                onClose();
              }}
              className="w-full h-10 rounded-lg border border-border hover:bg-accent text-sm text-foreground transition-colors"
            >
              清空所有记录
            </button>
          </div>
        )}
      </div>
    </>
  );
}
