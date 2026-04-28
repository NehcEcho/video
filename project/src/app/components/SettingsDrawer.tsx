import { useState, useEffect } from "react";
import { X, Key, Brain, Zap, ChevronDown, Mic, Sparkles, Lock } from "lucide-react";
import { getApiKey, saveApiKey, getModel, saveModel } from "@/services/storage";

const EXTRACT_MODEL = "Qwen/Qwen3-Omni-30B-A3B-Thinking";

const ANALYSIS_PRESETS = [
  { value: "Qwen/Qwen3-Omni-30B-A3B-Thinking", label: "Qwen3-Omni-30B (推荐)", desc: "多模态，综合能力强" },
  { value: "Qwen/Qwen3-235B-A22B-Thinking", label: "Qwen3-235B (最强文本)", desc: "推理能力最强，纯文本" },
  { value: "deepseek-ai/DeepSeek-V3", label: "DeepSeek-V3", desc: "通用模型，性价比高" },
  { value: "Qwen/Qwen3-30B-A3B", label: "Qwen3-30B (快速)", desc: "无推理链，响应快" },
];

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsDrawer({ isOpen, onClose, onSave }: SettingsDrawerProps) {
  const [apiKey, setApiKey] = useState("");
  const [analysisModel, setAnalysisModel] = useState("");
  const [customModel, setCustomModel] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey());
      const saved = getModel();
      setAnalysisModel(saved);
      setCustomModel(!ANALYSIS_PRESETS.some(p => p.value === saved));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPreset = ANALYSIS_PRESETS.find(p => p.value === analysisModel);

  const handleSave = () => {
    saveApiKey(apiKey);
    saveModel(analysisModel);
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

          {/* API Key */}
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
              {" "}获取，提取和分析都需要
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-medium text-foreground">模型配置</h3>
            </div>

            {/* 提取模型 - 固定 */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">提取/转写模型</span>
                <Lock className="w-3 h-3 text-gray-400 ml-auto" />
              </div>
              <div className="text-sm text-gray-700 font-mono">{EXTRACT_MODEL}</div>
              <div className="text-xs text-gray-400 mt-1">
                固定用于字幕提取和语音转写，支持文本+音频输入
              </div>
            </div>

            {/* 分析模型 - 可选 */}
            <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-lg border border-purple-100 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">分析/总结模型</span>
                <span className="text-[10px] text-purple-500 ml-auto">可自定义</span>
              </div>

              {!customModel ? (
                <div className="relative">
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="w-full bg-white rounded-lg border border-border p-2.5 hover:border-purple-300 transition-all text-left flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {selectedPreset?.label || analysisModel}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono">{analysisModel}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${showPresets ? "rotate-180" : ""}`} />
                  </button>

                  {showPresets && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-border shadow-lg z-30 overflow-hidden">
                      {ANALYSIS_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => { setAnalysisModel(p.value); setShowPresets(false); }}
                          className={`w-full p-2.5 hover:bg-teal-50 transition-colors text-left border-b border-border last:border-b-0 ${analysisModel === p.value ? "bg-teal-50/50" : ""}`}
                        >
                          <div className="text-sm font-medium text-foreground">{p.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                        </button>
                      ))}
                      <button
                        onClick={() => { setCustomModel(true); setShowPresets(false); }}
                        className="w-full p-2.5 hover:bg-teal-50 transition-colors text-left border-t border-border"
                      >
                        <div className="text-sm font-medium text-purple-600">+ 自定义模型</div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={analysisModel}
                    onChange={(e) => setAnalysisModel(e.target.value)}
                    placeholder="模型 ID"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-mono"
                  />
                  <button
                    onClick={() => { setCustomModel(false); setAnalysisModel(ANALYSIS_PRESETS[0].value); }}
                    className="text-xs text-teal-600 hover:underline mt-1.5 inline-block"
                  >
                    使用预设模型
                  </button>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                纯文本总结可用任意模型；如需音频分析请选多模态模型
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
                <span>输入 BV 号 → 自动提取字幕（无字幕则 Omni 模型转写）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-medium mt-0.5">2</span>
                <span>查看字幕 → 选择是否生成 AI 总结</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-medium mt-0.5">3</span>
                <span>点击「AI 视频总结」→ 用分析模型生成结构化总结</span>
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
