import { Sparkles, Shield, Gauge, Download } from "lucide-react";

export function FeatureCards() {
  const features = [
    {
      icon: Sparkles,
      title: "AI 智能转写",
      description: "基于 yunwu.ai 先进语音识别技术",
      color: "teal",
    },
    {
      icon: Gauge,
      title: "极速处理",
      description: "平均 1 分钟音频仅需 3 秒",
      color: "cyan",
    },
    {
      icon: Shield,
      title: "隐私安全",
      description: "本地处理，数据不上传云端",
      color: "blue",
    },
    {
      icon: Download,
      title: "多格式导出",
      description: "支持 TXT、SRT、JSON 格式",
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="group bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-border p-5 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-6 h-6 text-${feature.color}-600`} />
            </div>
            <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}
