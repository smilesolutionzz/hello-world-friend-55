import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Star, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface IEPGenerationMotivationProps {
  className?: string;
}

export const IEPGenerationMotivation: React.FC<IEPGenerationMotivationProps> = ({ className }) => {
  const [observationCount, setObservationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchObservationCount();
  }, []);

  const fetchObservationCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('observation_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_type', 'observation');

      if (error) {
        console.error('Error fetching observation count:', error);
        setObservationCount(0);
      } else {
        setObservationCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setObservationCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = Math.min((observationCount / 3) * 100, 100);
  const isIEPReady = observationCount >= 3;

  const handleIEPGeneration = () => {
    navigate('/iep-generator');
  };

  if (isIEPReady) {
    return (
      <Card className={`${className} border-green-200 bg-gradient-to-r from-green-50 to-emerald-50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-green-800">🎉 IEP 생성 가능!</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {observationCount}개 완료
                  </Badge>
                </div>
                <p className="text-sm text-green-700">
                  3개 이상의 관찰일지로 맞춤형 IEP를 생성해보세요
                </p>
              </div>
            </div>
            <Button 
              onClick={handleIEPGeneration}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              IEP 생성
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-blue-800">IEP 생성까지</h3>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  {observationCount}/3개
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                관찰일지 3개를 완성하면 맞춤형 IEP를 생성할 수 있어요!
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-blue-600">
              <span>진행률</span>
              <span>{observationCount}/3개 완료</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Star className="w-3 h-3" />
              <span>
                {3 - observationCount}개 더 작성하면 IEP 생성 가능
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IEPGenerationMotivation;