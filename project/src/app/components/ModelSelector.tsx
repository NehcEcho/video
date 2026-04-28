import { Brain, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Model {
  id: string;
  name: string;
  description: string;
  speed: string;
  accuracy: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  customModels: Model[];
}

export function ModelSelector({ selectedModel, onModelChange, customModels }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const models: Model[] = [
    {
      id: "yunwu-whisper-large-v3",
      name: "Whisper Large V3",
      description: "最高精度，适合专业转写",
      speed: "慢",
      accuracy: "99%",
    },
    {
      id: "yunwu-whisper-medium",
      name: "Whisper Medium",
      description: "平衡速度与精度",
      speed: "中",
      accuracy: "95%",
    },
    {
      id: "yunwu-whisper-small",
      name: "Whisper Small",
      description: "快速处理，适合草稿",
      speed: "快",
      accuracy: "90%",
    },
    ...customModels,
  ];

  const selected = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-xl border border-border p-4 hover:border-teal-300 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{selected.name}</div>
              <div className="text-xs text-muted-foreground">{selected.description}</div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border shadow-xl z-20 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full p-4 hover:bg-teal-50 transition-colors text-left border-b border-border last:border-b-0 ${
                model.id === selectedModel ? "bg-teal-50/50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm text-foreground">{model.name}</div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-xs text-blue-700">
                    速度: {model.speed}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-xs text-teal-700">
                    准确率: {model.accuracy}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
