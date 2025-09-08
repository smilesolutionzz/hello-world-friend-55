import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Upload, Sparkles, X, Image, Video, FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GrowthStoryShareProps {
  onStoryShared?: () => void;
}

const GrowthStoryShare = ({ onStoryShared }: GrowthStoryShareProps) => {
  const [formData, setFormData] = useState({
    title: '',
    beforeStory: '',
    afterStory: '',
    category: 'personal',
    transformationDate: '',
    isAnonymous: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    url: string;
    type: 'image' | 'video';
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: 'personal', label: '개인 성장', color: 'bg-blue-100 text-blue-800' },
    { value: 'family', label: '가족 관계', color: 'bg-green-100 text-green-800' },
    { value: 'therapy', label: '치료 경험', color: 'bg-purple-100 text-purple-800' },
    { value: 'education', label: '교육/학습', color: 'bg-orange-100 text-orange-800' },
    { value: 'social', label: '사회성', color: 'bg-pink-100 text-pink-800' },
    { value: 'emotional', label: '감정 조절', color: 'bg-indigo-100 text-indigo-800' }
  ];

  // 파일 업로드 핸들러
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "로그인 필요",
          description: "파일을 업로드하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      const newFiles: Array<{ file: File; url: string; type: 'image' | 'video' }> = [];

      for (const file of Array.from(files)) {
        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "파일 크기 오류",
            description: `${file.name}은(는) 10MB를 초과합니다.`,
            variant: "destructive"
          });
          continue;
        }

        // 파일 타입 체크
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast({
            title: "파일 형식 오류",
            description: `${file.name}은(는) 지원하지 않는 형식입니다. 이미지 또는 비디오 파일만 업로드 가능합니다.`,
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('growth-stories')
          .upload(fileName, file);

        if (error) {
          console.error('파일 업로드 오류:', error);
          toast({
            title: "업로드 실패",
            description: `${file.name} 업로드 중 오류가 발생했습니다.`,
            variant: "destructive"
          });
          continue;
        }

        // 업로드된 파일의 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('growth-stories')
          .getPublicUrl(fileName);

        newFiles.push({
          file,
          url: publicUrl,
          type: isImage ? 'image' : 'video'
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (newFiles.length > 0) {
        toast({
          title: "업로드 완료",
          description: `${newFiles.length}개 파일이 성공적으로 업로드되었습니다.`,
        });
      }
    } catch (error: any) {
      console.error('파일 업로드 오류:', error);
      toast({
        title: "오류 발생",
        description: "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      event.target.value = '';
    }
  };

  // 파일 삭제 핸들러
  const handleFileRemove = async (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    try {
      // 스토리지에서 파일 삭제
      const fileName = fileToRemove.url.split('/').pop();
      if (fileName) {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const fullPath = `${user.user.id}/${fileName}`;
          await supabase.storage
            .from('growth-stories')
            .remove([fullPath]);
        }
      }
    } catch (error) {
      console.error('파일 삭제 오류:', error);
    }

    // 로컬 상태에서 제거
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.beforeStory.trim() || !formData.afterStory.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "로그인 필요",
          description: "성장 스토리를 공유하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      // 미디어 파일 정보 준비
      const mediaFiles = uploadedFiles.map(file => file.url);
      const mediaTypes = uploadedFiles.map(file => file.type);

      const { error } = await supabase
        .from('growth_stories')
        .insert({
          user_id: user.user.id,
          title: formData.title.trim(),
          before_story: formData.beforeStory.trim(),
          after_story: formData.afterStory.trim(),
          category: formData.category,
          transformation_date: formData.transformationDate || null,
          is_anonymous: formData.isAnonymous,
          media_files: mediaFiles,
          media_types: mediaTypes
        });

      if (error) throw error;

      toast({
        title: "성공!",
        description: "성장 스토리가 성공적으로 공유되었습니다. 다른 사람들에게 큰 힘이 될 거예요!",
      });

      // 폼 초기화
      setFormData({
        title: '',
        beforeStory: '',
        afterStory: '',
        category: 'personal',
        transformationDate: '',
        isAnonymous: true
      });
      setUploadedFiles([]);

      onStoryShared?.();

    } catch (error: any) {
      console.error('성장 스토리 공유 오류:', error);
      toast({
        title: "오류 발생",
        description: "스토리 공유 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          나의 성장 스토리 공유하기
        </CardTitle>
        <p className="text-gray-600 mt-2">
          당신의 변화와 성장 경험을 공유하여 다른 사람들에게 희망과 용기를 전해주세요
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              스토리 제목 *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="예: 불안장애를 극복한 나의 6개월 여정"
              className="w-full"
            />
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={formData.category === category.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.category === category.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 변화 시점 */}
          <div className="space-y-2">
            <Label htmlFor="transformationDate" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              변화가 시작된 시점 (선택사항)
            </Label>
            <Input
              id="transformationDate"
              type="date"
              value={formData.transformationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, transformationDate: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Before 스토리 */}
          <div className="space-y-2">
            <Label htmlFor="beforeStory" className="text-sm font-medium">
              변화 이전의 모습 *
            </Label>
            <Textarea
              id="beforeStory"
              value={formData.beforeStory}
              onChange={(e) => setFormData(prev => ({ ...prev, beforeStory: e.target.value }))}
              placeholder="어떤 어려움이나 문제가 있었나요? 그때의 감정이나 상황을 솔직하게 적어주세요."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* After 스토리 */}
          <div className="space-y-2">
            <Label htmlFor="afterStory" className="text-sm font-medium">
              변화 이후의 모습 *
            </Label>
            <Textarea
              id="afterStory"
              value={formData.afterStory}
              onChange={(e) => setFormData(prev => ({ ...prev, afterStory: e.target.value }))}
              placeholder="어떤 변화가 있었나요? 어떤 방법이 도움이 되었고, 지금은 어떤 기분인가요?"
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* 미디어 파일 업로드 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">사진/영상 추가 (선택사항)</Label>
            
            {/* 업로드 버튼 */}
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="media-upload"
                className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploading 
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-gray-600">업로드 중...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      이미지나 동영상을 선택하세요 (최대 10MB)
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* 업로드된 파일 미리보기 */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type === 'image' ? (
                      <div className="relative">
                        <img
                          src={file.url}
                          alt={`업로드된 이미지 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          src={file.url}
                          className="w-full h-24 object-cover rounded-lg"
                          controls={false}
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleFileRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 익명 설정 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="anonymous" className="text-sm font-medium">
                익명으로 공유하기
              </Label>
              <p className="text-xs text-gray-600">
                익명으로 공유하면 다른 사용자들에게 닉네임 대신 '익명'으로 표시됩니다
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
            />
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Heart className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">공유 전 참고사항</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• 개인정보나 민감한 정보는 제외해주세요</li>
                  <li>• 긍정적이고 건설적인 내용으로 작성해주세요</li>
                  <li>• 사진/영상은 개인정보가 노출되지 않도록 주의해주세요</li>
                  <li>• 공유된 스토리는 다른 사용자들의 희망이 됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                공유 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                성장 스토리 공유하기
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GrowthStoryShare;