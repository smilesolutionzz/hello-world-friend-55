import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Edit,
  Mail,
  Download,
  Trash2,
  RefreshCw,
  X,
  Save,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useB2BCRM } from '@/hooks/useB2BCRM';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Report {
  id: string;
  name: string;
  student: string;
  parentEmail: string;
  type: '주간' | '월간' | '맞춤';
  status: '발송 완료' | '초안' | '예약됨';
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  content?: string;
}

interface B2BReportCenterProps {
  institutionName?: string;
}

export const B2BReportCenter: React.FC<B2BReportCenterProps> = ({ institutionName }) => {
  const { toast } = useToast();
  const { isLoading, sendReportEmail, sendBulkReports, generateAIReport } = useB2BCRM();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // 모달 상태
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // 새 리포트 작성 상태
  const [newReport, setNewReport] = useState({
    student: '',
    parentEmail: '',
    type: '주간' as '주간' | '월간' | '맞춤',
    content: ''
  });
  
  // Mock data - 실제로는 DB에서 가져옴
  const [reports, setReports] = useState<Report[]>([
    { 
      id: '1', 
      name: '1월 3주차 학습 리포트', 
      student: '김민준', 
      parentEmail: 'kim@example.com', 
      type: '주간', 
      status: '발송 완료', 
      createdAt: '2025-01-20', 
      sentAt: '2025-01-20', 
      openedAt: '2025-01-20',
      content: `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>김민준 학생 1월 3주차 학습 리포트</h2>
        <p>이번 주 김민준 학생은 수학 문제 해결 능력에서 큰 발전을 보였습니다.</p>
        <h3>📊 주요 관찰 내용</h3>
        <ul>
          <li>수학: 분수 개념 이해도 85% → 92%</li>
          <li>국어: 독해력 향상 확인</li>
          <li>집중력: 평균 40분 유지</li>
        </ul>
        <h3>💡 권장사항</h3>
        <p>집에서도 간단한 수학 게임을 통해 학습 흥미를 유지해 주세요.</p>
      </div>`
    },
    { 
      id: '2', 
      name: '수학 취약점 분석 리포트', 
      student: '최수아', 
      parentEmail: 'choi@example.com', 
      type: '맞춤', 
      status: '초안', 
      createdAt: '2025-01-21',
      content: `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>최수아 학생 수학 취약점 분석</h2>
        <p>최수아 학생의 수학 학습 현황을 분석한 맞춤 리포트입니다.</p>
        <h3>🔍 분석 결과</h3>
        <ul>
          <li>연산 능력: 양호</li>
          <li>도형 이해: 보충 필요</li>
          <li>문제 해결: 개선 중</li>
        </ul>
      </div>`
    },
    { 
      id: '3', 
      name: '1월 3주차 학습 리포트', 
      student: '정우진', 
      parentEmail: 'jung@example.com', 
      type: '주간', 
      status: '예약됨', 
      createdAt: '2025-01-19',
      content: `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>정우진 학생 1월 3주차 학습 리포트</h2>
        <p>정우진 학생의 이번 주 학습 현황입니다.</p>
      </div>`
    },
    { 
      id: '4', 
      name: '1월 3주차 학습 리포트', 
      student: '한소희', 
      parentEmail: 'han@example.com', 
      type: '주간', 
      status: '발송 완료', 
      createdAt: '2025-01-19', 
      sentAt: '2025-01-19',
      content: `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>한소희 학생 1월 3주차 학습 리포트</h2>
        <p>한소희 학생이 이번 주 매우 우수한 성과를 보였습니다.</p>
      </div>`
    },
    { 
      id: '5', 
      name: '정서발달 종합 리포트', 
      student: '이준영', 
      parentEmail: 'lee@example.com', 
      type: '월간', 
      status: '초안', 
      createdAt: '2025-01-22',
      content: `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>이준영 학생 정서발달 종합 리포트</h2>
        <p>이준영 학생의 월간 정서발달 평가 결과입니다.</p>
        <h3>🧠 정서 발달 지표</h3>
        <ul>
          <li>자기 조절 능력: 양호</li>
          <li>또래 관계: 우수</li>
          <li>감정 표현: 적극적</li>
        </ul>
      </div>`
    },
  ]);

  const stats = {
    monthSent: reports.filter(r => r.status === '발송 완료').length,
    openRate: 87,
    pendingBookings: reports.filter(r => r.status === '예약됨').length,
    drafts: reports.filter(r => r.status === '초안').length
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.includes(searchTerm) || r.student.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r.id));
    }
  };

  const handleSendReport = async (report: Report) => {
    const success = await sendReportEmail({
      recipientEmail: report.parentEmail,
      recipientName: `${report.student} 학부모님`,
      studentName: report.student,
      reportType: report.type,
      reportContent: report.content || `${report.student} 학생의 ${report.type} 리포트입니다.`,
      institutionName
    });

    if (success) {
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: '발송 완료' as const, sentAt: new Date().toISOString() } : r
      ));
    }
  };

  const handleBulkSend = async () => {
    const reportsToSend = reports.filter(r => 
      selectedReports.includes(r.id) && r.status !== '발송 완료'
    );

    if (reportsToSend.length === 0) {
      toast({
        title: '발송할 리포트가 없습니다',
        description: '초안 또는 예약된 리포트를 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    const result = await sendBulkReports(
      reportsToSend.map(r => ({
        recipientEmail: r.parentEmail,
        recipientName: `${r.student} 학부모님`,
        studentName: r.student,
        reportContent: r.content || `${r.student} 학생의 ${r.type} 리포트입니다.`
      })),
      institutionName
    );

    if (result.success > 0) {
      setReports(prev => prev.map(r => 
        selectedReports.includes(r.id) ? { ...r, status: '발송 완료' as const, sentAt: new Date().toISOString() } : r
      ));
      setSelectedReports([]);
    }
  };

  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    try {
      const content = await generateAIReport({
        studentName: '새 학생',
        assessmentData: { overall: 75, development: 80, emotion: 70 },
        ageGroup: 'child'
      });
      
      const newReportItem: Report = {
        id: Date.now().toString(),
        name: 'AI 생성 종합 리포트',
        student: '새 학생',
        parentEmail: '',
        type: '맞춤',
        status: '초안',
        createdAt: new Date().toISOString(),
        content: content || `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
          <h2>새 학생 AI 종합 리포트</h2>
          <p>AI가 분석한 종합 발달 리포트입니다.</p>
          <h3>📊 분석 결과</h3>
          <ul>
            <li>전체 발달 점수: 75점</li>
            <li>발달 영역: 80점</li>
            <li>정서 영역: 70점</li>
          </ul>
        </div>`
      };
      setReports(prev => [newReportItem, ...prev]);
      
      toast({
        title: 'AI 리포트 생성 완료',
        description: '새로운 리포트가 초안으로 저장되었습니다. 편집 후 발송해 주세요.',
      });
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedReport) return;
    
    setReports(prev => prev.map(r => 
      r.id === selectedReport.id ? selectedReport : r
    ));
    
    toast({
      title: '저장 완료',
      description: '리포트가 저장되었습니다.',
    });
    
    setEditOpen(false);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: '삭제 완료',
      description: '리포트가 삭제되었습니다.',
    });
  };

  const handleCreateNewReport = () => {
    if (!newReport.student || !newReport.parentEmail) {
      toast({
        title: '입력 오류',
        description: '학생 이름과 학부모 이메일을 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    const report: Report = {
      id: Date.now().toString(),
      name: `${newReport.student} ${newReport.type} 리포트`,
      student: newReport.student,
      parentEmail: newReport.parentEmail,
      type: newReport.type,
      status: '초안',
      createdAt: new Date().toISOString(),
      content: newReport.content || `<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
        <h2>${newReport.student} 학생 ${newReport.type} 리포트</h2>
        <p>리포트 내용을 작성해 주세요.</p>
      </div>`
    };

    setReports(prev => [report, ...prev]);
    setCreateOpen(false);
    setNewReport({ student: '', parentEmail: '', type: '주간', content: '' });
    
    toast({
      title: '리포트 생성 완료',
      description: '새 리포트가 초안으로 저장되었습니다.',
    });
  };

  const handleDownloadReport = (report: Report) => {
    const blob = new Blob([report.content || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: '다운로드 완료',
      description: '리포트가 다운로드되었습니다.',
    });
  };

  return (
    <>
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden backdrop-blur-xl">
        <CardHeader className="border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl text-white">리포트 센터</CardTitle>
              <p className="text-slate-400 text-sm mt-1">학부모에게 발송한 리포트를 관리하세요</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-slate-700 hover:bg-slate-800"
                onClick={handleBulkSend}
                disabled={selectedReports.length === 0 || isLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                일괄 발송 {selectedReports.length > 0 && `(${selectedReports.length})`}
              </Button>
              <Button 
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
                onClick={() => setCreateOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                직접 작성
              </Button>
              <Button 
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                onClick={handleGenerateAIReport}
                disabled={isGenerating}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? '생성 중...' : 'AI 리포트 생성'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="bg-slate-800/50 rounded-xl p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('all')}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Send className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.monthSent}</span>
              </div>
              <p className="text-slate-400 text-sm">이번 달 발송</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.openRate}%</span>
              </div>
              <p className="text-slate-400 text-sm">평균 열람률</p>
            </div>
            <div 
              className="bg-slate-800/50 rounded-xl p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('예약됨')}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.pendingBookings}</span>
              </div>
              <p className="text-slate-400 text-sm">예약 대기</p>
            </div>
            <div 
              className="bg-slate-800/50 rounded-xl p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('초안')}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.drafts}</span>
              </div>
              <p className="text-slate-400 text-sm">초안 저장</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="리포트 또는 학생 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all" className="text-white">전체</SelectItem>
                <SelectItem value="초안" className="text-white">초안</SelectItem>
                <SelectItem value="예약됨" className="text-white">예약됨</SelectItem>
                <SelectItem value="발송 완료" className="text-white">발송 완료</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="border-slate-700 hover:bg-slate-800"
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Reports Table */}
          <div className="bg-slate-800/30 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700/50 text-sm text-slate-400">
              <div className="col-span-1">
                <Checkbox 
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onCheckedChange={selectAll}
                />
              </div>
              <span className="col-span-4">리포트</span>
              <span className="col-span-2">유형</span>
              <span className="col-span-2">상태</span>
              <span className="col-span-2">열람</span>
              <span className="col-span-1">액션</span>
            </div>
            
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>조건에 맞는 리포트가 없습니다.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <motion.div 
                  key={report.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors items-center"
                >
                  <div className="col-span-1">
                    <Checkbox 
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={() => toggleSelect(report.id)}
                    />
                  </div>
                  <div className="col-span-4">
                    <p 
                      className="font-medium text-white cursor-pointer hover:text-violet-400 transition-colors"
                      onClick={() => handlePreviewReport(report)}
                    >
                      {report.name}
                    </p>
                    <p className="text-sm text-slate-500">{report.student}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={`
                      ${report.type === '주간' ? 'border-blue-500/50 text-blue-400' : ''}
                      ${report.type === '맞춤' ? 'border-pink-500/50 text-pink-400' : ''}
                      ${report.type === '월간' ? 'border-violet-500/50 text-violet-400' : ''}
                    `}>
                      {report.type}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Badge className={`
                      ${report.status === '발송 완료' ? 'bg-green-500/20 text-green-400 border-0' : ''}
                      ${report.status === '초안' ? 'bg-orange-500/20 text-orange-400 border-0' : ''}
                      ${report.status === '예약됨' ? 'bg-blue-500/20 text-blue-400 border-0' : ''}
                    `}>
                      {report.status === '발송 완료' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {report.status === '예약됨' && <Clock className="w-3 h-3 mr-1" />}
                      {report.status === '초안' && <Edit className="w-3 h-3 mr-1" />}
                      {report.status}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    {report.openedAt ? (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <Eye className="w-3 h-3" /> 열람됨
                      </span>
                    ) : report.sentAt ? (
                      <span className="text-slate-500 text-sm">미열람</span>
                    ) : (
                      <span className="text-slate-600 text-sm">-</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => handlePreviewReport(report)}
                          className="text-white hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          미리보기
                        </DropdownMenuItem>
                        {report.status === '초안' && (
                          <DropdownMenuItem 
                            onClick={() => handleEditReport(report)}
                            className="text-white hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                        )}
                        {report.status !== '발송 완료' && (
                          <DropdownMenuItem 
                            onClick={() => handleSendReport(report)}
                            className="text-white hover:bg-slate-800"
                            disabled={isLoading || !report.parentEmail}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            발송하기
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDownloadReport(report)}
                          className="text-white hover:bg-slate-800"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* AI Report Banner */}
          <div className="mt-6 p-6 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-xl border border-violet-500/20">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">AI가 자동으로 리포트를 작성해드려요</h4>
                <p className="text-sm text-slate-400">학생 데이터를 분석하여 맞춤형 리포트를 생성합니다</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                onClick={handleGenerateAIReport}
                disabled={isGenerating}
              >
                {isGenerating ? '생성 중...' : 'AI 리포트 생성'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리포트 미리보기 모달 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="text-white flex items-center gap-3">
              <Eye className="w-5 h-5 text-violet-400" />
              {selectedReport?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] bg-white rounded-lg">
            {selectedReport?.content && (
              <div 
                dangerouslySetInnerHTML={{ __html: selectedReport.content }}
                className="p-4"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            {selectedReport?.status === '초안' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setPreviewOpen(false);
                  handleEditReport(selectedReport);
                }}
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                편집
              </Button>
            )}
            <Button 
              onClick={() => selectedReport && handleDownloadReport(selectedReport)}
              className="border-slate-700 text-white hover:bg-slate-800"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
            {selectedReport?.status !== '발송 완료' && selectedReport?.parentEmail && (
              <Button 
                onClick={() => {
                  if (selectedReport) handleSendReport(selectedReport);
                  setPreviewOpen(false);
                }}
                className="bg-gradient-to-r from-violet-500 to-pink-500"
              >
                <Send className="w-4 h-4 mr-2" />
                발송하기
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 리포트 편집 모달 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="text-white flex items-center gap-3">
              <Edit className="w-5 h-5 text-orange-400" />
              리포트 편집
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">학생 이름</label>
                <Input
                  value={selectedReport?.student || ''}
                  onChange={(e) => setSelectedReport(prev => prev ? { ...prev, student: e.target.value, name: `${e.target.value} ${prev.type} 리포트` } : null)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">학부모 이메일</label>
                <Input
                  type="email"
                  value={selectedReport?.parentEmail || ''}
                  onChange={(e) => setSelectedReport(prev => prev ? { ...prev, parentEmail: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">리포트 유형</label>
              <Select 
                value={selectedReport?.type || '주간'} 
                onValueChange={(value) => setSelectedReport(prev => prev ? { ...prev, type: value as '주간' | '월간' | '맞춤', name: `${prev.student} ${value} 리포트` } : null)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="주간" className="text-white">주간</SelectItem>
                  <SelectItem value="월간" className="text-white">월간</SelectItem>
                  <SelectItem value="맞춤" className="text-white">맞춤</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">리포트 내용 (HTML)</label>
              <Textarea
                value={selectedReport?.content || ''}
                onChange={(e) => setSelectedReport(prev => prev ? { ...prev, content: e.target.value } : null)}
                className="bg-slate-800 border-slate-700 text-white min-h-[300px] font-mono text-sm"
                placeholder="HTML 형식으로 리포트 내용을 작성하세요..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button 
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              취소
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 새 리포트 작성 모달 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="text-white flex items-center gap-3">
              <FileText className="w-5 h-5 text-violet-400" />
              새 리포트 작성
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">학생 이름 *</label>
                <Input
                  value={newReport.student}
                  onChange={(e) => setNewReport(prev => ({ ...prev, student: e.target.value }))}
                  placeholder="학생 이름 입력"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">학부모 이메일 *</label>
                <Input
                  type="email"
                  value={newReport.parentEmail}
                  onChange={(e) => setNewReport(prev => ({ ...prev, parentEmail: e.target.value }))}
                  placeholder="parent@example.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">리포트 유형</label>
              <Select 
                value={newReport.type} 
                onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value as '주간' | '월간' | '맞춤' }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="주간" className="text-white">주간</SelectItem>
                  <SelectItem value="월간" className="text-white">월간</SelectItem>
                  <SelectItem value="맞춤" className="text-white">맞춤</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">리포트 내용 (HTML)</label>
              <Textarea
                value={newReport.content}
                onChange={(e) => setNewReport(prev => ({ ...prev, content: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white min-h-[250px] font-mono text-sm"
                placeholder={`<div style="font-family: 'Noto Sans KR', sans-serif; padding: 20px;">
  <h2>학생 이름 리포트</h2>
  <p>리포트 내용을 작성하세요...</p>
  <h3>📊 주요 관찰 내용</h3>
  <ul>
    <li>관찰 내용 1</li>
    <li>관찰 내용 2</li>
  </ul>
</div>`}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button 
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              취소
            </Button>
            <Button 
              onClick={handleCreateNewReport}
              className="bg-gradient-to-r from-violet-500 to-pink-500"
            >
              <Save className="w-4 h-4 mr-2" />
              초안 저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default B2BReportCenter;
