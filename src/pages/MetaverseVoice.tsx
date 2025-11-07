import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { useToast } from '@/hooks/use-toast';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "로그인이 필요합니다",
          description: "메타버스 상담실은 로그인 후 이용 가능합니다",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return <MetaverseVoiceCounseling />;
};

export default MetaverseVoicePage;
