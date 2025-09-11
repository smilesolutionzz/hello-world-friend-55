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
  Plus
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
      required_fields: ['session_duration', 'progress_notes', 'attendance'],
      template_format: 'standard',
      reporting_period: 'monthly'
    },
    {
      id: '2', 
      name: '발달재활서비스',
      category: '정부바우처',
      required_fields: ['assessment_results', 'goal_progress', 'family_consultation'],
      template_format: 'detailed',
      reporting_period: 'monthly'
    },
    {
      id: '3',
      name: '장애아동복지지원',
      category: '지역바우처',
      required_fields: ['individual_plan', 'service_provision', 'outcome_evaluation'],
      template_format: 'comprehensive',
      reporting_period: 'quarterly'
    }
  ]);

  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
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
      // 샘플 데이터 - 실제 구현시 데이터베이스 연동
      const sampleRecords: SessionRecord[] = [
        {
          id: '1',
          client_name: '김철수',
          therapist_name: '박치료사',
          session_date: '2024-01-15',
          duration: 50,
          voucher_type: '언어발달지원',
          session_notes: '언어 표현 능력 향상 훈련',
          progress_notes: '단어 조합 능력 개선됨',
          attendance_status: '출석'
        },
        {
          id: '2',
          client_name: '이영희',
          therapist_name: '최치료사',
          session_date: '2024-01-16',
          duration: 40,
          voucher_type: '발달재활서비스',
          session_notes: '인지능력 발달 프로그램',
          progress_notes: '집중력 향상 관찰',
          attendance_status: '출석'
        }
      ];
      
      setSessionRecords(sampleRecords);
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

      // 실제 보고서 생성 로직 (AI 기반)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 시뮬레이션

      setGenerationProgress(100);
      
      // 새 보고서 추가
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        voucher_type: reportForm.voucher_type,
        period_start: reportForm.period_start,
        period_end: reportForm.period_end,
        total_sessions: sessionRecords.filter(r => 
          r.voucher_type === reportForm.voucher_type &&
          r.session_date >= reportForm.period_start &&
          r.session_date <= reportForm.period_end
        ).length,
        generated_at: new Date().toISOString().split('T')[0],
        status: 'completed'
      };

      setGeneratedReports(prev => [newReport, ...prev]);

      toast({
        title: "보고서 생성 완료",
        description: "바우처 일지가 성공적으로 생성되었습니다.",
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
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      toast({
        title: "다운로드 시작",
        description: "보고서를 다운로드합니다.",
      });
      
      // 실제 구현에서는 PDF 생성 후 다운로드
      console.log('Downloading report:', reportId);
      
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getVoucherBadgeColor = (category: string) => {
    switch (category) {
      case '정부바우처':
        return 'bg-blue-100 text-blue-800';
      case '지역바우처':
        return 'bg-green-100 text-green-800';
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

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">{report.voucher_type}</h3>
                        <Badge variant="outline">
                          {report.status === 'completed' ? '완료' : '진행중'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {report.period_start} ~ {report.period_end}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          세션 {report.total_sessions}회
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          생성일: {report.generated_at}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
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

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voucherTypes.map((voucher) => (
              <Card key={voucher.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{voucher.name}</CardTitle>
                    <Badge className={getVoucherBadgeColor(voucher.category)}>
                      {voucher.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">보고 주기</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {voucher.reporting_period === 'monthly' ? '월간' : 
                       voucher.reporting_period === 'quarterly' ? '분기' : voucher.reporting_period}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">필수 항목</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {voucher.required_fields.map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">양식 형태</Label>
                    <p className="text-sm text-muted-foreground capitalize">
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