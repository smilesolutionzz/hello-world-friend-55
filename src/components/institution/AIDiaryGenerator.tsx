import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Copy,
  RefreshCw
} from 'lucide-react';

interface SessionRecord {
  id: string;
  client_name: string;
  therapist_name: string;
  session_date: string;
  duration: number;
  voucher_type: string;
  session_notes: string;
  progress_notes: string;
  attendance_status: string;
  session_goals?: string;
  interventions?: string;
  observations?: string;
}

interface GeneratedDiary {
  id: string;
  voucherType: string;
  content: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  metadata: any;
  summary: any;
}

interface AIDiaryGeneratorProps {
  institutionId: string;
}

export function AIDiaryGenerator({ institutionId }: AIDiaryGeneratorProps) {
  const [sessionRecords] = useState<SessionRecord[]>([
    {
      id: '1',
      client_name: '김민수',
      therapist_name: '이선생',
      session_date: '2025-01-15',
      duration: 50,
      voucher_type: '언어발달지원',
      session_notes: '단어 카드를 활용한 어휘 확장 활동. 동물 이름 10개 학습',
      progress_notes: '이전 세션 대비 발음이 명확해짐. 자발적 표현 증가',
      attendance_status: '출석',
      session_goals: '명사 어휘 10개 이상 습득',
      observations: '집중력 향상, 적극적 참여',
      interventions: '시각적 자료 활용, 반복 연습'
    },
    {
      id: '2',
      client_name: '김민수',
      therapist_name: '이선생',
      session_date: '2025-01-17',
      duration: 50,
      voucher_type: '언어발달지원',
      session_notes: '그림책 읽기를 통한 문장 구성 연습',
      progress_notes: '2-3어절 문장 구성 가능. 문맥 이해도 향상',
      attendance_status: '출석',
      session_goals: '짧은 문장 만들기',
      observations: '이야기 순서 이해 능력 발달',
      interventions: '반복적 질문과 응답 유도'
    },
  ]);

  const [generatedDiaries, setGeneratedDiaries] = useState<GeneratedDiary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportForm, setReportForm] = useState({
    voucher_type: '',
    period_start: '',
    period_end: '',
    report_style: 'detailed' as 'detailed' | 'concise' | 'professional'
  });

  const { toast } = useToast();

  const voucherTypes = [
    { id: '언어발달지원', name: '언어발달지원', category: '정부바우처' },
    { id: '발달재활서비스', name: '발달재활서비스', category: '정부바우처' },
    { id: '교육청서비스', name: '교육청서비스', category: '교육청' },
    { id: '지역사회서비스', name: '지역사회서비스', category: '지역바우처' },
  ];

  const reportStyles = [
    { value: 'detailed', label: '상세형', description: '모든 내용을 자세히 기록' },
    { value: 'concise', label: '간결형', description: '핵심 내용만 요약' },
    { value: 'professional', label: '전문가형', description: '공식 보고서 형식' },
  ];

  const generateDiary = async () => {
    if (!reportForm.voucher_type || !reportForm.period_start || !reportForm.period_end) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 해당 기간의 세션 데이터 필터링
      const relevantSessions = sessionRecords.filter(session => 
        session.voucher_type === reportForm.voucher_type &&
        session.session_date >= reportForm.period_start &&
        session.session_date <= reportForm.period_end
      );

      if (relevantSessions.length === 0) {
        toast({
          title: "데이터 없음",
          description: "해당 기간에 세션 기록이 없습니다.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-diary-generator', {
        body: {
          voucherType: reportForm.voucher_type,
          sessionData: relevantSessions,
          periodStart: reportForm.period_start,
          periodEnd: reportForm.period_end,
          reportStyle: reportForm.report_style
        }
      });

      if (error) throw error;

      if (data?.success) {
        const newDiary: GeneratedDiary = {
          id: Date.now().toString(),
          voucherType: reportForm.voucher_type,
          content: data.content,
          periodStart: reportForm.period_start,
          periodEnd: reportForm.period_end,
          createdAt: new Date().toISOString(),
          metadata: data.metadata,
          summary: data.summary
        };

        setGeneratedDiaries([newDiary, ...generatedDiaries]);

        toast({
          title: "일지 생성 완료! 🎉",
          description: `${reportForm.voucher_type} 일지가 생성되었습니다.`,
        });
      }
    } catch (error) {
      console.error('일지 생성 오류:', error);
      toast({
        title: "생성 실패",
        description: "일지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "복사 완료",
      description: "일지 내용이 클립보드에 복사되었습니다.",
    });
  };

  const downloadDiary = (diary: GeneratedDiary) => {
    const element = document.createElement('a');
    const file = new Blob([diary.content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${diary.voucherType}_일지_${diary.periodStart}_${diary.periodEnd}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "다운로드 완료",
      description: "일지가 다운로드되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-primary" />
            AI 일지 자동생성
          </h2>
          <p className="text-slate-400">Claude AI가 전문적인 치료 일지를 자동으로 작성합니다</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          <Sparkles className="w-4 h-4 mr-1" />
          Claude Sonnet 4.5
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary">일지 생성</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary">생성 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">총 세션</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{sessionRecords.length}건</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">생성된 일지</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{generatedDiaries.length}개</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">지원 바우처</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{voucherTypes.length}개</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">평균 시간</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">50분</div>
              </CardContent>
            </Card>
          </div>

          {/* 일지 생성 폼 */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">새 일지 생성</CardTitle>
              <CardDescription className="text-slate-400">
                AI가 세션 데이터를 분석하여 전문적인 치료 일지를 자동으로 작성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voucher_type" className="text-slate-300">바우처 유형 *</Label>
                  <Select 
                    value={reportForm.voucher_type} 
                    onValueChange={(value) => setReportForm({...reportForm, voucher_type: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="바우처 유형 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {voucherTypes.map((voucher) => (
                        <SelectItem key={voucher.id} value={voucher.id} className="text-white">
                          {voucher.name} ({voucher.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report_style" className="text-slate-300">작성 스타일</Label>
                  <Select 
                    value={reportForm.report_style} 
                    onValueChange={(value: any) => setReportForm({...reportForm, report_style: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {reportStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value} className="text-white">
                          {style.label} - {style.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period_start" className="text-slate-300">시작일 *</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={reportForm.period_start}
                    onChange={(e) => setReportForm({...reportForm, period_start: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period_end" className="text-slate-300">종료일 *</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={reportForm.period_end}
                    onChange={(e) => setReportForm({...reportForm, period_end: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <Button 
                onClick={generateDiary} 
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI가 일지를 작성하고 있습니다...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    일지 생성하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {generatedDiaries.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-medium mb-2 text-white">생성된 일지가 없습니다</h3>
                <p className="text-slate-400">새로운 일지를 생성해 보세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {generatedDiaries.map((diary) => (
                <Card key={diary.id} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-white">{diary.voucherType}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {diary.periodStart} ~ {diary.periodEnd}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/20 text-primary">
                        {diary.summary.totalSessions}회 세션
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 요약 정보 */}
                    {diary.summary && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800 rounded-lg">
                        <div>
                          <p className="text-sm text-slate-400">출석률</p>
                          <p className="text-lg font-semibold text-white">{diary.summary.attendanceRate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">대상자</p>
                          <p className="text-lg font-semibold text-white">{diary.summary.uniqueClients}명</p>
                        </div>
                      </div>
                    )}

                    {/* 일지 내용 미리보기 */}
                    <div 
                      className="prose prose-sm max-w-none text-slate-300 bg-slate-800/50 p-4 rounded-lg max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: diary.content.substring(0, 500) + '...' }}
                    />

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(diary.content)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        복사
                      </Button>
                      <Button
                        onClick={() => downloadDiary(diary)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
