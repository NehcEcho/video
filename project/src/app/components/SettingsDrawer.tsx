import { useState, useEffect } from "react";
import { X, Key, Mic, Zap } from "lucide-react";
import { getApiKey, saveApiKey } from "@/services/storage";

const TRANS_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Thinking";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsDrawer({ isOpen, onClose, onSave }: SettingsDrawerProps) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(apiKey);
    onSave();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-border shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-foreground">设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-medium text-foreground">SiliconFlow API Key</h3>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              在{" "}
              <a href="https://cloud.siliconflow.cn/account/ak" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                SiliconFlow 控制台
              </a>
              {" "}获取，用于无字幕时的 AI 语音转写
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-medium text-foreground">转写模型</h3>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-700 font-mono">{TRANS_MODEL}</div>
              <div className="text-xs text-gray-400 mt-1">
                固定用于字幕提取和语音转写，支持文本+音频输入
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-medium text-foreground">工作流</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-medium mt-0.5">1</span>
                <span>输入 BV 号 → 自动提取字幕</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-medium mt-0.5">2</span>
                <span>有 CC 字幕 → 直接展示；无字幕 → AI 语音转写</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-medium mt-0.5">3</span>
                <span>复制字幕文本，可粘贴到任意 AI 工具做进一步分析</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-6 py-4 space-y-2">
          <button
            onClick={handleSave}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:shadow-lg hover:shadow-teal-500/25 text-white font-medium transition-all"
          >
            保存设置
          </button>
          <button onClick={onClose} className="w-full h-10 rounded-lg border border-border hover:bg-accent text-foreground transition-colors">
            取消
          </button>
        </div>
      </div>
    </>
  );
}
