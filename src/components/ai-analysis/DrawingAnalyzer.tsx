import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileImage, AlertCircle, CheckCircle2, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DrawingAnalysis {
  overall_impression?: string;
  house_analysis?: string;
  tree_analysis?: string;
  person_analysis?: string;
  family_structure?: string;
  interaction_patterns?: string;
  emotional_tone?: string;
  color_analysis?: string;
  composition_analysis?: string;
  line_analysis?: string;
  content_analysis?: string;
  psychological_state: string;
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

export const DrawingAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [testType, setTestType] = useState<'HTP' | 'KFD' | 'FREE'>('HTP');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DrawingAnalysis | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: '이미지 파일만 업로드 가능합니다',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: '이미지를 먼저 업로드해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-drawing', {
        body: { imageData: selectedImage, testType }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: '분석 완료',
        description: '그림 심리 검사 분석이 완료되었습니다.'
      });
    } catch (error) {
      console.error('분석 오류:', error);
      toast({
        title: '분석 실패',
        description: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return '양호';
      case 'medium': return '주의';
      case 'high': return '위험';
      default: return '알 수 없음';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          그림 심리 검사 AI 분석
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          HTP, KFD 등 그림 검사를 AI가 자동으로 분석합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 검사 유형 선택 */}
        <div>
          <label className="text-sm font-medium mb-2 block">검사 유형 선택</label>
          <div className="flex gap-2">
            {[
              { value: 'HTP', label: 'HTP (집-나무-사람)' },
              { value: 'KFD', label: 'KFD (동적 가족화)' },
              { value: 'FREE', label: '자유 그림' }
            ].map((type) => (
              <Badge
                key={type.value}
                variant={testType === type.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setTestType(type.value as any)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="text-sm font-medium mb-2 block">그림 업로드</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="drawing-upload"
            />
            <label htmlFor="drawing-upload" className="cursor-pointer">
              {selectedImage ? (
                <div className="space-y-2">
                  <img 
                    src={selectedImage} 
                    alt="업로드된 그림" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">클릭하여 다른 이미지 선택</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 그림 이미지 업로드
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 분석 버튼 */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !selectedImage}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              그림 분석 시작
            </>
          )}
        </Button>

        {/* 분석 결과 */}
        {analysis && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">분석 결과</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  신뢰도: {Math.round(analysis.confidence * 100)}%
                </Badge>
                <Badge variant={analysis.risk_level === 'low' ? 'default' : 'destructive'}>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {getRiskLabel(analysis.risk_level)}
                </Badge>
              </div>
            </div>

            {analysis.overall_impression && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">전반적 인상</h4>
                  <p className="text-sm text-muted-foreground">{analysis.overall_impression}</p>
                </CardContent>
              </Card>
            )}

            {/* HTP 세부 분석 */}
            {analysis.house_analysis && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">집 분석</h4>
                    <p className="text-sm text-muted-foreground">{analysis.house_analysis}</p>
                  </div>
                  {analysis.tree_analysis && (
                    <div>
                      <h4 className="font-medium mb-1">나무 분석</h4>
                      <p className="text-sm text-muted-foreground">{analysis.tree_analysis}</p>
                    </div>
                  )}
                  {analysis.person_analysis && (
                    <div>
                      <h4 className="font-medium mb-1">사람 분석</h4>
                      <p className="text-sm text-muted-foreground">{analysis.person_analysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* KFD 세부 분석 */}
            {analysis.family_structure && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">가족 구조</h4>
                    <p className="text-sm text-muted-foreground">{analysis.family_structure}</p>
                  </div>
                  {analysis.interaction_patterns && (
                    <div>
                      <h4 className="font-medium mb-1">상호작용 패턴</h4>
                      <p className="text-sm text-muted-foreground">{analysis.interaction_patterns}</p>
                    </div>
                  )}
                  {analysis.emotional_tone && (
                    <div>
                      <h4 className="font-medium mb-1">정서적 분위기</h4>
                      <p className="text-sm text-muted-foreground">{analysis.emotional_tone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 자유 그림 분석 */}
            {analysis.color_analysis && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">색상 분석</h4>
                    <p className="text-sm text-muted-foreground">{analysis.color_analysis}</p>
                  </div>
                  {analysis.composition_analysis && (
                    <div>
                      <h4 className="font-medium mb-1">구도 분석</h4>
                      <p className="text-sm text-muted-foreground">{analysis.composition_analysis}</p>
                    </div>
                  )}
                  {analysis.line_analysis && (
                    <div>
                      <h4 className="font-medium mb-1">선 분석</h4>
                      <p className="text-sm text-muted-foreground">{analysis.line_analysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">심리 상태</h4>
                <p className="text-sm text-muted-foreground">{analysis.psychological_state}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  권장사항
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
