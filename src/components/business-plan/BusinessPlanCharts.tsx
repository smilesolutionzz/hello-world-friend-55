import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Users, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChartData {
  type: string;
  title: string;
  image: string | null;
  loading: boolean;
  error: string | null;
}

interface BusinessPlanChartsProps {
  onChartsGenerated: (charts: { [key: string]: string }) => void;
}

const chartConfigs = [
  { type: 'market_growth', title: '시장 성장 추이', icon: TrendingUp },
  { type: 'revenue_projection', title: '매출 전망 (3개년)', icon: BarChart3 },
  { type: 'user_growth', title: '사용자 성장 전망', icon: Users },
  { type: 'market_share', title: '목표 시장 구성 (TAM-SAM-SOM)', icon: PieChart },
  { type: 'competitor_radar', title: '경쟁력 비교 분석', icon: BarChart3 },
  { type: 'funnel', title: '고객 전환 퍼널', icon: TrendingUp },
];

export const BusinessPlanCharts: React.FC<BusinessPlanChartsProps> = ({ onChartsGenerated }) => {
  const [charts, setCharts] = useState<{ [key: string]: ChartData }>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const generateChart = async (chartType: string, title: string) => {
    setCharts(prev => ({
      ...prev,
      [chartType]: { type: chartType, title, image: null, loading: true, error: null }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-chart-image', {
        body: { chartType, title }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setCharts(prev => ({
        ...prev,
        [chartType]: { type: chartType, title, image: data.image, loading: false, error: null }
      }));

      // Update parent with generated charts
      const updatedCharts = { ...charts, [chartType]: data.image };
      const chartImages: { [key: string]: string } = {};
      Object.entries(updatedCharts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          chartImages[key] = value;
        } else if (value && typeof value === 'object' && 'image' in value && value.image) {
          chartImages[key] = value.image as string;
        }
      });
      onChartsGenerated(chartImages);

    } catch (error: any) {
      console.error('Chart generation error:', error);
      setCharts(prev => ({
        ...prev,
        [chartType]: { type: chartType, title, image: null, loading: false, error: error.message }
      }));
    }
  };

  const generateAllCharts = async () => {
    setIsGeneratingAll(true);
    toast.info('모든 차트를 생성합니다. 1-2분 정도 소요됩니다...');

    for (const config of chartConfigs) {
      await generateChart(config.type, config.title);
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsGeneratingAll(false);
    toast.success('모든 차트 생성이 완료되었습니다!');
  };

  const generatedCount = Object.values(charts).filter(c => c.image).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            그래프 생성 (선택사항)
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {generatedCount}/{chartConfigs.length} 생성됨
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          AI가 사업계획서에 포함될 전문적인 차트 이미지를 생성합니다. 
          생성된 차트는 Word 문서에 자동으로 삽입됩니다.
        </p>

        <Button 
          onClick={generateAllCharts} 
          disabled={isGeneratingAll}
          variant="outline"
          className="w-full"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              차트 생성 중...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              모든 차트 한 번에 생성
            </>
          )}
        </Button>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartConfigs.map(config => {
            const chartData = charts[config.type];
            const Icon = config.icon;

            return (
              <div key={config.type} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {config.title}
                  </span>
                  {chartData?.loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {chartData?.image && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {chartData?.error && <XCircle className="w-4 h-4 text-red-500" />}
                </div>

                {chartData?.image ? (
                  <img 
                    src={chartData.image} 
                    alt={config.title} 
                    className="w-full h-32 object-contain bg-muted rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    {chartData?.loading ? (
                      <span className="text-xs text-muted-foreground">생성 중...</span>
                    ) : chartData?.error ? (
                      <span className="text-xs text-destructive">{chartData.error}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">미생성</span>
                    )}
                  </div>
                )}

                {!chartData?.image && !chartData?.loading && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => generateChart(config.type, config.title)}
                    className="w-full"
                  >
                    생성하기
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
