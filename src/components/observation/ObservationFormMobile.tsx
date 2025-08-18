import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Camera,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  preview: string;
  uploaded?: boolean;
  url?: string;
}

interface ObservationFormProps {
  onBack: () => void;
  onSuccess: (sessionId: string) => void;
}

type FormState = 'idle' | 'validating' | 'uploading' | 'analyzing' | 'success' | 'error';

const ObservationForm: React.FC<ObservationFormProps> = ({ onBack, onSuccess }) => {
  const { toast } = useToast();
  
  // Form state
  const [formState, setFormState] = useState<FormState>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Basic info
  const [targetName, setTargetName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'teen' | 'adult' | 'senior'>('child');
  const [context, setContext] = useState<'home' | 'institution' | 'therapy' | 'other'>('home');
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = ['정서', '행동', '인지', '사회성', '신체'];
  
  // Content
  const [observationText, setObservationText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Legal consent
  const [legalConsent, setLegalConsent] = useState(false);
  
  // Character count and validation
  const textLength = observationText.trim().length;
  const isTextValid = textLength >= 50;
  const canSubmit = isTextValid && selectedTags.length > 0 && legalConsent && targetName.trim();

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (mediaFiles.length + files.length > 3) {
      toast({
        title: "파일 개수 초과",
        description: "최대 3개의 파일만 업로드할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }

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

      // Check file size (50MB for video, 10MB for image)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "파일 크기 초과",
          description: `${file.type.startsWith('video/') ? '영상' : '이미지'}는 ${file.type.startsWith('video/') ? '50MB' : '10MB'} 이하여야 합니다.`,
          variant: "destructive"
        });
        return;
      }

      const fileId = Math.random().toString(36).substring(2, 15);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const preview = URL.createObjectURL(file);
      
      const newMediaFile: MediaFile = {
        id: fileId,
        file,
        type: mediaType,
        preview,
        uploaded: false
      };

      setMediaFiles(prev => [...prev, newMediaFile]);
    });

    // Reset input
    event.target.value = '';
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadMediaFiles = async (): Promise<{ url: string; type: 'image' | 'video' }[]> => {
    if (mediaFiles.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증이 필요합니다.');

    const uploadedFiles = await Promise.all(
      mediaFiles.map(async (mediaFile) => {
        if (mediaFile.uploaded) {
          return { url: mediaFile.url!, type: mediaFile.type };
        }
        
        try {
          const fileExt = mediaFile.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('observation-media')
            .upload(fileName, mediaFile.file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('observation-media')
            .getPublicUrl(data.path);

          return { url: urlData.publicUrl, type: mediaFile.type };
        } catch (error) {
          console.error('Upload failed for file:', mediaFile.id, error);
          throw error;
        }
      })
    );

    return uploadedFiles;
  };

  const checkForProhibitedContent = (text: string): boolean => {
    const prohibitedWords = ['응급', '자해', '폭력', '위험', '자살'];
    return prohibitedWords.some(word => text.includes(word));
  };

  const submitObservation = async () => {
    if (!canSubmit) return;

    try {
      setFormState('validating');
      
      // Check for prohibited content
      if (checkForProhibitedContent(observationText)) {
        toast({
          title: "내용 검토 필요",
          description: "응급상황이 의심되는 경우 즉시 전문의에게 상담하시기 바랍니다.",
          variant: "destructive"
        });
        setFormState('error');
        return;
      }

      setFormState('uploading');
      
      // Upload media files
      const uploadedFiles = await uploadMediaFiles();

      setFormState('analyzing');

      // Call the standardized observe-report function
      const { data, error } = await supabase.functions.invoke('observe-report', {
        body: {
          text: observationText,
          ageGroup,
          context,
          tags: selectedTags,
          files: uploadedFiles,
          mode: 'free', // This would be determined by subscription status
          targetName,
          observationDate
        }
      });

      if (error) throw error;

      if (!data.ok) {
        throw new Error(data.message || '분석 중 오류가 발생했습니다.');
      }

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증이 필요합니다.');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('프로필을 찾을 수 없습니다.');

      const sessionPayload = {
        profile_id: profile.id,
        session_name: `${targetName} 관찰 - ${observationDate}`,
        domain: 'general',
        observer_name: profile.display_name || '사용자',
        observation_period_start: observationDate,
        observation_period_end: observationDate,
        status: 'completed',
        raw_data: {
          text: observationText,
          tags: selectedTags,
          ageGroup,
          context,
          targetName
        },
        analysis_data: {
          report: data.report,
          score: data.score,
          scores: {
            [selectedTags[0] || '전체']: {
              average: data.score.overall / 20, // Convert 0-100 to 0-5
              total: data.score.overall,
              count: 1
            }
          }
        },
        ai_analysis: data.report.situation,
        recommendations: data.report.tips.map((tip: string, index: number) => ({
          title: `권고사항 ${index + 1}`,
          description: tip,
          priority: 'medium'
        })),
        media_files: uploadedFiles
      };

      const { data: session, error: saveError } = await supabase
        .from('observation_sessions')
        .insert(sessionPayload)
        .select()
        .single();

      if (saveError) throw saveError;

      setFormState('success');
      
      toast({
        title: "분석 완료",
        description: "관찰 분석이 성공적으로 완료되었습니다.",
      });

      setTimeout(() => {
        onSuccess(session.id);
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error);
      setFormState('error');
      toast({
        title: "제출 실패",
        description: error.message || "관찰 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const renderStateIndicator = () => {
    const states = {
      idle: { icon: FileText, text: "작성 중", color: "text-muted-foreground" },
      validating: { icon: Loader2, text: "검증 중", color: "text-blue-600" },
      uploading: { icon: Upload, text: "업로드 중", color: "text-orange-600" },
      analyzing: { icon: Loader2, text: "AI 리포팅 중...", color: "text-purple-600" },
      success: { icon: CheckCircle, text: "완료", color: "text-green-600" },
      error: { icon: AlertCircle, text: "오류", color: "text-red-600" }
    };

    const currentState = states[formState];
    const Icon = currentState.icon;
    
    return (
      <div className={`flex items-center gap-2 ${currentState.color}`}>
        <Icon className={`h-4 w-4 ${formState === 'validating' || formState === 'analyzing' ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{currentState.text}</span>
      </div>
    );
  };

  const renderProgressSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );

  if (formState === 'analyzing') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">AI 분석 진행 중</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  관찰 내용을 분석하고 있습니다...
                </p>
              </div>
            </div>
            {renderProgressSkeleton()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (formState === 'success') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">분석 완료!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  곧 결과 페이지로 이동합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        {renderStateIndicator()}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>진행률</span>
          <span>{Math.round((textLength / 50) * 100)}%</span>
        </div>
        <Progress value={Math.min((textLength / 50) * 100, 100)} />
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">기본정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="targetName">대상자 이름 *</Label>
            <Input
              id="targetName"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="관찰 대상자 이름"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageGroup">연령대 *</Label>
              <Select value={ageGroup} onValueChange={(value: any) => setAgeGroup(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">유아/아동</SelectItem>
                  <SelectItem value="teen">청소년</SelectItem>
                  <SelectItem value="adult">성인</SelectItem>
                  <SelectItem value="senior">노인</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observationDate">관찰 날짜</Label>
              <Input
                id="observationDate"
                type="date"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="context">상황 *</Label>
            <Select value={context} onValueChange={(value: any) => setContext(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">가정</SelectItem>
                <SelectItem value="institution">기관</SelectItem>
                <SelectItem value="therapy">치료실</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">관찰 영역 *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <Label
                  htmlFor={tag}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Observation Text */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">관찰 내용 *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="관찰한 행동, 반응, 상황 등을 구체적으로 기록해주세요. (최소 50자)"
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className={textLength < 50 ? "text-red-500" : "text-green-600"}>
                {textLength}/50자 이상
              </span>
              {textLength < 50 && (
                <span className="text-red-500">
                  {50 - textLength}자 더 입력하세요
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">미디어 첨부 (선택)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <Label
              htmlFor="media-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Camera className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">파일 선택</span>
                <p className="text-muted-foreground mt-1">
                  이미지 10MB, 영상 50MB (최대 3개)
                </p>
              </div>
            </Label>
          </div>

          {mediaFiles.length > 0 && (
            <div className="space-y-3">
              {mediaFiles.map((media) => (
                <div key={media.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    {media.type === 'image' ? (
                      <img src={media.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{media.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(media.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMediaFile(media.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="legal-consent"
              checked={legalConsent}
              onCheckedChange={(checked) => setLegalConsent(!!checked)}
            />
            <div className="space-y-1">
              <Label
                htmlFor="legal-consent"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                <ShieldCheck className="inline w-4 h-4 mr-1" />
                법적 고지사항 동의 *
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                본 결과는 참고용 관찰 기록이며 의학적 진단이 아닙니다. 
                전문적인 상담이 필요한 경우 해당 분야 전문의에게 문의하시기 바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={submitObservation}
        disabled={!canSubmit || formState !== 'idle'}
        className="w-full"
        size="lg"
      >
        {formState === 'idle' ? (
          canSubmit ? '관찰 분석 요청' : '입력 정보를 확인해주세요'
        ) : (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        {formState !== 'idle' && '처리 중...'}
      </Button>

      {!canSubmit && (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>제출하려면 다음을 완료해주세요:</p>
          <ul className="text-xs space-y-1">
            {!targetName.trim() && <li>• 대상자 이름 입력</li>}
            {selectedTags.length === 0 && <li>• 관찰 영역 선택</li>}
            {!isTextValid && <li>• 관찰 내용 50자 이상 입력</li>}
            {!legalConsent && <li>• 법적 고지사항 동의</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ObservationForm;