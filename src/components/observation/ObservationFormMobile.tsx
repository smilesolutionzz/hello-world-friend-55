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
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
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
  template?: any;
  onBack: () => void;
  onSuccess?: (sessionId: string) => void;
  onSessionCreated?: () => void;
  templateType?: 'basic' | 'detailed' | string;
}

type FormState = 'idle' | 'validating' | 'uploading' | 'analyzing' | 'success' | 'error';

const ObservationForm: React.FC<ObservationFormProps> = ({ 
  template, 
  onBack, 
  onSuccess, 
  onSessionCreated,
  templateType = 'basic' 
}) => {
  console.log('템플릿 타입:', templateType, '템플릿:', template); // 디버깅용
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
  const isDetailedTemplate = templateType === 'detailed' || templateType === '2';
  const availableTags = isDetailedTemplate 
    ? ['정서', '행동', '인지', '사회성', '신체', '언어발달', '자기조절능력']
    : ['정서', '행동', '인지', '사회성', '신체'];
  
  // Content
  const [observationText, setObservationText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Detailed template fields
  const [detailedObservations, setDetailedObservations] = useState({
    specificBehaviors: '',
    environmentalFactors: '',
    socialInteractions: '',
    emotionalResponse: '',
    interventionEffects: ''
  });
  
  // Legal consent
  const [legalConsent, setLegalConsent] = useState(false);
  
  // Character count and validation  
  const textLength = observationText.trim().length;
  const detailedTextLength = Object.values(detailedObservations).join('').trim().length;
  const totalTextLength = isDetailedTemplate ? textLength + detailedTextLength : textLength;
  const minLength = 50; // 50자로 부담 줄임
  const isTextValid = totalTextLength >= minLength;
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('로그인이 필요합니다. 먼저 로그인해주세요.');
    }

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

      // 토큰 소모량 계산 (템플릿 타입에 따라)
      const tokenCost = isDetailedTemplate ? 5 : 3;
      
      // 현재 토큰 잔액 확인
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (tokenError || !tokenData || tokenData.current_tokens < tokenCost) {
        toast({
          title: "토큰 부족",
          description: `분석을 위해 ${tokenCost}개의 토큰이 필요합니다. 토큰을 충전해주세요.`,
          variant: "destructive"
        });
        setFormState('idle');
        return;
      }

      // Call the standardized observe-report function
      const { data, error } = await supabase.functions.invoke('observe-report', {
        body: {
          text: observationText,
          ageGroup,
          context,
          tags: selectedTags,
          files: uploadedFiles,
          mode: isDetailedTemplate ? 'detailed' : 'basic', // 템플릿 타입에 따라 모드 설정
          targetName,
          observationDate,
          templateType: templateType, // 템플릿 정보 추가
          tokenCost: tokenCost // 토큰 비용 전달
        }
      });

      if (error) throw error;

      if (!data.ok) {
        throw new Error(data.message || '분석 중 오류가 발생했습니다.');
      }

      // Save to database
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "로그인이 필요합니다",
          description: "관찰 데이터를 저장하려면 먼저 로그인해주세요.",
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
              로그인하기
            </Button>
          )
        });
        throw new Error('사용자 인증이 만료되었습니다.');
      }

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
        .insert({
          user_id: user.id,
          session_type: 'observation',
          observations: sessionPayload,
          summary: data.report.situation
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setFormState('success');
      
      toast({
        title: "분석 완료",
        description: "관찰 분석이 성공적으로 완료되었습니다.",
      });

      setTimeout(() => {
        // Call the success callback to show results in the parent component
        if (onSuccess) {
          onSuccess(session.id);
        } else if (onSessionCreated) {
          onSessionCreated();
        }
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error);
      setFormState('error');
      
      // 에러 타입에 따른 구체적인 메시지 제공
      let errorMessage = "관찰 분석 중 오류가 발생했습니다.";
      
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = "서버에서 요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message?.includes('토큰')) {
        errorMessage = error.message;
      } else if (error.message?.includes('최소') && error.message?.includes('자')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "AI 분석 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
    <div className="w-full max-w-lg mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">돌아가기</span>
          <span className="sm:hidden">뒤로</span>
        </Button>
        {renderStateIndicator()}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>진행률</span>
          <span>{Math.round((totalTextLength / minLength) * 100)}%</span>
        </div>
        <Progress value={Math.min((totalTextLength / minLength) * 100, 100)} />
        <div className="text-xs text-muted-foreground break-keep">
          최소 50자만 작성하면 됩니다 (부담 줄임!)
        </div>
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
          <CardTitle className="text-lg">
            {isDetailedTemplate ? '기본 관찰 내용 *' : '관찰 내용 *'}
          </CardTitle>
          {isDetailedTemplate && (
            <p className="text-sm text-muted-foreground">전반적인 관찰 상황을 간략히 기록해주세요.</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Textarea
                value={observationText}
                onChange={(e) => setObservationText(e.target.value)}
                placeholder={isDetailedTemplate 
                  ? "전반적인 관찰 상황을 간략히 기록해주세요."
                  : "관찰한 행동, 반응, 상황 등을 구체적으로 기록해주세요. (최소 50자)"
                }
                rows={isDetailedTemplate ? 4 : 6}
                className="resize-none flex-1"
              />
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = observationText;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  setObservationText(newValue);
                }}
                className="self-start mt-1"
              />
            </div>
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

      {/* Detailed Analysis Fields - Only for detailed template */}
      {isDetailedTemplate && (
        <div className="space-y-6">
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                🔍 상세 관찰 영역
              </CardTitle>
              <p className="text-sm text-muted-foreground">각 영역별로 간단히 체크하거나 메모해주세요</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-purple-700">주요 행동 관찰</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  어떤 행동을 보였나요? (예: 웃기, 울기, 뛰기, 그리기 등)
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={detailedObservations.specificBehaviors}
                    onChange={(e) => setDetailedObservations(prev => ({...prev, specificBehaviors: e.target.value}))}
                    placeholder="예: 친구와 함께 블록을 쌓으며 즐거워했음"
                    rows={2}
                    className="mt-2 resize-none border-purple-200 focus:border-purple-400 text-sm flex-1"
                  />
                  <VoiceInputButton 
                    onTranscription={(text) => {
                      const currentValue = detailedObservations.specificBehaviors;
                      const newValue = currentValue ? `${currentValue} ${text}` : text;
                      setDetailedObservations(prev => ({...prev, specificBehaviors: newValue}));
                    }}
                    className="self-start mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-purple-700">환경 영향</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  주변 환경이 어떤 영향을 주었나요?
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={detailedObservations.environmentalFactors}
                    onChange={(e) => setDetailedObservations(prev => ({...prev, environmentalFactors: e.target.value}))}
                    placeholder="예: 조용한 환경에서 집중력이 높아짐"
                    rows={2}
                    className="mt-2 resize-none border-purple-200 focus:border-purple-400 text-sm flex-1"
                  />
                  <VoiceInputButton 
                    onTranscription={(text) => {
                      const currentValue = detailedObservations.environmentalFactors;
                      const newValue = currentValue ? `${currentValue} ${text}` : text;
                      setDetailedObservations(prev => ({...prev, environmentalFactors: newValue}));
                    }}
                    className="self-start mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-purple-700">사람과의 상호작용</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  다른 사람과 어떻게 소통했나요?
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={detailedObservations.socialInteractions}
                    onChange={(e) => setDetailedObservations(prev => ({...prev, socialInteractions: e.target.value}))}
                    placeholder="예: 친구에게 먼저 말을 걸고 함께 놀자고 제안함"
                    rows={2}
                    className="mt-2 resize-none border-purple-200 focus:border-purple-400 text-sm flex-1"
                  />
                  <VoiceInputButton 
                    onTranscription={(text) => {
                      const currentValue = detailedObservations.socialInteractions;
                      const newValue = currentValue ? `${currentValue} ${text}` : text;
                      setDetailedObservations(prev => ({...prev, socialInteractions: newValue}));
                    }}
                    className="self-start mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-purple-700">감정 표현</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  어떤 감정을 보였나요?
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={detailedObservations.emotionalResponse}
                    onChange={(e) => setDetailedObservations(prev => ({...prev, emotionalResponse: e.target.value}))}
                    placeholder="예: 게임에서 지자 잠깐 속상해했지만 금새 괜찮아짐"
                    rows={2}
                    className="mt-2 resize-none border-purple-200 focus:border-purple-400 text-sm flex-1"
                  />
                  <VoiceInputButton 
                    onTranscription={(text) => {
                      const currentValue = detailedObservations.emotionalResponse;
                      const newValue = currentValue ? `${currentValue} ${text}` : text;
                      setDetailedObservations(prev => ({...prev, emotionalResponse: newValue}));
                    }}
                    className="self-start mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-purple-700">특별한 도움이나 변화</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  특별한 도움을 주었거나 변화가 있었나요? (선택사항)
                </p>
                <div className="flex gap-2">
                  <Textarea
                    value={detailedObservations.interventionEffects}
                    onChange={(e) => setDetailedObservations(prev => ({...prev, interventionEffects: e.target.value}))}
                    placeholder="예: 칭찬을 해주니 더 적극적으로 참여함 (없으면 비워도 됩니다)"
                    rows={2}
                    className="mt-2 resize-none border-purple-200 focus:border-purple-400 text-sm flex-1"
                  />
                  <VoiceInputButton 
                    onTranscription={(text) => {
                      const currentValue = detailedObservations.interventionEffects;
                      const newValue = currentValue ? `${currentValue} ${text}` : text;
                      setDetailedObservations(prev => ({...prev, interventionEffects: newValue}));
                    }}
                    className="self-start mt-2"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-950/20 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-700 dark:text-purple-300 font-medium">💡 상세 관찰 작성률</span>
                  <span className={`font-medium ${detailedTextLength >= 50 ? "text-green-600" : "text-orange-600"}`}>
                    {detailedTextLength}/50자 이상
                  </span>
                </div>
                <Progress value={Math.min((detailedTextLength / 50) * 100, 100)} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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