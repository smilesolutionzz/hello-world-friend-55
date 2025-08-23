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
    console.log('=== Converting YouTube URL:', url);
    
    // YouTube 검색 결과 페이지인 경우 그대로 반환 (새 탭에서 열림)
    if (url.includes('youtube.com/results') || url.includes('search_query=')) {
      return url;
    }
    
    // URL에서 video ID 추출 (다양한 형식 지원)
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?.*v=)([^&\n?#]+)/
    ];
    
    let videoId = null;
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
      console.log('=== Converted to embed URL:', embedUrl);
      return embedUrl;
    }
    
    // 이미 embed URL인 경우 그대로 반환
    if (url.includes('youtube.com/embed/')) {
      console.log('=== Already embed URL');
      return url;
    }
    
    console.log('=== Could not convert URL, returning original');
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
          <DialogDescription className="sr-only">
            YouTube 동영상 플레이어에서 {title} 영상을 시청하세요
          </DialogDescription>
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