import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, VideoIcon, X, Upload, Send, Camera, FileText, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommunityPostFormProps {
  onPostCreated?: () => void;
  prefilledType?: 'observation' | 'concern' | 'general';
  prefilledTitle?: string;
  prefilledContent?: string;
  observationId?: string;
}

export default function CommunityPostForm({ 
  onPostCreated, 
  prefilledType = 'general',
  prefilledTitle = '',
  prefilledContent = '',
  observationId 
}: CommunityPostFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    type: prefilledType,
    title: prefilledTitle,
    content: prefilledContent,
    tags: [] as string[],
    isAnonymous: false,
    mediaFiles: [] as File[],
    mediaUrls: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isImage && !isVideo) {
        toast({
          title: "지원되지 않는 파일 형식",
          description: "이미지 또는 동영상 파일만 업로드할 수 있습니다.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "파일 크기 초과",
          description: "파일 크기는 10MB 이하여야 합니다.",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...validFiles]
    }));
  };

  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const uploadMediaFiles = async (): Promise<string[]> => {
    if (formData.mediaFiles.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증이 필요합니다');

    const uploadedUrls: string[] = [];
    
    for (const file of formData.mediaFiles) {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      setUploadingFiles(prev => [...prev, fileName]);
      
      try {
        const { data, error } = await supabase.storage
          .from('community-media')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('community-media')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        toast({
          title: "파일 업로드 실패",
          description: `${file.name} 업로드에 실패했습니다.`,
          variant: "destructive"
        });
      } finally {
        setUploadingFiles(prev => prev.filter(name => name !== fileName));
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "필수 항목 누락",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증이 필요합니다');

      // 미디어 파일 업로드
      const mediaUrls = await uploadMediaFiles();

      // 임시로 토스트 메시지로 대체 (데이터베이스 타입 업데이트 후 실제 구현)
      toast({
        title: "게시글 작성 완료",
        description: "커뮤니티 기능이 곧 정식 오픈됩니다!",
      });

      console.log('Community post data:', {
        type: formData.type,
        title: formData.title,
        content: formData.content,
        mediaUrls,
        tags: formData.tags,
        isAnonymous: formData.isAnonymous
      });

      // if (error) throw error;

      // 폼 초기화
      setFormData({
        type: 'general',
        title: '',
        content: '',
        tags: [],
        isAnonymous: false,
        mediaFiles: [],
        mediaUrls: []
      });

      onPostCreated?.();
      setFormData({
        type: 'general',
        title: '',
        content: '',
        tags: [],
        isAnonymous: false,
        mediaFiles: [],
        mediaUrls: []
      });

      onPostCreated?.();
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      toast({
        title: "게시글 작성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'observation': return <Camera className="w-4 h-4" />;
      case 'concern': return <Heart className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'observation': return '관찰일지 공유';
      case 'concern': return '고민 상담';
      default: return '일반 게시글';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          커뮤니티 게시글 작성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 게시글 타입 선택 */}
          <div className="space-y-2">
            <Label>게시글 유형</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'observation' | 'concern' | 'general') => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('general')}
                    {getTypeLabel('general')}
                  </div>
                </SelectItem>
                <SelectItem value="observation">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('observation')}
                    {getTypeLabel('observation')}
                  </div>
                </SelectItem>
                <SelectItem value="concern">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('concern')}
                    {getTypeLabel('concern')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="게시글 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="내용을 입력하세요..."
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.content.length}/2000
            </div>
          </div>

          {/* 미디어 첨부 */}
          <div className="space-y-3">
            <Label>사진/동영상 첨부</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  이미지 또는 동영상을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  최대 10MB, JPG, PNG, MP4, MOV 지원
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="media-upload"
                />
                <Label htmlFor="media-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    파일 선택
                  </Button>
                </Label>
              </div>
            </div>

            {/* 선택된 파일들 */}
            {formData.mediaFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">선택된 파일들:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <VideoIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileRemove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 태그 */}
          <div className="space-y-3">
            <Label>태그</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="태그 입력 후 엔터"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                maxLength={20}
              />
              <Button type="button" onClick={handleTagAdd} variant="outline">
                추가
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 익명 게시 옵션 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
            />
            <Label htmlFor="anonymous">익명으로 게시</Label>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || uploadingFiles.length > 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? '게시 중...' : '게시하기'}
            </Button>
          </div>

          {uploadingFiles.length > 0 && (
            <div className="text-sm text-muted-foreground">
              파일 업로드 중: {uploadingFiles.length}개
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}