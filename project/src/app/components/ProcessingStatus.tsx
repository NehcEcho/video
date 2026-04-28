import { Check, Loader2 } from "lucide-react";

interface Step {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
}

interface ProcessingStatusProps {
  steps: Step[];
}

export function ProcessingStatus({ steps }: ProcessingStatusProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 mb-8">
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100 p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">处理进度</h3>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                step.status === "completed"
                  ? "bg-teal-500 text-white"
                  : step.status === "processing"
                  ? "bg-white border-2 border-teal-500"
                  : step.status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-white border-2 border-gray-200"
              }`}>
                {step.status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : step.status === "processing" ? (
                  <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                ) : step.status === "error" ? (
                  <span className="text-xs">!</span>
                ) : (
                  <span className="text-xs text-gray-400">{index + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <p className={`text-sm transition-colors ${
                  step.status === "processing"
                    ? "text-teal-700 font-medium"
                    : step.status === "completed"
                    ? "text-gray-600"
                    : step.status === "error"
                    ? "text-red-600"
                    : "text-gray-400"
                }`}>
                  {step.label}
                </p>
              </div>

              {step.status === "processing" && (
                <div className="flex-shrink-0">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
