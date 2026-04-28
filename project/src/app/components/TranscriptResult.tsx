import { useState } from "react";
import { Copy, Check, FileText, List } from "lucide-react";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface TranscriptResultProps {
  segments: TranscriptSegment[];
  fullText: string;
  label?: string;
}

export function TranscriptResult({ segments, fullText, label = "转写结果" }: TranscriptResultProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"full" | "segments">("full");

  const handleCopy = () => {
    const textToCopy = viewMode === "full" ? fullText : segments.map(s => `[${s.time}] ${s.text}`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-12">
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-foreground">{label}</h3>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-50 text-xs text-teal-700">
              <FileText className="w-3.5 h-3.5" />
              <span>{fullText.length} 字</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("full")}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  viewMode === "full"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                全文
              </button>
              <button
                onClick={() => setViewMode("segments")}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  viewMode === "segments"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5 inline mr-1.5" />
                分段
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="h-9 px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制文本</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {viewMode === "full" ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {fullText}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-20 pt-1">
                    <span className="inline-block px-2 py-1 rounded bg-muted text-xs text-muted-foreground font-mono">
                      {segment.time}
                    </span>
                  </div>
                  <p className="flex-1 text-foreground leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
