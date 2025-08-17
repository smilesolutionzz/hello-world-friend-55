import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  description: string;
  fileName?: string;
}

interface MediaDisplayProps {
  mediaFiles: MediaFile[];
  title?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ 
  mediaFiles = [], 
  title = "관찰 미디어" 
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoMuted, setVideoMuted] = useState<{ [key: string]: boolean }>({});

  const handleVideoPlay = (mediaId: string) => {
    setPlayingVideo(playingVideo === mediaId ? null : mediaId);
  };

  const toggleMute = (mediaId: string) => {
    setVideoMuted(prev => ({
      ...prev,
      [mediaId]: !prev[mediaId]
    }));
  };

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            업로드된 미디어가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{mediaFiles.length}개</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Media Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {mediaFiles.map((media) => (
              <div key={media.id} className="group relative">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted border">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.description || 'Observation media'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted={videoMuted[media.id] !== false}
                        autoPlay
                        loop
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleVideoPlay(media.id)}
                            className="bg-white/90 hover:bg-white"
                          >
                            {playingVideo === media.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleMute(media.id)}
                            className="bg-white/90 hover:bg-white"
                          >
                            {videoMuted[media.id] !== false ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {media.type === 'image' ? '이미지' : '영상'}
                    </Badge>
                  </div>

                  {/* View Full Button */}
                  <div className="absolute top-2 right-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                          onClick={() => setSelectedMedia(media)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        {selectedMedia && (
                          <div className="space-y-4">
                            <div className="aspect-video w-full rounded-lg overflow-hidden">
                              {selectedMedia.type === 'image' ? (
                                <img
                                  src={selectedMedia.url}
                                  alt={selectedMedia.description}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <video
                                  src={selectedMedia.url}
                                  controls
                                  className="w-full h-full"
                                />
                              )}
                            </div>
                            {selectedMedia.description && (
                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">설명</h4>
                                <p className="text-sm">{selectedMedia.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual & Behavioral Cues Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">🔍 시각·행동 단서</h4>
            <div className="space-y-3">
              {mediaFiles.map((media, index) => (
                <div key={media.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {media.type === 'image' ? '사진' : '영상'} {index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {media.description || '설명이 없습니다.'}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedMedia(media)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MediaDisplay;