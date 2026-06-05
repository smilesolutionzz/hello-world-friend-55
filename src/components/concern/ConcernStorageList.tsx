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
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ExternalLink,
  BarChart3,
  Sparkles,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import VisualSummaryButton from '@/components/visual-summary/VisualSummaryButton';

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
  const [showFilters, setShowFilters] = useState(false);
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

      // report_images는 base64 이미지가 통째로 저장돼 한 행이 수 MB까지 커질 수 있어
      // 목록 쿼리에서는 제외하고, 카드를 펼칠 때 lazy로 따로 가져온다.
      const { data, error } = await supabase
        .from('concern_storage')
        .select('id, concern_text, analysis_type, analysis_severity, analysis_advice, recommended_tests, full_analysis, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

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

  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const fetchReportImages = async (id: string) => {
    if (imagesLoaded[id]) return;
    setImagesLoaded((prev) => ({ ...prev, [id]: true }));
    try {
      const { data, error } = await supabase
        .from('concern_storage')
        .select('report_images')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      const imgs = (data as any)?.report_images as string[] | null | undefined;
      if (!imgs || imgs.length === 0) return;
      setConcerns((prev) => prev.map((c) => (c.id === id ? { ...c, report_images: imgs } : c)));
    } catch (e) {
      console.error('리포트 이미지 불러오기 오류:', e);
    }
  };

  const applyFilters = () => {
    let filtered = [...concerns];

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.concern_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.analysis_advice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.analysis_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(c => c.analysis_severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.analysis_type === typeFilter);
    }

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

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case '높음':
        return { 
          gradient: 'from-rose-500 to-red-500',
          bgClass: 'bg-rose-500/10',
          textClass: 'text-rose-600 dark:text-rose-400',
          borderClass: 'border-rose-500/20'
        };
      case '중간':
        return { 
          gradient: 'from-amber-500 to-orange-500',
          bgClass: 'bg-amber-500/10',
          textClass: 'text-amber-600 dark:text-amber-400',
          borderClass: 'border-amber-500/20'
        };
      default:
        return { 
          gradient: 'from-emerald-500 to-green-500',
          bgClass: 'bg-emerald-500/10',
          textClass: 'text-emerald-600 dark:text-emerald-400',
          borderClass: 'border-emerald-500/20'
        };
    }
  };

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
        color: name === '높음' ? '#f43f5e' : name === '중간' ? '#f59e0b' : '#10b981'
      })),
      typeData: Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
    };
  }, [concerns]);

  const uniqueTypes = Array.from(new Set(concerns.map(c => c.analysis_type)));

  const hasActiveFilters = searchQuery || severityFilter !== 'all' || typeFilter !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">고민을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: '총 고민', value: stats.total, icon: BarChart3, gradient: 'from-blue-500 to-cyan-500', bgClass: 'bg-blue-500/10' },
    { label: '높은 심각도', value: stats.severityCounts['높음'] || 0, icon: AlertCircle, gradient: 'from-rose-500 to-red-500', bgClass: 'bg-rose-500/10' },
    { label: '중간 심각도', value: stats.severityCounts['중간'] || 0, icon: AlertCircle, gradient: 'from-amber-500 to-orange-500', bgClass: 'bg-amber-500/10' },
    { label: '낮은 심각도', value: stats.severityCounts['낮음'] || 0, icon: stats.recentTrend === 'down' ? TrendingDown : TrendingUp, gradient: 'from-emerald-500 to-green-500', bgClass: 'bg-emerald-500/10' }
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-3 md:p-4 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center", stat.bgClass)}>
                  <stat.icon className={cn(
                    "w-5 h-5 md:w-6 md:h-6",
                    stat.gradient.includes('blue') ? 'text-blue-500' :
                    stat.gradient.includes('rose') ? 'text-rose-500' :
                    stat.gradient.includes('amber') ? 'text-amber-500' : 'text-emerald-500'
                  )} />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {concerns.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 md:gap-6"
        >
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                심각도 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220} debounce={50}>
                  <PieChart>
                    <Pie
                      data={stats.severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value}개`, '고민 수']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                유형별 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220} debounce={50}>
                  <BarChart 
                    data={stats.typeData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}개`, '고민 수']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="고민 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl bg-muted/30 border-border/50"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "rounded-xl border-border/50",
                  showFilters && "bg-primary text-primary-foreground"
                )}
              >
                <Filter className="w-4 h-4 mr-1.5" />
                필터
                {hasActiveFilters && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="rounded-xl bg-muted/30 border-border/50">
                        <SelectValue placeholder="심각도" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 심각도</SelectItem>
                        <SelectItem value="높음">🔴 높음</SelectItem>
                        <SelectItem value="중간">🟡 중간</SelectItem>
                        <SelectItem value="낮음">🟢 낮음</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="rounded-xl bg-muted/30 border-border/50">
                        <SelectValue placeholder="유형" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 유형</SelectItem>
                        {uniqueTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="rounded-xl bg-muted/30 border-border/50">
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{filteredConcerns.length}개의 고민</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSeverityFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-xs h-7 rounded-lg"
                >
                  <X className="w-3 h-3 mr-1" />
                  초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Concerns List */}
      {filteredConcerns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 md:p-12 text-center bg-card/80 backdrop-blur-sm border-border/50 rounded-3xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {concerns.length === 0 ? '저장된 고민이 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          </Card>
        </motion.div>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="space-y-3 md:space-y-4"
          onValueChange={(val) => {
            if (!val) return;
            const idx = Number(val.replace('concern-', ''));
            const target = filteredConcerns[idx];
            if (target) fetchReportImages(target.id);
          }}
        >
          {filteredConcerns.map((concern, index) => {
            const severityConfig = getSeverityConfig(concern.analysis_severity);
            
            return (
              <motion.div
                key={concern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <AccordionItem value={`concern-${index}`} className="border-0">
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    {/* Severity indicator */}
                    <div className={cn("h-1 bg-gradient-to-r", severityConfig.gradient)} />
                    
                    <AccordionTrigger className="hover:no-underline px-4 md:px-6 py-4">
                      <div className="flex items-start justify-between gap-3 w-full pr-2">
                        <div className="flex-1 text-left space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="rounded-lg font-medium bg-muted/50 border-border/50">
                              {concern.analysis_type}
                            </Badge>
                            <Badge className={cn("rounded-lg border", severityConfig.bgClass, severityConfig.textClass, severityConfig.borderClass)}>
                              {concern.analysis_severity}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(concern.created_at), 'M월 d일', { locale: ko })}
                            </div>
                          </div>
                          <p className="text-foreground line-clamp-2 text-sm md:text-base">{concern.concern_text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(concern.id);
                          }}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent>
                      <CardContent className="space-y-5 pt-0 border-t border-border/30">
                        {/* 내 고민 전체 */}
                        <div className="pt-5">
                          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                            <span className="text-lg">💭</span>
                            내 고민
                          </h4>
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                            <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{concern.concern_text}</p>
                          </div>
                        </div>
                        
                        {/* AI 분석 결과 */}
                        {concern.full_analysis && Object.keys(concern.full_analysis).length > 0 ? (
                          <>
                            {/* 분석 개요 */}
                            <div className="pt-4">
                              <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                                <Sparkles className="w-4 h-4 text-primary" />
                                AI 분석 개요
                              </h4>
                              <div className="grid grid-cols-3 gap-2 md:gap-3">
                                {concern.full_analysis.type && (
                                  <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                                    <div className="text-xs text-muted-foreground mb-0.5">유형</div>
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">{concern.full_analysis.type}</div>
                                  </div>
                                )}
                                {concern.full_analysis.severity && (
                                  <div className={cn("rounded-xl p-3 border", severityConfig.bgClass, severityConfig.borderClass)}>
                                    <div className="text-xs text-muted-foreground mb-0.5">심각도</div>
                                    <div className={cn("text-sm font-bold", severityConfig.textClass)}>{concern.full_analysis.severity}</div>
                                  </div>
                                )}
                                {concern.full_analysis.confidence && (
                                  <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                                    <div className="text-xs text-muted-foreground mb-0.5">신뢰도</div>
                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{concern.full_analysis.confidence}%</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 상세 조언 */}
                            {concern.full_analysis.detailedAdvice && (
                              <div className="pt-4">
                                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                                  <span className="text-lg">💡</span>
                                  AI 상세 조언
                                </h4>
                                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                                  <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{concern.full_analysis.detailedAdvice}</p>
                                </div>
                              </div>
                            )}

                            {/* 추천 사항 */}
                            {concern.full_analysis.recommendations && concern.full_analysis.recommendations.length > 0 && (
                              <div className="pt-4">
                                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                                  <span className="text-lg">✅</span>
                                  추천 사항
                                </h4>
                                <div className="space-y-2">
                                  {concern.full_analysis.recommendations.map((rec: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 bg-muted/20 rounded-xl p-3 border border-border/30">
                                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-primary font-bold text-xs">{idx + 1}</span>
                                      </div>
                                      <p className="text-foreground text-sm flex-1">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 다음 단계 */}
                            {concern.full_analysis.nextSteps && concern.full_analysis.nextSteps.length > 0 && (
                              <div className="pt-4">
                                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                                  <span className="text-lg">🎯</span>
                                  다음 단계
                                </h4>
                                <div className="space-y-2">
                                  {concern.full_analysis.nextSteps.map((step: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 bg-blue-500/5 rounded-xl p-3 border border-blue-500/20">
                                      <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                      <p className="text-foreground text-sm flex-1">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="pt-4">
                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                              <span className="text-lg">💡</span>
                              AI 조언
                            </h4>
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                              <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{concern.analysis_advice}</p>
                            </div>
                          </div>
                        )}

                        {/* 리포트 이미지 */}
                        {concern.report_images && concern.report_images.length > 0 && (
                          <div className="pt-4">
                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                              <span className="text-lg">🖼️</span>
                              분석 리포트
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {concern.report_images.map((imageUrl, index) => (
                                <div key={index} className="relative group rounded-xl overflow-hidden border border-border/30 bg-muted/20">
                                  <img 
                                    src={imageUrl} 
                                    alt={`분석 리포트 ${index + 1}`} 
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

                        {/* 비주얼 노트 버튼 */}
                        <div className="pt-4">
                          <VisualSummaryButton
                            type="assessment"
                            content={{
                              concernText: concern.concern_text,
                              analysisType: concern.analysis_type,
                              severity: concern.analysis_severity,
                              advice: concern.analysis_advice,
                              fullAnalysis: concern.full_analysis,
                            }}
                            testType={concern.analysis_type || '고민 분석'}
                            label="🎨 비주얼 노트 만들기"
                            className="w-full"
                          />
                        </div>

                        {/* 추천 검사 */}
                        {((concern.full_analysis?.recommendedTests && concern.full_analysis.recommendedTests.length > 0) || 
                          (concern.recommended_tests && Array.isArray(concern.recommended_tests) && concern.recommended_tests.length > 0)) && (
                          <div className="pt-4">
                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-foreground">
                              <span className="text-lg">📋</span>
                              추천 검사
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(concern.full_analysis?.recommendedTests || concern.recommended_tests || []).map((test: any, index: number) => {
                                const label = typeof test === 'string' 
                                  ? test 
                                  : (test?.name ?? test?.title ?? test?.label ?? '검사');
                                return (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/assessment')}
                                    className="gap-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 border-primary/20"
                                  >
                                    {label}
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
              </motion.div>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default ConcernStorageList;