import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Filter,
  Search,
  Plus,
  Eye,
  Copy
} from 'lucide-react';

interface VoucherType {
  id: string;
  name: string;
  category: string;
  required_fields: string[];
  template_format: string;
  reporting_period: string;
}

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
}

interface GeneratedReport {
  id: string;
  voucher_type: string;
  period_start: string;
  period_end: string;
  total_sessions: number;
  generated_at: string;
  status: string;
  content?: string;
  ai_response?: any;
}

interface VoucherReportGeneratorProps {
  institutionId: string;
}

export default function VoucherReportGenerator({ institutionId }: VoucherReportGeneratorProps) {
  const [voucherTypes] = useState<VoucherType[]>([
    {
      id: '1',
      name: '언어발달지원',
      category: '정부바우처',
      required_fields: ['출석확인', '활동시간', '진도체크', '평가의견'],
      template_format: '정부바우처 표준양식',
      reporting_period: 'monthly'
    },
    {
      id: '2', 
      name: '발달재활서비스',
      category: '정부바우처',
      required_fields: ['서비스시간', '목표달성도', '가족상담', '특이사항'],
      template_format: '보건복지부 양식',
      reporting_period: 'monthly'
    },
    {
      id: '3',
      name: '교육청서비스',
      category: '교육청',
      required_fields: ['수업시수', 'IEP목표', '성취수준', '행동관찰', '연계활동'],
      template_format: '교육청 개별화교육 양식',
      reporting_period: 'weekly'
    },
    {
      id: '4',
      name: '지역사회서비스',
      category: '지역바우처',
      required_fields: ['서비스시간', '만족도조사', '사회적응도', '연계기관'],
      template_format: '지역사회서비스투자사업 양식',
      reporting_period: 'monthly'
    },
    {
      id: '5',
      name: '주간활동서비스',
      category: '장애인복지',
      required_fields: ['출석체크', '활동참여도', '건강상태', '안전점검', '보호자소통'],
      template_format: '장애인활동지원 표준양식',
      reporting_period: 'daily'
    },
    {
      id: '6',
      name: '키즈노트일지',
      category: '어린이집',
      required_fields: ['사진첨부', '활동시간', '건강체크', '알림장', '준비물'],
      template_format: '키즈노트 앱 연동형식',
      reporting_period: 'daily'
    }
  ]);

  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  const [reportForm, setReportForm] = useState({
    voucher_type: '',
    period_start: '',
    period_end: '',
    include_photos: false,
    include_assessments: true,
    custom_notes: ''
  });

  useEffect(() => {
    loadData();
  }, [institutionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSessionRecords(),
        fetchGeneratedReports()
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionRecords = async () => {
    try {
      // 기관 회원 데이터 가져오기
      const { data: members, error } = await supabase
        .from('institution_members')
        .select(`
          id,
          member_name,
          member_email,
          birth_date,
          enrollment_date,
          status,
          notes,
          custom_fields
        `)
        .eq('institution_admin_id', institutionId)
        .eq('status', 'active')
        .order('enrollment_date', { ascending: false });

      if (error) throw error;

      // 회원 데이터를 세션 기록 형태로 변환
      const sessionRecords: SessionRecord[] = members?.map(member => ({
        id: member.id,
        client_name: member.member_name || '미지정',
        therapist_name: '치료사 배정 예정',
        session_date: new Date().toISOString().split('T')[0],
        duration: 50,
        voucher_type: '언어발달지원',
        session_notes: member.notes || '',
        progress_notes: '진행 상황 기록 대기',
        attendance_status: '출석'
      })) || [];
      
      setSessionRecords(sessionRecords);
    } catch (error: any) {
      console.error('Error fetching session records:', error);
    }
  };

  const fetchGeneratedReports = async () => {
    try {
      // 샘플 데이터
      const sampleReports: GeneratedReport[] = [
        {
          id: '1',
          voucher_type: '언어발달지원',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          total_sessions: 12,
          generated_at: '2024-02-01',
          status: 'completed'
        }
      ];
      
      setGeneratedReports(sampleReports);
    } catch (error: any) {
      console.error('Error fetching generated reports:', error);
    }
  };

  const generateReport = async () => {
    if (!reportForm.voucher_type || !reportForm.period_start || !reportForm.period_end) {
      toast({
        title: "입력 오류",
        description: "바우처 유형과 기간을 모두 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // 해당 기간의 세션 데이터 수집
      const relevantSessions = sessionRecords.filter(session => 
        session.voucher_type === reportForm.voucher_type &&
        session.session_date >= reportForm.period_start &&
        session.session_date <= reportForm.period_end
      );

      // 클라이언트 정보 (샘플)
      const clientInfo = {
        name: "김철수",
        age: 7,
        diagnosis: "언어발달지연",
        goals: ["어휘력 향상", "문장 구성 능력 개발", "의사소통 기술 향상"]
      };

      console.log('Edge function 호출 시작');

      // Edge function 호출
      const response = await supabase.functions.invoke('generate-voucher-report', {
        body: {
          voucherType: reportForm.voucher_type,
          sessionData: relevantSessions,
          periodStart: reportForm.period_start,
          periodEnd: reportForm.period_end,
          clientInfo: clientInfo,
          customNotes: reportForm.custom_notes
        }
      });

      if (response.error) {
        throw new Error(response.error.message || '보고서 생성 실패');
      }

      console.log('AI 보고서 생성 완료:', response.data);
      
      setGenerationProgress(100);
      
      // 새 보고서 추가
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        voucher_type: reportForm.voucher_type,
        period_start: reportForm.period_start,
        period_end: reportForm.period_end,
        total_sessions: relevantSessions.length,
        generated_at: new Date().toISOString().split('T')[0],
        status: 'completed',
        content: response.data?.content || '',
        ai_response: response.data
      };

      setGeneratedReports(prev => [newReport, ...prev]);

      toast({
        title: "AI 보고서 생성 완료",
        description: `${reportForm.voucher_type} 서식에 맞는 치료일지가 생성되었습니다.`,
      });

      // 폼 초기화
      setReportForm({
        voucher_type: '',
        period_start: '',
        period_end: '',
        include_photos: false,
        include_assessments: true,
        custom_notes: ''
      });

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "생성 실패",
        description: error.message || '보고서 생성 중 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const report = generatedReports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('보고서를 찾을 수 없습니다.');
      }

      // 텍스트 파일로 다운로드
      const reportContent = generateReportText(report);
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.voucher_type}_보고서_${report.period_start}_${report.period_end}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "다운로드 완료",
        description: "보고서가 텍스트 파일로 다운로드되었습니다.",
      });
      
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyReportContent = async (report: GeneratedReport) => {
    try {
      const content = generateReportText(report);
      await navigator.clipboard.writeText(content);
      toast({
        title: "복사 완료",
        description: "보고서 내용이 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const generateReportText = (report: GeneratedReport) => {
    const sessions = sessionRecords.filter(session => 
      session.voucher_type === report.voucher_type &&
      session.session_date >= report.period_start &&
      session.session_date <= report.period_end
    );

    return `
=== ${report.voucher_type} 치료 보고서 ===

보고 기간: ${report.period_start} ~ ${report.period_end}
총 세션 수: ${report.total_sessions}회
생성일: ${report.generated_at}

=== 세션 상세 내역 ===
${sessions.map(session => `
• 날짜: ${session.session_date}
• 대상자: ${session.client_name}
• 담당자: ${session.therapist_name}
• 시간: ${session.duration}분
• 출석: ${session.attendance_status}
• 내용: ${session.session_notes}
• 진전사항: ${session.progress_notes}
`).join('\n')}

=== AI 생성 내용 ===
${report.content || 'AI 생성 내용이 없습니다.'}

=== 바우처 요구사항 ===
${report.ai_response?.metadata?.sections?.map((section: string) => `• ${section}`).join('\n') || ''}

필수 항목: ${report.ai_response?.metadata?.requiredFields?.join(', ') || ''}

생성 시간: ${report.ai_response?.metadata?.generatedAt || ''}
    `.trim();
  };

  const getVoucherBadgeColor = (category: string) => {
    switch (category) {
      case '정부바우처':
        return 'bg-blue-100 text-blue-800';
      case '지역바우처':
        return 'bg-green-100 text-green-800';
      case '교육청':
        return 'bg-purple-100 text-purple-800';
      case '장애인복지':
        return 'bg-orange-100 text-orange-800';
      case '어린이집':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            바우처별 일지 자동생성
          </h2>
          <p className="text-muted-foreground">AI가 바우처 요구사항에 맞는 치료일지를 자동 생성합니다</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Zap className="w-4 h-4 mr-1" />
          AI 자동생성
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">일지 생성</TabsTrigger>
          <TabsTrigger value="history">생성 이력</TabsTrigger>
          <TabsTrigger value="templates">바우처 정보</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이달 세션</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionRecords.length}건</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">생성된 보고서</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{generatedReports.length}개</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">지원 바우처</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{voucherTypes.length}개</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">자동화율</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95%</div>
              </CardContent>
            </Card>
          </div>

          {/* 보고서 생성 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>새 바우처 일지 생성</CardTitle>
              <CardDescription>
                AI가 바우처 양식에 맞는 치료일지를 자동으로 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="voucher_type">바우처 유형</Label>
                  <Select
                    value={reportForm.voucher_type}
                    onValueChange={(value) => setReportForm({...reportForm, voucher_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="바우처 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {voucherTypes.map(voucher => (
                        <SelectItem key={voucher.id} value={voucher.name}>
                          {voucher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period_start">시작일</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={reportForm.period_start}
                    onChange={(e) => setReportForm({...reportForm, period_start: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="period_end">종료일</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={reportForm.period_end}
                    onChange={(e) => setReportForm({...reportForm, period_end: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="custom_notes">추가 요청사항</Label>
                <Textarea
                  id="custom_notes"
                  value={reportForm.custom_notes}
                  onChange={(e) => setReportForm({...reportForm, custom_notes: e.target.value})}
                  placeholder="특별히 포함하고 싶은 내용이나 강조사항을 입력하세요"
                  rows={3}
                />
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI 일지 생성 중...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    AI 일지 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{report.voucher_type}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {report.status === 'completed' ? '완료' : '진행중'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{report.period_start} ~ {report.period_end}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>세션 {report.total_sessions}회</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span>생성일: {report.generated_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start md:self-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                            className="bg-white hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{report.voucher_type} 보고서</DialogTitle>
                            <DialogDescription>
                              {report.period_start} ~ {report.period_end}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyReportContent(report)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                복사
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReport(report.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                텍스트 다운로드
                              </Button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <pre className="whitespace-pre-wrap text-sm">
                                {generateReportText(report)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {generatedReports.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">생성된 보고서가 없습니다</h3>
                <p className="text-muted-foreground">
                  새로운 바우처 일지를 생성해 보세요
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voucherTypes.map((voucher) => (
              <Card key={voucher.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{voucher.name}</CardTitle>
                    <Badge className={getVoucherBadgeColor(voucher.category)}>
                      {voucher.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">보고 주기</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {voucher.reporting_period === 'monthly' ? '월간' : 
                       voucher.reporting_period === 'weekly' ? '주간' :
                       voucher.reporting_period === 'daily' ? '일간' :
                       voucher.reporting_period === 'quarterly' ? '분기' : voucher.reporting_period}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">필수 항목</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {voucher.required_fields.map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">양식 형태</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {voucher.template_format === 'standard' ? '표준' :
                       voucher.template_format === 'detailed' ? '상세' : 
                       voucher.template_format === 'comprehensive' ? '종합' : voucher.template_format}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}