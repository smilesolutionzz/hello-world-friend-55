import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Camera, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  preview: string;
  description: string;
  uploaded?: boolean;
  url?: string;
}

interface MediaUploaderProps {
  onMediaChange: (mediaFiles: MediaFile[]) => void;
  existingMedia?: MediaFile[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaChange, existingMedia = [] }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(existingMedia);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const generateFileId = () => Math.random().toString(36).substring(2, 15);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          title: "지원하지 않는 파일 형식",
          description: "이미지나 영상 파일만 업로드 가능합니다.",
          variant: "destructive"
        });
        return;
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "파일 크기는 50MB 이하여야 합니다.",
          variant: "destructive"
        });
        return;
      }

      const fileId = generateFileId();
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      const newMediaFile: MediaFile = {
        id: fileId,
        file,
        type: mediaType,
        preview,
        description: '',
        uploaded: false
      };

      setMediaFiles(prev => {
        const updated = [...prev, newMediaFile];
        onMediaChange(updated);
        return updated;
      });
    });

    // Reset input
    event.target.value = '';
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const updated = prev.filter(f => f.id !== id);
      onMediaChange(updated);
      return updated;
    });
  };

  const updateDescription = (id: string, description: string) => {
    setMediaFiles(prev => {
      const updated = prev.map(file =>
        file.id === id ? { ...file, description } : file
      );
      onMediaChange(updated);
      return updated;
    });
  };

  const uploadToSupabase = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('observation-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('observation-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const uploadAllFiles = async () => {
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('사용자 인증이 필요합니다.');

      const updatedFiles = await Promise.all(
        mediaFiles.map(async (mediaFile) => {
          if (mediaFile.uploaded) return mediaFile;
          
          try {
            const url = await uploadToSupabase(mediaFile.file, user.id);
            return { ...mediaFile, uploaded: true, url };
          } catch (error) {
            console.error('Upload failed for file:', mediaFile.id, error);
            return mediaFile;
          }
        })
      );

      setMediaFiles(updatedFiles);
      onMediaChange(updatedFiles);

      toast({
        title: "업로드 완료",
        description: "모든 미디어 파일이 성공적으로 업로드되었습니다."
      });

    } catch (error: any) {
      toast({
        title: "업로드 실패",
        description: error.message || "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          관찰 기록 미디어
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          관찰 상황의 사진이나 영상을 업로드하여 더 정확한 분석을 받아보세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-10 h-10 text-muted-foreground" />
            <div>
              <p className="font-medium">클릭하여 파일 선택</p>
              <p className="text-sm text-muted-foreground">
                이미지, 영상 파일 (최대 50MB)
              </p>
            </div>
          </label>
        </div>

        {/* Media Files List */}
        {mediaFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">업로드된 파일 ({mediaFiles.length})</h4>
              {mediaFiles.some(f => !f.uploaded) && (
                <Button
                  onClick={uploadAllFiles}
                  disabled={uploading}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    '모두 업로드'
                  )}
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {mediaFiles.map((mediaFile) => (
                <div
                  key={mediaFile.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {/* Preview */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {mediaFile.type === 'image' ? (
                      <img
                        src={mediaFile.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileVideo className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute top-1 right-1">
                      {mediaFile.uploaded ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      ) : (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* File info and description */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {mediaFile.type === 'image' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileVideo className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {mediaFile.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({(mediaFile.file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    </div>

                    <Textarea
                      placeholder="이 미디어에 대한 설명을 입력하세요 (관찰 상황, 중요한 포인트 등)"
                      value={mediaFile.description}
                      onChange={(e) => updateDescription(mediaFile.id, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMediaFile(mediaFile.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">💡 업로드 팁</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 관찰 대상자의 행동이 잘 보이는 각도로 촬영해주세요</li>
            <li>• 사진/영상에 대한 설명을 상세히 적어주시면 더 정확한 분석이 가능합니다</li>
            <li>• 개인정보 보호를 위해 얼굴이 직접 노출되지 않도록 주의해주세요</li>
            <li>• 지원 형식: JPG, PNG, MP4, MOV (최대 50MB)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;