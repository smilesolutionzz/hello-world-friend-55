import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface YouTubePlayerProps {
  title: string;
  youtubeUrl: string;
  children: React.ReactNode;
}

// YouTube URL을 embed URL로 변환하는 함수
const getYouTubeEmbedUrl = (url: string): string => {
  try {
    // URL에서 video ID 추출
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const videoId = videoIdMatch?.[1];
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }
    
    // 이미 embed URL인 경우 그대로 반환
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return url;
  } catch (error) {
    console.error('YouTube URL 변환 실패:', error);
    return url;
  }
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ title, youtubeUrl, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogDescription className="sr-only">
          유튜브 동영상 플레이어
        </DialogDescription>
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold pr-8">
              {title}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubePlayer;