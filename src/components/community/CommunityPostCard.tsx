import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Camera, FileText, Play, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FactCheckBadge } from './FactCheckBadge';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface CommunityPost {
  id: string;
  type: 'observation' | 'concern' | 'general';
  title: string;
  content: string;
  media_urls?: string[];
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
  // 사용자 정보 (익명이 아닌 경우)
  user_name?: string;
  user_avatar?: string;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export default function CommunityPostCard({ post, onLike, onComment, onShare }: CommunityPostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'observation':
        return { label: '관찰일지', color: 'bg-blue-100 text-blue-800', icon: Camera };
      case 'concern':
        return { label: '고민상담', color: 'bg-orange-100 text-orange-800', icon: MessageCircle };
      default:
        return { label: '일반', color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const typeInfo = getTypeInfo(post.type);
  const TypeIcon = typeInfo.icon;

  const processMediaUrls = (urls?: string[]): MediaItem[] => {
    if (!urls || urls.length === 0) return [];
    
    return urls.map(url => ({
      url,
      type: url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') ? 'video' : 'image'
    }));
  };

  const mediaItems = processMediaUrls(post.media_urls);

  const displayContent = showFullContent || post.content.length <= 200 
    ? post.content 
    : `${post.content.substring(0, 200)}...`;

  const authorName = post.is_anonymous ? '익명' : (post.user_name || '사용자');
  const authorAvatar = post.is_anonymous ? undefined : post.user_avatar;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>
                {post.is_anonymous ? '익' : authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{authorName}</span>
                <Badge className={typeInfo.color}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeInfo.label}
                </Badge>
                <FactCheckBadge 
                  postId={post.id} 
                  postTitle={post.title} 
                  postContent={post.content}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ko 
                })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 제목 */}
        <h3 className="font-semibold text-lg">{post.title}</h3>

        {/* 내용 */}
        <div className="space-y-2">
          <p className="text-gray-700 whitespace-pre-wrap">{displayContent}</p>
          {post.content.length > 200 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="p-0 h-auto text-primary"
            >
              {showFullContent ? '접기' : '더보기'}
            </Button>
          )}
        </div>

        {/* 미디어 */}
        {mediaItems.length > 0 && (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              {mediaItems[selectedMediaIndex].type === 'image' ? (
                <img
                  src={mediaItems[selectedMediaIndex].url}
                  alt="게시글 이미지"
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <div className="relative">
                  <video
                    src={mediaItems[selectedMediaIndex].url}
                    controls
                    className="w-full max-h-96 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    동영상
                  </div>
                </div>
              )}
            </div>
            
            {/* 미디어 썸네일 네비게이션 */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {mediaItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedMediaIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={`썸네일 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(post.id)}
              className="flex items-center gap-2 text-muted-foreground hover:text-red-500"
            >
              <Heart className="w-4 h-4" />
              <span>{post.likes_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(post.id)}
              className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-2 text-muted-foreground hover:text-green-500"
          >
            <Share2 className="w-4 h-4" />
            공유
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}