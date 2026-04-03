import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import YouTubePlayer from '@/components/ui/youtube-player';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  youtubeUrl: string;
}

interface YouTubeRecommendationsProps {
  videos: YouTubeVideo[];
}

export const YouTubeRecommendations: React.FC<YouTubeRecommendationsProps> = ({ videos }) => {
  const { isEnglish } = useLanguage();

  if (!videos || videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Youtube className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-white">
              {isEnglish ? 'Recommended Videos' : '맞춤 추천 영상'}
            </h4>
            <p className="text-[10px] text-white/50">
              {isEnglish ? 'Curated content based on your analysis' : '분석 결과 기반 큐레이션 콘텐츠'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((video, index) => (
            <div
              key={video.videoId}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-red-500/40 transition-all group"
            >
              {/* Thumbnail with play overlay */}
              <YouTubePlayer title={video.title} youtubeUrl={video.youtubeUrl}>
                <div className="relative cursor-pointer aspect-video">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      YouTube
                    </span>
                  </div>
                </div>
              </YouTubePlayer>

              {/* Info */}
              <div className="p-3">
                <h5 className="text-xs md:text-sm font-semibold text-white line-clamp-2 mb-1.5 leading-snug">
                  {video.title}
                </h5>
                <p className="text-[10px] text-white/40 mb-2">{video.channelTitle}</p>
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isEnglish ? 'Watch on YouTube' : '유튜브에서 보기'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default YouTubeRecommendations;
