import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, FileImage, AlertCircle, CheckCircle2, Palette, Brush, Eraser, Undo, Trash2, Save, Sparkles, Heart, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DrawingAnalysis {
  overall_impression?: string;
  // EMOTION 타입
  color_emotion?: string;
  shape_analysis?: string;
  emotional_flow?: string;
  positive_aspects?: string;
  // DREAM 타입
  dream_symbols?: string;
  goal_direction?: string;
  positive_energy?: string;
  feasibility?: string;
  // ABSTRACT 타입
  line_flow?: string;
  color_harmony?: string;
  space_usage?: string;
  inner_expression?: string;
  // WEATHER 타입
  weather_symbol?: string;
  nature_elements?: string;
  mood_change?: string;
  season_time?: string;
  // 공통
  psychological_state: string;
  recommendations: string[];
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

export const DrawingAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [testType, setTestType] = useState<'EMOTION' | 'DREAM' | 'ABSTRACT' | 'WEATHER'>('EMOTION');
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
    EMOTION: {
      title: '감정 표현 그림',
      instructions: [
        '1. 현재 느끼는 감정을 색과 형태로 표현해주세요',
        '2. 추상적이어도 괜찮습니다',
        '3. 편안한 마음으로 자유롭게 그려주세요',
        '※ 정답은 없습니다. 마음 가는 대로 표현하세요'
      ]
    },
    DREAM: {
      title: '꿈과 희망 그림',
      instructions: [
        '1. 미래의 꿈이나 희망을 그림으로 표현해주세요',
        '2. 이루고 싶은 모습이나 상황을 그려주세요',
        '3. 긍정적인 에너지를 담아주세요',
        '※ 상상력을 마음껏 펼쳐보세요'
      ]
    },
    ABSTRACT: {
      title: '추상 표현 그림',
      instructions: [
        '1. 선과 색으로 내면을 추상적으로 표현해주세요',
        '2. 구체적인 형태가 아니어도 됩니다',
        '3. 직관에 따라 자유롭게 그려주세요',
        '※ 무의식적인 표현을 존중합니다'
      ]
    },
    WEATHER: {
      title: '날씨 감정 그림',
      instructions: [
        '1. 지금 마음을 날씨나 자연으로 표현해주세요',
        '2. 계절, 시간, 날씨를 자유롭게 선택하세요',
        '3. 자연의 요소들을 활용해주세요',
        '※ 맑음, 흐림, 비, 눈 등 모든 날씨가 좋습니다'
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
          창작형 그림 표현을 AI가 심리학적 관점으로 분석합니다
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 검사 유형 선택 */}
        <div>
          <label className="text-sm font-medium mb-2 block">검사 유형 선택</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'EMOTION', label: '💗 감정 표현', icon: Heart },
              { value: 'DREAM', label: '✨ 꿈과 희망', icon: Sparkles },
              { value: 'ABSTRACT', label: '🎨 추상 표현', icon: Palette },
              { value: 'WEATHER', label: '☁️ 날씨 감정', icon: Cloud }
            ].map((type) => (
              <Button
                key={type.value}
                variant={testType === type.value ? 'default' : 'outline'}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => {
                  setTestType(type.value as any);
                  setAnalysis(null);
                }}
              >
                <span className="text-lg">{type.label.split(' ')[0]}</span>
                <span className="text-xs">{type.label.split(' ').slice(1).join(' ')}</span>
              </Button>
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

            {/* 감정 표현 그림 분석 */}
            {analysis.color_emotion && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">색상 감정 분석</h4>
                    <p className="text-sm text-muted-foreground">{analysis.color_emotion}</p>
                  </div>
                  {analysis.shape_analysis && (
                    <div>
                      <h4 className="font-medium mb-1">형태 분석</h4>
                      <p className="text-sm text-muted-foreground">{analysis.shape_analysis}</p>
                    </div>
                  )}
                  {analysis.emotional_flow && (
                    <div>
                      <h4 className="font-medium mb-1">감정의 흐름</h4>
                      <p className="text-sm text-muted-foreground">{analysis.emotional_flow}</p>
                    </div>
                  )}
                  {analysis.positive_aspects && (
                    <div>
                      <h4 className="font-medium mb-1">긍정적 요소</h4>
                      <p className="text-sm text-muted-foreground">{analysis.positive_aspects}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 꿈과 희망 그림 분석 */}
            {analysis.dream_symbols && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">꿈의 상징 분석</h4>
                    <p className="text-sm text-muted-foreground">{analysis.dream_symbols}</p>
                  </div>
                  {analysis.goal_direction && (
                    <div>
                      <h4 className="font-medium mb-1">목표 방향성</h4>
                      <p className="text-sm text-muted-foreground">{analysis.goal_direction}</p>
                    </div>
                  )}
                  {analysis.positive_energy && (
                    <div>
                      <h4 className="font-medium mb-1">긍정 에너지</h4>
                      <p className="text-sm text-muted-foreground">{analysis.positive_energy}</p>
                    </div>
                  )}
                  {analysis.feasibility && (
                    <div>
                      <h4 className="font-medium mb-1">실현 가능성</h4>
                      <p className="text-sm text-muted-foreground">{analysis.feasibility}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 추상 표현 그림 분석 */}
            {analysis.line_flow && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">선의 흐름</h4>
                    <p className="text-sm text-muted-foreground">{analysis.line_flow}</p>
                  </div>
                  {analysis.color_harmony && (
                    <div>
                      <h4 className="font-medium mb-1">색상의 조화</h4>
                      <p className="text-sm text-muted-foreground">{analysis.color_harmony}</p>
                    </div>
                  )}
                  {analysis.space_usage && (
                    <div>
                      <h4 className="font-medium mb-1">공간 활용</h4>
                      <p className="text-sm text-muted-foreground">{analysis.space_usage}</p>
                    </div>
                  )}
                  {analysis.inner_expression && (
                    <div>
                      <h4 className="font-medium mb-1">내면의 표현</h4>
                      <p className="text-sm text-muted-foreground">{analysis.inner_expression}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 날씨 감정 그림 분석 */}
            {analysis.weather_symbol && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">날씨 상징 분석</h4>
                    <p className="text-sm text-muted-foreground">{analysis.weather_symbol}</p>
                  </div>
                  {analysis.nature_elements && (
                    <div>
                      <h4 className="font-medium mb-1">자연 요소</h4>
                      <p className="text-sm text-muted-foreground">{analysis.nature_elements}</p>
                    </div>
                  )}
                  {analysis.mood_change && (
                    <div>
                      <h4 className="font-medium mb-1">분위기 변화</h4>
                      <p className="text-sm text-muted-foreground">{analysis.mood_change}</p>
                    </div>
                  )}
                  {analysis.season_time && (
                    <div>
                      <h4 className="font-medium mb-1">계절과 시간</h4>
                      <p className="text-sm text-muted-foreground">{analysis.season_time}</p>
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
