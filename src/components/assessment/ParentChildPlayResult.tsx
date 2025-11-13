import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Baby, Heart, Lightbulb, TrendingUp, Share2, Download, History, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import PlayActivityRecommendations from './PlayActivityRecommendations';
import GrowthReport from './GrowthReport';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ParentChildPlayResultProps {
  result: {
    style: string;
    title: string;
    description: string;
    scores: Record<string, number>;
    aiAnalysis?: string;
    ageGroup: string;
    childAge: number;
    cognitiveScore?: number;
    emotionalScore?: number;
    socialScore?: number;
    physicalScore?: number;
  };
}

const ParentChildPlayResult = ({ result }: ParentChildPlayResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const ageGroupLabels = {
    infant: '영아기 (0-2세)',
    child: '유아기 (3-6세)',
    school: '학령기 (7-12세)',
  };

  // 히스토리 데이터 불러오기
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('play_assessment_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setHistoryData(data || []);
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
    }
  };

  // AI 분석 결과 파싱
  const parseAIAnalysis = (analysis: string) => {
    const sections = {
      diagnosis: '',
      strengths: [] as string[],
      improvements: [] as string[],
      activities: [] as string[],
      guidelines: [] as string[]
    };

    if (!analysis) return sections;

    const lines = analysis.split('\n').filter(line => line.trim());
    let currentSection = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // 섹션 헤더 감지
      if (trimmedLine.match(/놀이\s*스타일\s*진단/) || (trimmedLine.startsWith('**') && trimmedLine.includes('스타일'))) {
        currentSection = 'diagnosis';
        // **로 감싸진 진단 내용 추출
        const diagnosisMatch = trimmedLine.match(/\*\*(.+?)\*\*/);
        if (diagnosisMatch) {
          sections.diagnosis = diagnosisMatch[1];
        }
      } else if (trimmedLine.match(/강점\s*\d*가지/)) {
        currentSection = 'strengths';
      } else if (trimmedLine.match(/개선|제안/)) {
        currentSection = 'improvements';
      } else if (trimmedLine.match(/놀이\s*활동/)) {
        currentSection = 'activities';
      } else if (trimmedLine.match(/지침|행동/)) {
        currentSection = 'guidelines';
      } else if (currentSection && (trimmedLine.startsWith('*') || trimmedLine.startsWith('-') || trimmedLine.startsWith('•'))) {
        // 리스트 항목 추출 (*, -, • 지원)
        let text = trimmedLine.replace(/^[*\-•]\s*/, '').trim();
        // ** 볼드 제거
        text = text.replace(/\*\*/g, '');
        
        if (text && text.length > 3) { // 너무 짧은 항목 제외
          switch (currentSection) {
            case 'strengths':
              sections.strengths.push(text);
              break;
            case 'improvements':
              sections.improvements.push(text);
              break;
            case 'activities':
              sections.activities.push(text);
              break;
            case 'guidelines':
              sections.guidelines.push(text);
              break;
          }
        }
      }
    });

    return sections;
  };

  const aiSections = result.aiAnalysis ? parseAIAnalysis(result.aiAnalysis) : null;

  // 발달 영역별 차트 데이터
  const developmentalData = [
    {
      domain: '인지',
      score: result.cognitiveScore || 0,
      fullMark: 100,
    },
    {
      domain: '정서',
      score: result.emotionalScore || 0,
      fullMark: 100,
    },
    {
      domain: '사회성',
      score: result.socialScore || 0,
      fullMark: 100,
    },
    {
      domain: '신체',
      score: result.physicalScore || 0,
      fullMark: 100,
    },
  ];

  // 히스토리 차트 데이터
  const historyChartData = historyData.map((item, index) => ({
    name: `${historyData.length - index}회`,
    인지: item.cognitive_score,
    정서: item.emotional_score,
    사회성: item.social_score,
    신체: item.physical_score,
  })).reverse();

  const handleShare = () => {
    const text = `부모아동 놀이성향 체크 결과\n\n스타일: ${result.title}\n${result.description}\n\n#부모아동놀이 #놀이성향 #양육`;
    if (navigator.share) {
      navigator.share({
        title: '부모아동 놀이성향 체크 결과',
        text: text,
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('result-content');
      if (!element) return;

      const opt = {
        margin: 10,
        filename: `놀이평가결과_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "다운로드 완료",
        description: "PDF 파일이 저장되었습니다.",
      });
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      toast({
        title: "다운로드 실패",
        description: "PDF 생성에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl" id="result-content">
        {/* 결과 헤더 */}
        <Card className="shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="text-center">
              <Baby className="w-16 h-16 mx-auto mb-4" />
              <CardTitle className="text-3xl mb-2">부모아동 놀이성향 분석 결과</CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {ageGroupLabels[result.ageGroup as keyof typeof ageGroupLabels]} · {result.childAge}세
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {result.title}
                </h2>
              </div>
              <p className="text-xl text-muted-foreground">{result.description}</p>
            </div>

            {/* 점수 분포 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {Object.entries(result.scores).map(([key, value]) => {
                const labels = {
                  collaborative: '협력적',
                  supportive: '지원적',
                  directive: '지시적',
                  observant: '관찰적'
                };
                return (
                  <div key={key} className="text-center p-4 bg-white rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                    <div className="text-sm text-muted-foreground">{labels[key as keyof typeof labels]}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 발달 영역별 차트 */}
        {(result.cognitiveScore || result.emotionalScore || result.socialScore || result.physicalScore) && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
                발달 영역별 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={developmentalData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {developmentalData.map((item) => (
                  <div key={item.domain} className="text-center p-4 bg-white rounded-lg shadow">
                    <div className="text-2xl font-bold text-indigo-600">{item.score}점</div>
                    <div className="text-sm text-muted-foreground">{item.domain} 발달</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 히스토리 차트 */}
        {historyData.length > 1 && (
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-6 h-6 text-cyan-500" />
                  평가 변화 추이
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? '숨기기' : '자세히'}
                </Button>
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="인지" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="정서" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="사회성" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="신체" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            )}
          </Card>
        )}

        {/* 맞춤형 놀이 활동 추천 */}
        {(result.cognitiveScore && result.emotionalScore && result.socialScore && result.physicalScore) && (
          <PlayActivityRecommendations
            cognitiveScore={result.cognitiveScore}
            emotionalScore={result.emotionalScore}
            socialScore={result.socialScore}
            physicalScore={result.physicalScore}
            ageGroup={result.ageGroup}
            childAge={result.childAge}
          />
        )}

        {/* 성장 리포트 */}
        <GrowthReport childAge={result.childAge} ageGroup={result.ageGroup} />

        {/* AI 분석 결과 */}
        {aiSections && (
          <>
            {/* AI 진단 */}
            {aiSections.diagnosis && (
              <Card className="shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-blue-500" />
                    AI 전문가 진단
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-lg leading-relaxed">{aiSections.diagnosis}</p>
                </CardContent>
              </Card>
            )}

            {/* 강점 */}
            {aiSections.strengths.length > 0 && (
              <Card className="shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    놀이 스타일의 강점
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {aiSections.strengths.map((strength, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-green-500 font-bold">✓</span>
                        <span className="flex-1">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 개선 제안 */}
            {aiSections.improvements.length > 0 && (
              <Card className="shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-orange-500" />
                    더 나은 놀이를 위한 제안
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {aiSections.improvements.map((improvement, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-orange-500 font-bold">💡</span>
                        <span className="flex-1">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 맞춤 놀이 활동 */}
            {aiSections.activities.length > 0 && (
              <Card className="shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="w-6 h-6 text-purple-500" />
                    {result.childAge}세를 위한 추천 놀이 활동
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {aiSections.activities.map((activity, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-purple-500 font-bold">{index + 1}.</span>
                        <span className="flex-1">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* 구체적 행동 지침 */}
            {aiSections.guidelines.length > 0 && (
              <Card className="shadow-lg mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-blue-500" />
                    부모-자녀 관계 개선 지침
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {aiSections.guidelines.map((guideline, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-blue-500 font-bold">→</span>
                        <span className="flex-1">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Share2 className="w-4 h-4 mr-2" />
            결과 공유하기
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF 다운로드
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/assessment')}
          >
            다른 검사 하기
          </Button>
        </div>

        {/* 안내 문구 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ 안내:</strong> 이 결과는 참고 자료이며, 전문적인 진단이나 치료를 대체하지 않습니다. 
              더 자세한 상담이 필요하시면 전문가와 상담하시기를 권장합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentChildPlayResult;
