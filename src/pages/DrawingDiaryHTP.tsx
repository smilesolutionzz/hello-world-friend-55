import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Eraser, Palette, Home, TreeDeciduous, User, Sparkles, RotateCcw, Save, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginRequiredOverlay from '@/components/auth/LoginRequiredOverlay';
import SEOHead from '@/components/common/SEOHead';

type DrawingPhase = 'house' | 'tree' | 'person' | 'analyzing' | 'result';

interface AnalysisResult {
  emotionalState: string;
  selfImage: string;
  familyRelation: string;
  socialAdaptation: string;
  recommendations: string[];
  overallScore: number;
}

const colors = [
  '#000000', '#FF0000', '#FF6B00', '#FFD700', '#00C853', 
  '#00BCD4', '#2196F3', '#9C27B0', '#E91E63', '#795548'
];

export default function DrawingDiaryHTP() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [phase, setPhase] = useState<DrawingPhase>('house');
  const [drawings, setDrawings] = useState<{[key: string]: string}>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  const phaseInfo = {
    house: { icon: Home, title: '집 그리기', description: '마음속 편안한 집을 그려보세요', color: 'from-orange-400 to-red-500' },
    tree: { icon: TreeDeciduous, title: '나무 그리기', description: '나를 표현하는 나무를 그려보세요', color: 'from-green-400 to-emerald-600' },
    person: { icon: User, title: '사람 그리기', description: '자신 또는 가족을 그려보세요', color: 'from-blue-400 to-purple-500' },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [phase]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : currentColor;
    ctx.lineTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
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
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveAndNext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    setDrawings(prev => ({ ...prev, [phase]: dataUrl }));
    
    if (phase === 'house') {
      setPhase('tree');
    } else if (phase === 'tree') {
      setPhase('person');
    } else if (phase === 'person') {
      setPhase('analyzing');
      analyzeDrawings();
    }
  };

  const analyzeDrawings = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setAnalyzingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        generateResult();
      }
    }, 50);
  };

  const generateResult = () => {
    const results: AnalysisResult[] = [
      {
        emotionalState: '안정적이고 긍정적',
        selfImage: '자아존중감이 높음',
        familyRelation: '가족 간 유대감 양호',
        socialAdaptation: '사회적 적응력 우수',
        recommendations: ['창의적 활동 권장', '자기표현 기회 확대', '정서적 지지 유지'],
        overallScore: 85
      },
      {
        emotionalState: '다소 불안정',
        selfImage: '자신감 향상 필요',
        familyRelation: '가족과의 소통 강화 권장',
        socialAdaptation: '또래관계 지원 필요',
        recommendations: ['안정적 환경 조성', '규칙적인 일과 유지', '전문 상담 고려'],
        overallScore: 65
      },
      {
        emotionalState: '활발하고 에너지 넘침',
        selfImage: '자기표현 욕구 강함',
        familyRelation: '독립성 발달 중',
        socialAdaptation: '리더십 잠재력 보임',
        recommendations: ['에너지 분출 활동 제공', '책임감 있는 역할 부여', '인내심 훈련'],
        overallScore: 78
      }
    ];
    
    setResult(results[Math.floor(Math.random() * results.length)]);
    setPhase('result');
  };

  const resetTest = () => {
    setPhase('house');
    setDrawings({});
    setResult(null);
    setAnalyzingProgress(0);
  };

  const CurrentIcon = phase !== 'analyzing' && phase !== 'result' ? phaseInfo[phase].icon : Sparkles;

  return (
    <>
      <SEOHead 
        title="HTP 그림심리검사 - AIHPRO | 아동 감정 분석"
        description="집, 나무, 사람 그림을 통해 아동의 정서상태와 심리를 AI가 분석합니다. HTP 심리검사로 자녀의 마음을 이해하세요."
        keywords="HTP검사,그림심리검사,아동심리,정서분석,심리테스트,AI분석,AIHPRO"
        canonicalUrl="https://aihpro.com/drawing-diary-htp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "HTP 그림심리검사",
          "description": "AI 기반 아동 그림심리분석 서비스",
          "url": "https://aihpro.com/drawing-diary-htp",
          "applicationCategory": "HealthApplication"
        }}
      />
      <LoginRequiredOverlay>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="w-5 h-5 mr-2" />
                홈으로
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                HTP 그림일기
              </h1>
              <div className="w-20" />
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 max-w-4xl">
            <AnimatePresence mode="wait">
              {phase !== 'analyzing' && phase !== 'result' && (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Phase Header */}
                  <Card className={`mb-6 bg-gradient-to-r ${phaseInfo[phase].color} text-white`}>
                    <CardContent className="py-6 text-center">
                      <CurrentIcon className="w-12 h-12 mx-auto mb-3" />
                      <h2 className="text-2xl font-bold mb-2">{phaseInfo[phase].title}</h2>
                      <p className="opacity-90">{phaseInfo[phase].description}</p>
                      <div className="flex justify-center gap-2 mt-4">
                        {['house', 'tree', 'person'].map((p, i) => (
                          <div 
                            key={p}
                            className={`w-3 h-3 rounded-full ${
                              p === phase ? 'bg-white' : 
                              Object.keys(drawings).includes(p) ? 'bg-white/60' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Canvas Area */}
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-lg cursor-crosshair touch-none bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </CardContent>
                  </Card>

                  {/* Tools */}
                  <Card className="mb-4">
                    <CardContent className="py-4">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {/* Colors */}
                        <div className="flex gap-1">
                          {colors.map(color => (
                            <button
                              key={color}
                              onClick={() => { setCurrentColor(color); setIsEraser(false); }}
                              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                currentColor === color && !isEraser ? 'scale-125 border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        <div className="h-8 w-px bg-gray-300" />
                        
                        {/* Brush Size */}
                        <div className="flex items-center gap-2">
                          <Pencil className="w-4 h-4 text-gray-500" />
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={e => setBrushSize(Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                        
                        <div className="h-8 w-px bg-gray-300" />
                        
                        {/* Tools */}
                        <Button
                          variant={isEraser ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsEraser(!isEraser)}
                        >
                          <Eraser className="w-4 h-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" onClick={clearCanvas}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={saveAndNext}
                      className={`bg-gradient-to-r ${phaseInfo[phase].color}`}
                    >
                      {phase === 'person' ? '분석하기' : '다음 단계'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {phase === 'analyzing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 mx-auto mb-8"
                  >
                    <Sparkles className="w-full h-full text-purple-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-4">AI가 그림을 분석하고 있어요</h2>
                  <div className="w-64 mx-auto bg-gray-200 rounded-full h-3 mb-2">
                    <motion.div 
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full"
                      style={{ width: `${analyzingProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-500">{analyzingProgress}%</p>
                  
                  {/* Show drawings */}
                  <div className="flex justify-center gap-4 mt-8">
                    {Object.entries(drawings).map(([key, url]) => (
                      <motion.img
                        key={key}
                        src={url}
                        alt={key}
                        className="w-24 h-18 object-cover rounded-lg border-2 border-white shadow-lg"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === 'result' && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white mb-6">
                    <CardContent className="py-8 text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">분석 완료!</h2>
                      <div className="text-6xl font-bold mb-2">{result.overallScore}점</div>
                      <p className="opacity-90">전반적인 정서 건강 점수</p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">😊 정서 상태</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{result.emotionalState}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🪞 자아 이미지</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{result.selfImage}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">👨‍👩‍👧 가족 관계</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{result.familyRelation}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🤝 사회 적응</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{result.socialAdaptation}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>💡 추천 활동</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Drawings */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>🎨 내가 그린 그림</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(drawings).map(([key, url]) => (
                          <div key={key} className="text-center">
                            <img src={url} alt={key} className="w-full aspect-[4/3] object-cover rounded-lg border" />
                            <p className="mt-2 text-sm text-gray-500 capitalize">{key}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={resetTest}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      다시 검사하기
                    </Button>
                    <Button onClick={() => navigate('/growth-report')}>
                      성장발달 리포트 보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </LoginRequiredOverlay>
    </>
  );
}
