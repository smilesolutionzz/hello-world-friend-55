import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Heart, 
  Users, 
  MessageSquare, 
  Target,
  Calendar,
  Plus,
  Eye,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentalData {
  id: string;
  domain: string;
  skill_area: string;
  current_level: number;
  target_level: number;
  tracking_date: string;
  notes: string;
}

interface DevelopmentalTrackingDashboardProps {
  userId?: string;
  studentId?: string;
}

const DevelopmentalTrackingDashboard = ({ userId, studentId }: DevelopmentalTrackingDashboardProps) => {
  const [trackingData, setTrackingData] = useState<DevelopmentalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const { toast } = useToast();

  const domains = [
    { key: 'motor', label: '대소근육 운동', icon: Target, color: 'bg-blue-100 text-blue-800' },
    { key: 'language', label: '언어발달', icon: MessageSquare, color: 'bg-green-100 text-green-800' },
    { key: 'social', label: '사회성', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { key: 'cognitive', label: '인지발달', icon: Brain, color: 'bg-orange-100 text-orange-800' },
    { key: 'adaptive', label: '적응행동', icon: Heart, color: 'bg-pink-100 text-pink-800' }
  ];

  useEffect(() => {
    fetchTrackingData();
  }, [userId, studentId]);

  const fetchTrackingData = async () => {
    try {
      let query = supabase
        .from('developmental_tracking')
        .select('*')
        .order('tracking_date', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrackingData(data || []);
    } catch (error) {
      console.error('발달 추적 데이터 조회 오류:', error);
      toast({
        title: "오류 발생",
        description: "발달 추적 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDomainData = (domainKey: string) => {
    const domainData = trackingData.filter(item => item.domain === domainKey);
    if (domainData.length === 0) return null;

    const latestData = domainData[0];
    const progress = latestData.target_level ? 
      (latestData.current_level / latestData.target_level) * 100 : 
      (latestData.current_level / 5) * 100;

    return {
      ...latestData,
      progress,
      totalEntries: domainData.length
    };
  };

  const getOverallProgress = () => {
    if (trackingData.length === 0) return 0;
    
    const domainAverages = domains.map(domain => {
      const domainItems = trackingData.filter(item => item.domain === domain.key);
      if (domainItems.length === 0) return 0;
      
      const average = domainItems.reduce((sum, item) => sum + item.current_level, 0) / domainItems.length;
      return (average / 5) * 100;
    });

    return domainAverages.reduce((sum, avg) => sum + avg, 0) / domainAverages.length;
  };

  const getRecentProgress = () => {
    const recent = trackingData.slice(0, 10);
    const improvements = recent.filter(item => 
      item.target_level && item.current_level >= item.target_level
    ).length;
    
    return {
      totalRecent: recent.length,
      improvements,
      improvementRate: recent.length > 0 ? (improvements / recent.length) * 100 : 0
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = getOverallProgress();
  const recentProgress = getRecentProgress();

  return (
    <div className="space-y-6">
      {/* 종합 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 발달 수준</p>
                <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 추적 항목</p>
                <p className="text-2xl font-bold">{trackingData.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">목표 달성률</p>
                <p className="text-2xl font-bold">{recentProgress.improvementRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 영역별 발달 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            영역별 발달 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDomain} onValueChange={setSelectedDomain}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">전체</TabsTrigger>
              {domains.map(domain => (
                <TabsTrigger key={domain.key} value={domain.key}>
                  {domain.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map(domain => {
                  const domainData = getDomainData(domain.key);
                  const IconComponent = domain.icon;
                  
                  return (
                    <Card key={domain.key} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={domain.color}>
                            {domain.label}
                          </Badge>
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        {domainData ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>현재 수준</span>
                              <span className="font-medium">
                                {domainData.current_level}/5
                              </span>
                            </div>
                            <Progress value={domainData.progress} />
                            <p className="text-xs text-muted-foreground">
                              최근 업데이트: {new Date(domainData.tracking_date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm">
                            추적 데이터 없음
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {domains.map(domain => (
              <TabsContent key={domain.key} value={domain.key} className="mt-6">
                <div className="space-y-4">
                  {trackingData
                    .filter(item => item.domain === domain.key)
                    .slice(0, 5)
                    .map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{item.skill_area}</h4>
                            <Badge variant="outline">
                              {new Date(item.tracking_date).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">현재 수준</p>
                              <p className="text-lg font-bold">{item.current_level}/5</p>
                            </div>
                            {item.target_level && (
                              <div>
                                <p className="text-sm text-muted-foreground">목표 수준</p>
                                <p className="text-lg font-bold">{item.target_level}/5</p>
                              </div>
                            )}
                          </div>

                          {item.target_level && (
                            <Progress 
                              value={(item.current_level / item.target_level) * 100} 
                              className="mb-3"
                            />
                          )}

                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 행동 버튼들 */}
      <div className="flex gap-3">
        <Button 
          onClick={() => {/* 새 추적 데이터 추가 모달 열기 */}}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          발달 추적 추가
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {/* IEP 생성 페이지로 이동 */}}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          IEP 생성하기
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {/* 상세 리포트 생성 */}}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          발달 리포트
        </Button>
      </div>
    </div>
  );
};

export default DevelopmentalTrackingDashboard;