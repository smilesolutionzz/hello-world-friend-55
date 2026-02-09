import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
}

interface ABTestExperiment {
  id: string;
  experiment_name: string;
  is_active: boolean;
  variants: ABTestVariant[];
}

export const useABTest = (experimentName: string) => {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignVariant = async () => {
      try {
        // 기존에 할당된 variant가 있는지 확인
        const storageKey = `ab_test_${experimentName}`;
        const savedVariant = localStorage.getItem(storageKey);
        
        if (savedVariant) {
          setVariant(savedVariant);
          setIsLoading(false);
          return;
        }

        // 실험 정보 가져오기
        const { data: experiment, error } = await supabase
          .from('ab_test_experiments')
          .select('*')
          .eq('experiment_name', experimentName)
          .eq('is_active', true)
          .single();

        if (error || !experiment) {
          console.error('AB Test experiment not found:', error);
          setIsLoading(false);
          return;
        }

        // 가중치 기반 variant 할당
        const variants = experiment.variants as unknown as ABTestVariant[];
        const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedVariant = variants[0].name;
        for (const v of variants) {
          random -= v.weight;
          if (random <= 0) {
            selectedVariant = v.name;
            break;
          }
        }

        // 할당된 variant 저장
        localStorage.setItem(storageKey, selectedVariant);
        setVariant(selectedVariant);

        // Supabase에 이벤트 트래킹
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
          
          await supabase.from('user_analytics_events').insert({
            user_id: session.user.id,
            session_id: sessionId,
            event_name: 'ab_test_assigned',
            page_path: window.location.pathname,
            event_properties: {
              experiment_name: experimentName,
              variant: selectedVariant
            }
          });
        }

        console.log(`✅ A/B Test: ${experimentName} = ${selectedVariant}`);
      } catch (error) {
        console.error('Failed to assign AB test variant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    assignVariant();
  }, [experimentName]);

  const trackConversion = async (conversionType: string, value?: number) => {
    if (!variant) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();

      await supabase.from('user_analytics_events').insert({
        user_id: session.user.id,
        session_id: sessionId,
        event_name: 'ab_test_conversion',
        page_path: window.location.pathname,
        event_properties: {
          experiment_name: experimentName,
          variant: variant,
          conversion_type: conversionType,
          value: value
        }
      });

      console.log(`📊 A/B Test Conversion: ${experimentName}/${variant} - ${conversionType}`);
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  return {
    variant,
    isLoading,
    trackConversion
  };
};
