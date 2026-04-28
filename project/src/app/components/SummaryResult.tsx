import { Sparkles } from "lucide-react";

interface SummaryResultProps {
  summary: string;
  isStreaming?: boolean;
}

export function SummaryResult({ summary, isStreaming }: SummaryResultProps) {
  if (!summary && !isStreaming) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm overflow-hidden">
        <div className="border-b border-purple-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">AI 视频总结</h3>
            <p className="text-xs text-muted-foreground">
              {isStreaming ? "Qwen3-Omni 正在分析中..." : "由 Qwen3-Omni-30B-A3B-Thinking 生成"}
            </p>
          </div>
          {isStreaming && (
            <div className="ml-auto flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        <div className="p-6">
          {summary ? (
            <div
              className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">等待 AI 生成总结...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  html = html.replace(/\n\n/g, "</p><p class='mb-2'>");
  html = "<p class='mb-2'>" + html + "</p>";

  html = html.replace(/<p class='mb-2'><li/g, "<ul class='mb-3 space-y-1'><li");
  html = html.replace(/<\/li><\/p>/g, "</li></ul>");

  html = html.replace(/<p class='mb-2'><h/g, "<h");
  html = html.replace(/<\/h(\d)><\/p>/g, "</h$1>");

  return html;
}
