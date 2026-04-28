import { Upload, Link2, Folder, Download } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: "upload", icon: Upload, label: "上传音频", description: "直接上传音频文件" },
    { id: "url", icon: Link2, label: "输入链接", description: "粘贴视频链接" },
    { id: "batch", icon: Folder, label: "批量处理", description: "一次处理多个视频" },
    { id: "export", icon: Download, label: "导出记录", description: "导出历史记录" },
  ];

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-medium text-foreground mb-4">快捷操作</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground mb-0.5">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
