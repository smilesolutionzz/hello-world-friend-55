import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Copy,
  Info,
  Eye
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
  const [sessionRecords] = useState<SessionRecord[]>([]);
  
  const [generatedDiaries, setGeneratedDiaries] = useState<GeneratedDiary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [voucherTypes, setVoucherTypes] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [reportForm, setReportForm] = useState({
    voucher_type: '발달재활서비스',
    period_start: '',
    period_end: '',
    report_style: 'professional' as 'detailed' | 'concise' | 'professional'
  });

  // 간편 입력 폼
  const [quickInput, setQuickInput] = useState({
    clientName: '',
    sessionNumber: '',
    mainActivity: '',
    childResponse: '',
    specialNotes: ''
  });

  const { toast } = useToast();

  // 바우처 유형 및 생성 이력 불러오기
  useEffect(() => {
    loadVoucherTypes();
    loadDiaryHistory();
  }, []);

  const loadVoucherTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_types')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      if (data) {
        setVoucherTypes(data.map(v => ({
          id: v.name,
          name: v.name,
          description: v.description || '치료 일지 작성'
        })));
        
        // 첫 번째 바우처 유형으로 초기화
        if (data.length > 0 && !reportForm.voucher_type) {
          setReportForm(prev => ({ ...prev, voucher_type: data[0].name }));
        }
      }
    } catch (error) {
      console.error('바우처 유형 불러오기 오류:', error);
      // 실패시 기본 하드코딩된 목록 사용
      setVoucherTypes([
        { id: '발달재활서비스', name: '발달재활서비스', description: '대상자 정보, 치료 목표, 활동 내용, 평가' },
        { id: '언어발달지원', name: '언어발달지원', description: 'SOAP 형식 (주관적/객관적/평가/계획)' },
      ]);
    }
  };

  const loadDiaryHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('diary_generations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedDiaries: GeneratedDiary[] = data.map(item => {
          const metadata = item.metadata as any;
          return {
            id: item.id,
            voucherType: item.voucher_type,
            content: item.generated_content,
            periodStart: metadata?.periodStart || '',
            periodEnd: metadata?.periodEnd || '',
            createdAt: item.created_at,
            metadata: item.metadata,
            summary: metadata?.summary || {
              totalSessions: 1,
              attendanceRate: '100%',
              uniqueClients: 1
            }
          };
        });
        setGeneratedDiaries(formattedDiaries);
      }
    } catch (error) {
      console.error('이력 불러오기 오류:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };


  const reportStyles = [
    { value: 'detailed', label: '상세형 (1500-2000자)', description: '모든 내용을 구체적으로 기록' },
    { value: 'concise', label: '간결형 (800-1000자)', description: '핵심 내용만 요약' },
    { value: 'professional', label: '전문형 (1200-1500자)', description: '전문적이고 균형있게' },
  ];

  const generateDiary = async () => {
    try {
      setIsGenerating(true);
      
      // 간편 입력 또는 세션 기록 사용
      let sessionData = sessionRecords;
      
      if (sessionRecords.length === 0) {
        // 간편 입력 유효성 검사
        if (!quickInput.clientName || !quickInput.mainActivity) {
          toast({
            title: "입력 필요",
            description: "아동명과 주요 활동을 입력해주세요.",
            variant: "destructive"
          });
          setIsGenerating(false);
          return;
        }

        // 간편 입력으로 세션 데이터 생성
        sessionData = [{
          id: Date.now().toString(),
          client_name: quickInput.clientName,
          therapist_name: "담당 치료사",
          session_date: new Date().toISOString().split('T')[0],
          duration: 50,
          voucher_type: reportForm.voucher_type,
          session_notes: quickInput.mainActivity,
          progress_notes: quickInput.childResponse || '긍정적 반응',
          attendance_status: '출석',
          session_goals: `${reportForm.voucher_type} 목표`,
          observations: quickInput.specialNotes || '특이사항 없음'
        }];
      }

      const periodStart = reportForm.period_start || new Date().toISOString().split('T')[0];
      const periodEnd = reportForm.period_end || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase.functions.invoke('ai-diary-generator', {
        body: {
          voucherType: reportForm.voucher_type,
          sessionData: sessionData,
          periodStart,
          periodEnd,
          reportStyle: reportForm.report_style
        }
      });

      if (error) throw error;

      if (data?.success) {
        // 데이터베이스에 저장
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: savedDiary, error: saveError } = await supabase
          .from('diary_generations')
          .insert({
            voucher_type: reportForm.voucher_type,
            report_style: reportForm.report_style,
            client_name: quickInput.clientName || sessionRecords[0]?.client_name,
            session_number: quickInput.sessionNumber ? parseInt(quickInput.sessionNumber) : null,
            main_activity: quickInput.mainActivity || sessionRecords[0]?.session_notes,
            generated_content: data.content,
            character_count: data.content.replace(/<[^>]*>/g, '').length,
            metadata: {
              periodStart,
              periodEnd,
              summary: data.summary,
              reportStyle: reportForm.report_style,
              ...data.metadata
            },
            created_by: user?.id
          })
          .select()
          .single();

        if (saveError) {
          console.error('저장 오류:', saveError);
          toast({
            title: "저장 실패",
            description: "일지는 생성되었으나 저장에 실패했습니다.",
            variant: "destructive"
          });
        }

        const newDiary: GeneratedDiary = {
          id: savedDiary?.id || Date.now().toString(),
          voucherType: reportForm.voucher_type,
          content: data.content,
          periodStart,
          periodEnd,
          createdAt: savedDiary?.created_at || new Date().toISOString(),
          metadata: data.metadata,
          summary: data.summary
        };

        setGeneratedDiaries([newDiary, ...generatedDiaries]);
        
        // 입력 폼 초기화
        setQuickInput({
          clientName: '',
          sessionNumber: '',
          mainActivity: '',
          childResponse: '',
          specialNotes: ''
        });

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
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary text-sm sm:text-base whitespace-nowrap">일지 생성</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary text-sm sm:text-base whitespace-nowrap">생성 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {sessionRecords.length > 0 && (
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
          )}

          {/* 일지 생성 폼 */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">간편 일지 생성</CardTitle>
              <CardDescription className="text-slate-300 text-sm sm:text-base">
                바우처 유형을 선택하고 간단한 정보만 입력하면 AI가 공식 서식에 맞는 전문 일지를 작성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="voucher_type" className="text-slate-300">바우처 유형 *</Label>
                <Select 
                  value={reportForm.voucher_type} 
                  onValueChange={(value) => setReportForm({...reportForm, voucher_type: value})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {voucherTypes.map((voucher) => (
                      <SelectItem key={voucher.id} value={voucher.id} className="text-white">
                        <div className="flex flex-col">
                          <span className="font-medium">{voucher.name}</span>
                          <span className="text-xs text-slate-400">{voucher.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-primary/80 flex items-start gap-1 leading-relaxed">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>선택한 바우처에 맞는 공식 서식으로 일지가 생성됩니다</span>
                </p>
              </div>

              {/* 간편 입력 폼 */}
              <div className="space-y-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">최소 입력으로 전문 일지 생성</p>
                    <p className="text-xs text-slate-400 leading-relaxed">기본 정보만 입력하면 AI가 해당 바우처의 공식 서식에 맞춰 작성합니다</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-slate-300">아동명 *</Label>
                    <Input
                      id="clientName"
                      placeholder="예: 김OO"
                      value={quickInput.clientName}
                      onChange={(e) => setQuickInput({...quickInput, clientName: e.target.value})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionNumber" className="text-slate-300">회기 번호</Label>
                    <Input
                      id="sessionNumber"
                      placeholder="예: 10회기"
                      value={quickInput.sessionNumber}
                      onChange={(e) => setQuickInput({...quickInput, sessionNumber: e.target.value})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainActivity" className="text-slate-300">주요 활동 *</Label>
                  <Textarea
                    id="mainActivity"
                    placeholder="예: 소근육 발달 활동, 블록 쌓기"
                    value={quickInput.mainActivity}
                    onChange={(e) => setQuickInput({...quickInput, mainActivity: e.target.value})}
                    rows={2}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childResponse" className="text-slate-300">아동 반응</Label>
                  <Textarea
                    id="childResponse"
                    placeholder="예: 적극적으로 참여, 집중력 양호"
                    value={quickInput.childResponse}
                    onChange={(e) => setQuickInput({...quickInput, childResponse: e.target.value})}
                    rows={2}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNotes" className="text-slate-300">특이사항</Label>
                  <Textarea
                    id="specialNotes"
                    placeholder="예: 이전보다 집중 시간 증가"
                    value={quickInput.specialNotes}
                    onChange={(e) => setQuickInput({...quickInput, specialNotes: e.target.value})}
                    rows={2}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {sessionRecords.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period_start" className="text-slate-300">시작일</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={reportForm.period_start}
                      onChange={(e) => setReportForm({...reportForm, period_start: e.target.value})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period_end" className="text-slate-300">종료일</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={reportForm.period_end}
                      onChange={(e) => setReportForm({...reportForm, period_end: e.target.value})}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

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
                        <div className="flex flex-col">
                          <span className="font-medium">{style.label}</span>
                          <span className="text-xs text-slate-400">{style.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateDiary} 
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-5 sm:py-6"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin flex-shrink-0" />
                    <span className="truncate">AIHPRO 최적화 엔진으로 작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span>AI 일지 생성하기</span>
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
                        <CardDescription className="text-slate-300">
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
                          <p className="text-sm text-slate-300">출석률</p>
                          <p className="text-lg font-semibold text-white">{diary.summary.attendanceRate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-300">대상자</p>
                          <p className="text-lg font-semibold text-white">{diary.summary.uniqueClients}명</p>
                        </div>
                      </div>
                    )}

                    {/* 일지 내용 미리보기 */}
                    <div 
                      className="prose prose-sm max-w-none text-slate-200 bg-slate-800/50 p-4 rounded-lg max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: diary.content.substring(0, 500) + '...' }}
                    />

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <span className="whitespace-nowrap">자세히보기</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white text-xl">{diary.voucherType} 일지</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm text-slate-300">
                              <span>{diary.periodStart} ~ {diary.periodEnd}</span>
                              <span>{new Date(diary.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div 
                              className="prose prose-sm prose-invert max-w-none text-slate-100"
                              dangerouslySetInnerHTML={{ __html: diary.content }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => copyToClipboard(diary.content)}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">복사</span>
                      </Button>
                      <Button
                        onClick={() => downloadDiary(diary)}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="whitespace-nowrap">다운로드</span>
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
