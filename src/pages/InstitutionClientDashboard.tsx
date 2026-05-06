import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Users, FileText, Search, Eye, Building,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Brain,
  ClipboardList, BarChart3, UserCircle, Sparkles, Download
} from 'lucide-react';
import { useInstitutionClients } from '@/hooks/useInstitutionClients';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  new: '신규',
  in_progress: '진행 중',
  completed: '완료',
  follow_up: '추적 관찰',
};

const InstitutionClientDashboard = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const { toast } = useToast();
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientData, setClientData] = useState<Record<string, any> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');

  const { clients, reports, isLoading, fetchClientData, updateClientLink, generateTreatmentReport } = useInstitutionClients(institutionId || undefined);

  useEffect(() => {
    const loadInstitution = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data } = await supabase
        .from('b2b_partner_institutions')
        .select('id, institution_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        setInstitutionId(data.id);
        setInstitutionName(data.institution_name);
      } else {
        toast({ title: '기관 계정을 찾을 수 없습니다', description: '기관 등록을 먼저 완료해주세요.', variant: 'destructive' });
        navigate('/institution-application');
      }
    };
    loadInstitution();
  }, []);

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.client_label?.toLowerCase().includes(q) ||
      c.profile?.display_name?.toLowerCase().includes(q) ||
      c.assigned_therapist?.toLowerCase().includes(q)
    );
  });

  const handleViewClient = async (client: any) => {
    setSelectedClient(client);
    setIsLoadingData(true);
    try {
      const dataTypes = client.consent?.shared_data_types || [];
      const data = await fetchClientData(client.client_user_id, dataTypes);
      setClientData(data);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedClient || !clientData) return;
    setIsGenerating(true);
    try {
      await generateTreatmentReport({
        clientUserId: selectedClient.client_user_id,
        reportType: 'treatment_direction',
        reportTitle: `${selectedClient.profile?.display_name || selectedClient.client_label || '고객'} 치료방향 리포트`,
        clientData,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!institutionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-40 w-80" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">{institutionName}</h1>
            </div>
            <p className="text-sm text-muted-foreground">고객 데이터 관리 대시보드</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: '연결된 고객', value: clients.length, icon: Users, color: 'text-primary' },
            { label: '활성 동의', value: clients.filter(c => c.consent?.consent_status === 'active').length, icon: CheckCircle2, color: 'text-green-500' },
            { label: '긴급 케이스', value: clients.filter(c => c.priority === 'urgent' || c.priority === 'high').length, icon: AlertTriangle, color: 'text-amber-500' },
            { label: '생성된 리포트', value: reports.length, icon: FileText, color: 'text-violet-500' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="clients" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              고객 관리
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              치료 리포트
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="고객 이름, 라벨, 담당자로 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium mb-1">연결된 고객이 없습니다</p>
                  <p className="text-sm text-muted-foreground">
                    고객이 귀 기관에 데이터 공유를 동의하면 자동으로 목록에 표시됩니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>고객</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>공유 데이터</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map(client => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">
                                {client.client_label || client.profile?.display_name || '미지정'}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(client.created_at).toLocaleDateString('ko-KR')} 연결
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {STATUS_LABELS[client.treatment_status] || client.treatment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${PRIORITY_COLORS[client.priority] || ''}`}>
                            {client.priority === 'urgent' ? '긴급' :
                             client.priority === 'high' ? '높음' :
                             client.priority === 'normal' ? '보통' : '낮음'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(client.consent?.shared_data_types || []).slice(0, 3).map((t: string) => (
                              <Badge key={t} variant="secondary" className="text-[9px]">
                                {t === 'assessments' ? '검사' :
                                 t === 'observations' ? '관찰' :
                                 t === 'reports' ? '리포트' :
                                 t === 'brain_training' ? '두뇌' :
                                 t === 'counseling' ? '상담' : t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {client.assigned_therapist || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleViewClient(client)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            열람
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium mb-1">아직 생성된 리포트가 없습니다</p>
                  <p className="text-sm text-muted-foreground">
                    고객 데이터를 열람한 후 AI 치료방향 리포트를 생성해보세요.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reports.map(report => (
                  <Card key={report.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{report.report_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString('ko-KR')} ·{' '}
                            <Badge variant="outline" className="text-[10px]">
                              {report.status === 'draft' ? '초안' :
                               report.status === 'finalized' ? '확정' : '고객 공유'}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => { setSelectedClient(null); setClientData(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                {selectedClient?.client_label || selectedClient?.profile?.display_name || '고객'} 데이터 열람
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[65vh] pr-4">
              {isLoadingData ? (
                <div className="space-y-4 py-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : clientData ? (
                <div className="space-y-4 py-2">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Select
                      value={selectedClient?.treatment_status || 'new'}
                      onValueChange={val => updateClientLink(selectedClient.id, { treatment_status: val })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedClient?.priority || 'normal'}
                      onValueChange={val => updateClientLink(selectedClient.id, { priority: val })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="normal">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="ml-auto"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {isGenerating ? '생성 중...' : 'AI 치료방향 리포트'}
                    </Button>
                  </div>

                  {/* Assessment Data */}
                  {clientData.assessments?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-blue-500" />
                          심리검사 결과 ({clientData.assessments.length}건)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {clientData.assessments.slice(0, 5).map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="text-sm font-medium">{a.test_type || '검사'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(a.created_at).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                              <Badge variant={a.risk_level === 'high' ? 'destructive' : 'secondary'}>
                                {a.risk_level || '정상'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Observations */}
                  {clientData.observations?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-500" />
                          관찰일지 ({clientData.observations.length}건)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {clientData.observations.slice(0, 5).map((o: any) => (
                            <div key={o.id} className="py-2 border-b last:border-0">
                              <p className="text-sm font-medium">{o.session_name || o.title || '관찰 기록'}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {o.content || o.notes || ''}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {new Date(o.created_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Brain Training */}
                  {clientData.brain_training?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          두뇌 훈련 ({clientData.brain_training.length}건)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {clientData.brain_training.slice(0, 5).map((b: any) => (
                            <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="text-sm font-medium">{b.game_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(b.created_at).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                              <span className="text-sm font-medium">{b.score}/{b.max_score}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Progress */}
                  {clientData.progress?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-500" />
                          변화 추적 ({clientData.progress.length}건)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {clientData.progress.slice(0, 5).map((p: any) => (
                            <div key={p.id} className="py-2 border-b last:border-0">
                              <p className="text-sm">{p.activity_type || '활동'}: {p.title || ''}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(p.created_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {Object.keys(clientData).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">공유된 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InstitutionClientDashboard;
