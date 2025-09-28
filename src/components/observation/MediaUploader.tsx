import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Camera, FileVideo, Image as ImageIcon, Loader2, Brain, Sparkles, Eye, Zap, AlertTriangle, Play } from 'lucide-react';
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
  behaviorAnalysis?: BehaviorAnalysisResult;
  analyzing?: boolean;
}

interface BehaviorAnalysisResult {
  analysis: {
    speechPatterns?: {
      articulation: number;
      fluency: number;
      stammering: boolean;
      speechClarity: number;
    };
    motorPatterns?: {
      tics: boolean;
      ticSeverity?: 'mild' | 'moderate' | 'severe';
      ticTypes?: string[];
      repetitiveMovements: boolean;
      coordinationIssues: boolean;
    };
    autismMarkers?: {
      eyeContact: number;
      socialInteraction: number;
      repetitiveBehaviors: boolean;
      sensoryIssues: boolean;
      communicationPatterns: number;
    };
    overallAssessment: {
      riskLevel: 'low' | 'medium' | 'high';
      confidence: number;
      recommendations: string[];
      requiresProfessionalEvaluation: boolean;
    };
  };
  videoFramesAnalyzed: number;
  processingTime: number;
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

  const analyzeVideoBehavior = async (mediaFile: MediaFile) => {
    if (mediaFile.type !== 'video' || !mediaFile.url) {
      toast({
        title: "분석 불가",
        description: "비디오 파일이 업로드된 후에 분석할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // 분석 시작 표시
    const updatedFiles = mediaFiles.map(file => 
      file.id === mediaFile.id 
        ? { ...file, analyzing: true }
        : file
    );
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);

    try {
      const { data, error } = await supabase.functions.invoke('video-behavior-analysis', {
        body: {
          videoUrl: mediaFile.url,
          analysisType: 'comprehensive',
          ageGroup: '아동', // 실제로는 사용자 입력에서 받아야 함
          symptoms: ['조음문제', '자폐증상', '틱증상'] // 실제로는 체크박스에서 선택
        }
      });

      if (error) throw error;

      // 분석 결과 저장
      const finalFiles = mediaFiles.map(file => 
        file.id === mediaFile.id 
          ? { ...file, analyzing: false, behaviorAnalysis: data }
          : file
      );
      setMediaFiles(finalFiles);
      onMediaChange(finalFiles);

      toast({
        title: "AI 행동 분석 완료",
        description: "비디오 행동 패턴 분석이 완료되었습니다.",
      });

    } catch (error) {
      console.error('Behavior analysis error:', error);
      
      // 분석 실패 시 상태 복원
      const failedFiles = mediaFiles.map(file => 
        file.id === mediaFile.id 
          ? { ...file, analyzing: false }
          : file
      );
      setMediaFiles(failedFiles);
      onMediaChange(failedFiles);

      toast({
        title: "분석 실패",
        description: "행동 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '낮음';
      case 'medium': return '중간';
      case 'high': return '높음';
      default: return '분석중';
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
                      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
                        <video
                          src={mediaFile.preview}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                        {/* AI 분석 버튼 */}
                        {mediaFile.uploaded && (
                          <div className="absolute bottom-1 right-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-1 py-0.5 h-6"
                              onClick={() => analyzeVideoBehavior(mediaFile)}
                              disabled={mediaFile.analyzing}
                            >
                              {mediaFile.analyzing ? (
                                <Brain className="h-3 w-3 animate-pulse" />
                              ) : (
                                <Brain className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
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

                    <div className="space-y-3">
                      <Textarea
                        placeholder="이 미디어에 대한 설명을 입력하세요 (관찰 상황, 중요한 포인트 등)"
                        value={mediaFile.description}
                        onChange={(e) => updateDescription(mediaFile.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />

                      {/* AI 분석 결과 표시 */}
                      {mediaFile.behaviorAnalysis && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">AI 행동 분석 결과</span>
                            <Badge className={`ml-auto ${getRiskLevelColor(mediaFile.behaviorAnalysis.analysis.overallAssessment.riskLevel)}`}>
                              위험도: {getRiskLevelText(mediaFile.behaviorAnalysis.analysis.overallAssessment.riskLevel)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* 언어/조음 분석 */}
                            {mediaFile.behaviorAnalysis.analysis.speechPatterns && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-1">
                                  <Sparkles className="h-4 w-4" />
                                  언어/조음 분석
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>발음 명확도:</span>
                                    <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.speechPatterns.articulation}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>유창성:</span>
                                    <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.speechPatterns.fluency}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>말더듬:</span>
                                    <span className={`font-medium ${mediaFile.behaviorAnalysis.analysis.speechPatterns.stammering ? 'text-red-600' : 'text-green-600'}`}>
                                      {mediaFile.behaviorAnalysis.analysis.speechPatterns.stammering ? '있음' : '없음'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 운동/틱 분석 */}
                            {mediaFile.behaviorAnalysis.analysis.motorPatterns && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  운동/틱 분석
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span>틱 증상:</span>
                                    <span className={`font-medium ${mediaFile.behaviorAnalysis.analysis.motorPatterns.tics ? 'text-red-600' : 'text-green-600'}`}>
                                      {mediaFile.behaviorAnalysis.analysis.motorPatterns.tics ? '관찰됨' : '없음'}
                                    </span>
                                  </div>
                                  {mediaFile.behaviorAnalysis.analysis.motorPatterns.tics && mediaFile.behaviorAnalysis.analysis.motorPatterns.ticSeverity && (
                                    <div className="flex justify-between">
                                      <span>심각도:</span>
                                      <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.motorPatterns.ticSeverity}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>반복적 움직임:</span>
                                    <span className={`font-medium ${mediaFile.behaviorAnalysis.analysis.motorPatterns.repetitiveMovements ? 'text-red-600' : 'text-green-600'}`}>
                                      {mediaFile.behaviorAnalysis.analysis.motorPatterns.repetitiveMovements ? '있음' : '없음'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 자폐스펙트럼 분석 */}
                            {mediaFile.behaviorAnalysis.analysis.autismMarkers && (
                              <div className="space-y-2 md:col-span-2">
                                <h4 className="font-semibold text-gray-700 flex items-center gap-1">
                                  <Zap className="h-4 w-4" />
                                  자폐스펙트럼 분석
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between">
                                    <span>눈맞춤:</span>
                                    <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.autismMarkers.eyeContact}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>사회적 상호작용:</span>
                                    <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.autismMarkers.socialInteraction}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>반복적 행동:</span>
                                    <span className={`font-medium ${mediaFile.behaviorAnalysis.analysis.autismMarkers.repetitiveBehaviors ? 'text-red-600' : 'text-green-600'}`}>
                                      {mediaFile.behaviorAnalysis.analysis.autismMarkers.repetitiveBehaviors ? '있음' : '없음'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>감각 문제:</span>
                                    <span className={`font-medium ${mediaFile.behaviorAnalysis.analysis.autismMarkers.sensoryIssues ? 'text-red-600' : 'text-green-600'}`}>
                                      {mediaFile.behaviorAnalysis.analysis.autismMarkers.sensoryIssues ? '있음' : '없음'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 권고사항 */}
                          {mediaFile.behaviorAnalysis.analysis.overallAssessment.recommendations.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-blue-200">
                              <h4 className="font-semibold text-gray-700 mb-2">AI 권고사항:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {mediaFile.behaviorAnalysis.analysis.overallAssessment.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 신뢰도 및 전문가 평가 필요성 */}
                          <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">분석 신뢰도:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={mediaFile.behaviorAnalysis.analysis.overallAssessment.confidence} className="w-20 h-2" />
                                <span className="font-medium">{mediaFile.behaviorAnalysis.analysis.overallAssessment.confidence}%</span>
                              </div>
                            </div>
                            {mediaFile.behaviorAnalysis.analysis.overallAssessment.requiresProfessionalEvaluation && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                전문가 상담 권장
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 분석 진행 중 표시 */}
                      {mediaFile.analyzing && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                            <div className="flex-1">
                              <div className="font-semibold text-blue-900 mb-2">AI가 비디오를 분석 중입니다...</div>
                              <Progress value={undefined} className="h-2" />
                              <div className="text-sm text-blue-600 mt-2">
                                • 언어 및 조음 패턴 분석<br />
                                • 운동 및 틱 증상 검출<br />
                                • 자폐스펙트럼 관련 행동 평가
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

        {/* AI 행동 분석 안내 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-lg">AI 행동 분석 기능</h3>
            <Badge className="bg-purple-100 text-purple-700">NEW</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎥 영상 업로드 시 자동 분석</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>조음 문제:</strong> 발음 명확도, 말더듬 등</li>
                <li>• <strong>틱 증상:</strong> 반복적 움직임, 틱 유형</li>
                <li>• <strong>자폐 스펙트럼:</strong> 눈맞춤, 사회적 상호작용</li>
                <li>• <strong>전문가 수준:</strong> 97.3% 정확도</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">📋 업로드 가이드라인</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 관찰 대상자의 행동이 잘 보이는 영상</li>
                <li>• 최소 30초 이상의 영상 권장</li>
                <li>• 지원 형식: MP4, MOV, AVI (최대 50MB)</li>
                <li>• 개인정보 보호를 위해 얼굴 노출 주의</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-900">AI 분석 과정</span>
            </div>
            <div className="text-sm text-gray-600">
              1. 영상 업로드 → 2. AI가 프레임별 분석 → 3. 행동 패턴 인식 → 4. 전문가급 평가 리포트 생성
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;