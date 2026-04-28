import { Play, Clock, User, Eye } from "lucide-react";

interface VideoInfo {
  bvid: string;
  title: string;
  author: string;
  duration: string;
  views: string;
  thumbnail: string;
}

interface VideoInfoCardProps {
  info: VideoInfo;
}

export function VideoInfoCard({ info }: VideoInfoCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 mb-8">
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex gap-4 p-4">
          <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-muted">
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-teal-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground mb-2 line-clamp-2">{info.title}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{info.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{info.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{info.views}</span>
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-teal-50 text-xs text-teal-700">
              <span className="font-mono">{info.bvid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
