import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ConcernData {
  id: string;
  concern_text: string;
  analysis_type: string;
  analysis_severity: string;
  analysis_advice: string;
  recommended_tests: any;
  report_images?: string[];
  full_analysis?: {
    type?: string;
    severity?: string;
    color?: string;
    detailedAdvice?: string;
    recommendations?: string[];
    confidence?: number;
    nextSteps?: string[];
    recommendedTests?: any[];
  };
  created_at: string;
}

export const ConcernStorageList = () => {
  const [concerns, setConcerns] = useState<ConcernData[]>([]);
  const [filteredConcerns, setFilteredConcerns] = useState<ConcernData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConcerns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [concerns, searchQuery, severityFilter, typeFilter, sortBy]);

  const fetchConcerns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('concern_storage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConcerns((data || []) as ConcernData[]);
    } catch (error) {
      console.error('고민 불러오기 오류:', error);
      toast({
        title: "오류 발생",
        description: "고민을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...concerns];

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.concern_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.analysis_advice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.analysis_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 심각도 필터
    if (severityFilter !== 'all') {
      filtered = filtered.filter(c => c.analysis_severity === severityFilter);
    }

    // 타입 필터
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.analysis_type === typeFilter);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'severity-high':
          const severityOrder = { '높음': 3, '중간': 2, '낮음': 1 };
          return (severityOrder[b.analysis_severity as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.analysis_severity as keyof typeof severityOrder] || 0);
        case 'severity-low':
          const severityOrderLow = { '높음': 3, '중간': 2, '낮음': 1 };
          return (severityOrderLow[a.analysis_severity as keyof typeof severityOrderLow] || 0) - 
                 (severityOrderLow[b.analysis_severity as keyof typeof severityOrderLow] || 0);
        default:
          return 0;
      }
    });

    setFilteredConcerns(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('concern_storage')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConcerns(concerns.filter(c => c.id !== id));
      toast({
        title: "삭제 완료",
        description: "고민이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('고민 삭제 오류:', error);
      toast({
        title: "오류 발생",
        description: "고민 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '높음':
        return 'bg-red-500';
      case '중간':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case '높음':
        return 'text-red-600';
      case '중간':
        return 'text-orange-600';
      default:
        return 'text-green-600';
    }
  };

  // 통계 계산
  const stats = React.useMemo(() => {
    const total = concerns.length;
    const severityCounts = concerns.reduce((acc, c) => {
      acc[c.analysis_severity] = (acc[c.analysis_severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = concerns.reduce((acc, c) => {
      acc[c.analysis_type] = (acc[c.analysis_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentTrend = concerns.slice(0, 10).filter(c => c.analysis_severity === '높음').length > 5 ? 'up' : 'down';

    return {
      total,
      severityCounts,
      typeCounts,
      recentTrend,
      severityData: Object.entries(severityCounts).map(([name, value]) => ({
        name,
        value,
        color: name === '높음' ? '#ef4444' : name === '중간' ? '#f59e0b' : '#10b981'
      })),
      typeData: Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
    };
  }, [concerns]);

  const uniqueTypes = Array.from(new Set(concerns.map(c => c.analysis_type)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 고민 수</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">높은 심각도</p>
                <p className="text-3xl font-bold text-red-600">{stats.severityCounts['높음'] || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">중간 심각도</p>
                <p className="text-3xl font-bold text-orange-600">{stats.severityCounts['중간'] || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">낮은 심각도</p>
                <p className="text-3xl font-bold text-green-600">{stats.severityCounts['낮음'] || 0}</p>
              </div>
              {stats.recentTrend === 'down' ? (
                <TrendingDown className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingUp className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      {concerns.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">심각도 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} debounce={50}>
                  <PieChart>
                    <Pie
                      data={stats.severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stats.severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}개`, '고민 수']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">유형별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} debounce={50}>
                  <BarChart 
                    data={stats.typeData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      label={{ value: '고민 수', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}개`, '고민 수']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="고민 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="심각도 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 심각도</SelectItem>
                <SelectItem value="높음">높음</SelectItem>
                <SelectItem value="중간">중간</SelectItem>
                <SelectItem value="낮음">낮음</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="유형 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">최신순</SelectItem>
                <SelectItem value="date-asc">오래된순</SelectItem>
                <SelectItem value="severity-high">심각도 높은순</SelectItem>
                <SelectItem value="severity-low">심각도 낮은순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredConcerns.length}개의 고민</span>
            {(searchQuery || severityFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setTypeFilter('all');
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 고민 목록 */}
      {filteredConcerns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {concerns.length === 0 ? '저장된 고민이 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredConcerns.map((concern, index) => (
            <AccordionItem key={concern.id} value={`concern-${index}`} className="border rounded-lg">
              <Card className="border-0">
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-start justify-between gap-4 w-full pr-4">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-semibold">
                          {concern.analysis_type}
                        </Badge>
                        <Badge className={`${getSeverityColor(concern.analysis_severity)} text-white`}>
                          심각도: {concern.analysis_severity}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(concern.created_at), 'PPP', { locale: ko })}
                        </div>
                      </div>
                      <p className="text-foreground line-clamp-2 mt-2">{concern.concern_text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(concern.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <CardContent className="space-y-6 pt-0 border-t">
                    {/* 내 고민 전체 */}
                    <div className="pt-6">
                      <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                        <span className="text-2xl">💭</span>
                        내 고민 (전체)
                      </h4>
                      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{concern.concern_text}</p>
                      </div>
                    </div>
                    
                    {/* AI 분석 결과 */}
                    {concern.full_analysis && Object.keys(concern.full_analysis).length > 0 ? (
                      <>
                        {/* 분석 개요 */}
                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-4 text-base flex items-center gap-2 text-foreground">
                            <span className="text-2xl">🤖</span>
                            AI 분석 개요
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {concern.full_analysis.type && (
                              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div className="text-sm text-muted-foreground mb-1">유형</div>
                                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{concern.full_analysis.type}</div>
                              </div>
                            )}
                            {concern.full_analysis.severity && (
                              <div className={`rounded-xl p-4 border ${
                                concern.full_analysis.severity === '높음' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
                                concern.full_analysis.severity === '중간' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' :
                                'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                              }`}>
                                <div className="text-sm text-muted-foreground mb-1">심각도</div>
                                <div className={`text-lg font-bold ${
                                  concern.full_analysis.severity === '높음' ? 'text-red-700 dark:text-red-400' :
                                  concern.full_analysis.severity === '중간' ? 'text-orange-700 dark:text-orange-400' :
                                  'text-green-700 dark:text-green-400'
                                }`}>{concern.full_analysis.severity}</div>
                              </div>
                            )}
                            {concern.full_analysis.confidence && (
                              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <div className="text-sm text-muted-foreground mb-1">신뢰도</div>
                                <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{concern.full_analysis.confidence}%</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 상세 조언 */}
                        {concern.full_analysis.detailedAdvice && (
                          <div className="border-t pt-6">
                            <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                              <span className="text-2xl">💡</span>
                              AI 상세 조언
                            </h4>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{concern.full_analysis.detailedAdvice}</p>
                            </div>
                          </div>
                        )}

                        {/* 추천 사항 */}
                        {concern.full_analysis.recommendations && concern.full_analysis.recommendations.length > 0 && (
                          <div className="border-t pt-6">
                            <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                              <span className="text-2xl">✅</span>
                              추천 사항
                            </h4>
                            <div className="space-y-2">
                              {concern.full_analysis.recommendations.map((rec: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3 border border-border/50">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-primary font-bold text-sm">{idx + 1}</span>
                                  </div>
                                  <p className="text-foreground flex-1">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 다음 단계 */}
                        {concern.full_analysis.nextSteps && concern.full_analysis.nextSteps.length > 0 && (
                          <div className="border-t pt-6">
                            <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                              <span className="text-2xl">🎯</span>
                              다음 단계
                            </h4>
                            <div className="space-y-2">
                              {concern.full_analysis.nextSteps.map((step: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                                  <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                  <p className="text-foreground flex-1">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Fallback: 기본 조언 표시 */
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                          <span className="text-2xl">💡</span>
                          AI 조언
                        </h4>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{concern.analysis_advice}</p>
                        </div>
                      </div>
                    )}

                    {/* 리포트 이미지 */}
                    {concern.report_images && concern.report_images.length > 0 && (
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                          <span className="text-2xl">🖼️</span>
                          분석 리포트 이미지
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {concern.report_images.map((imageUrl, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                              <img 
                                src={imageUrl} 
                                alt={`분석 리포트 이미지 ${index + 1}`} 
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 추천 검사 */}
                    {((concern.full_analysis?.recommendedTests && concern.full_analysis.recommendedTests.length > 0) || 
                      (concern.recommended_tests && Array.isArray(concern.recommended_tests) && concern.recommended_tests.length > 0)) && (
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-foreground">
                          <span className="text-2xl">📋</span>
                          추천 검사
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(concern.full_analysis?.recommendedTests || concern.recommended_tests || []).map((test: any, index: number) => {
                            const testName = typeof test === 'string' ? test : test?.name || '검사명 없음';
                            return (
                              <Button
                                key={index}
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/assessment')}
                                className="gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20"
                              >
                                {testName}
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default ConcernStorageList;
