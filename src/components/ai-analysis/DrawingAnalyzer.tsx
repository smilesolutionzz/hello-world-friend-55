import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileImage, AlertCircle, CheckCircle2, Palette, Brush, Eraser, Undo, Trash2, Save, Sparkles } from 'lucide-react';
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
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [image3D, setImage3D] = useState<string | null>(null);
  const { toast } = useToast();

  const testGuides = {
    HTP: {
      title: 'HTP (집-나무-사람) 검사',
      instructions: [
        '1. 먼저 집을 그려주세요',
        '2. 그 다음 나무를 그려주세요',
        '3. 마지막으로 사람을 그려주세요',
        '※ 시간 제한 없이 편안하게 그려주시면 됩니다'
      ]
    },
    KFD: {
      title: 'KFD (동적 가족화) 검사',
      instructions: [
        '1. 가족이 함께 무언가를 하고 있는 모습을 그려주세요',
        '2. 본인을 포함한 가족 구성원을 모두 그려주세요',
        '3. 각자 무엇을 하고 있는지 표현해주세요',
        '※ 막대 인간이 아닌 전신 인물로 그려주세요'
      ]
    },
    FREE: {
      title: '자유 그림 검사',
      instructions: [
        '1. 원하는 주제를 자유롭게 그려주세요',
        '2. 색상과 표현 방식도 자유롭게 선택하세요',
        '3. 편안한 마음으로 그려주시면 됩니다',
        '※ 떠오르는 대로 자유롭게 표현하세요'
      ]
    }
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 현재 상태 저장 (실행취소용)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory(prev => [...prev, imageData]);

    setIsDrawing(true);
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? 'white' : drawingColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setDrawingHistory([]);
    setAnalysis(null);
  };

  const undoDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawingHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastState = drawingHistory[drawingHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setDrawingHistory(prev => prev.slice(0, -1));
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    setSelectedImage(imageData);
    
    toast({
      title: '그림 저장 완료',
      description: '이제 분석 버튼을 눌러주세요'
    });
  };

  const handleAnalyze = async () => {
    let imageToAnalyze = selectedImage;

    // 직접 그리기 모드인 경우 캔버스에서 이미지 가져오기
    if (mode === 'draw' && !selectedImage) {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast({
          title: '그림을 먼저 그려주세요',
          variant: 'destructive'
        });
        return;
      }
      imageToAnalyze = canvas.toDataURL('image/png');
      setSelectedImage(imageToAnalyze);
    }

    if (!imageToAnalyze) {
      toast({
        title: mode === 'draw' ? '그림을 먼저 그려주세요' : '이미지를 먼저 업로드해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-drawing', {
        body: { imageData: imageToAnalyze, testType }
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

  const handleConvertTo3D = async () => {
    let imageToConvert = selectedImage;

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast({
          title: '캔버스를 찾을 수 없습니다',
          variant: 'destructive'
        });
        return;
      }
      imageToConvert = canvas.toDataURL('image/png');
    }

    if (!imageToConvert) {
      toast({
        title: mode === 'draw' ? '그림을 먼저 그려주세요' : '이미지를 먼저 업로드해주세요',
        variant: 'destructive'
      });
      return;
    }

    setIsConverting(true);
    setImage3D(null);

    try {
      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: { imageData: imageToConvert }
      });

      if (error) throw error;

      if (data.success && data.image3D) {
        setImage3D(data.image3D);
        toast({
          title: '3D 변환 완료! ✨',
          description: '그림이 멋진 3D 이미지로 변환되었습니다.'
        });
      } else {
        throw new Error(data.error || '3D 변환에 실패했습니다');
      }
    } catch (error) {
      console.error('3D 변환 오류:', error);
      toast({
        title: '3D 변환 실패',
        description: error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsConverting(false);
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
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'HTP', label: 'HTP (집-나무-사람)' },
              { value: 'KFD', label: 'KFD (동적 가족화)' },
              { value: 'FREE', label: '자유 그림' }
            ].map((type) => (
              <Badge
                key={type.value}
                variant={testType === type.value ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setTestType(type.value as any);
                  setAnalysis(null);
                }}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 검사 가이드 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2 text-sm">{testGuides[testType].title}</h4>
            <ul className="space-y-1">
              {testGuides[testType].instructions.map((instruction, idx) => (
                <li key={idx} className="text-xs text-muted-foreground">
                  {instruction}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 그리기 모드 선택 */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Brush className="h-4 w-4" />
              직접 그리기
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              이미지 업로드
            </TabsTrigger>
          </TabsList>

          {/* 직접 그리기 탭 */}
          <TabsContent value="draw" className="space-y-4">
            {/* 그리기 도구 */}
            <div className="flex gap-2 flex-wrap items-center">
              <Button
                variant={tool === 'pen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('pen')}
              >
                <Brush className="h-4 w-4 mr-1" />
                펜
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
              >
                <Eraser className="h-4 w-4 mr-1" />
                지우개
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer"
                />
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-muted-foreground">{brushSize}px</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={undoDrawing}
                disabled={drawingHistory.length === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* 캔버스 */}
            <div className="border-2 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </TabsContent>

          {/* 이미지 업로드 탭 */}
          <TabsContent value="upload">
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
          </TabsContent>
        </Tabs>

        {/* 분석 버튼 */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 분석 중...
            </>
          ) : (
            <>
              <Palette className="mr-2 h-4 w-4" />
              그림 분석 시작
            </>
          )}
        </Button>

        {/* 3D 변환 버튼 */}
        <Button 
          onClick={handleConvertTo3D} 
          disabled={isConverting || (!selectedImage && mode === 'upload')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
          variant="default"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              3D 변환 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              그림을 3D로 변환하기 ✨
            </>
          )}
        </Button>

        {/* 3D 변환 결과 */}
        {image3D && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Sparkles className="h-5 w-5" />
                3D 변환 결과
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                당신의 그림이 멋진 3D 이미지로 변환되었습니다!
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative group">
                <img 
                  src={image3D} 
                  alt="3D 변환 결과" 
                  className="w-full rounded-lg shadow-xl hover:shadow-2xl transition-shadow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image3D;
                    link.download = '3d-converted-drawing.png';
                    link.click();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  3D 이미지 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
