import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import { ThreeBackground } from '@/components/dashboard/ThreeBackground';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles } from 'lucide-react';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'structured' | 'free'>('structured');
  const [structuredConfig, setStructuredConfig] = useState<{
    ageGroup: AgeGroup;
    character: CharacterType;
  } | null>(null);

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

  const handleStructuredStart = (ageGroup: AgeGroup, character: CharacterType) => {
    setStructuredConfig({ ageGroup, character });
  };

  return (
    <div className="relative min-h-screen bg-background">
      <ThreeBackground />
      <div className="relative z-10 container mx-auto py-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'structured' | 'free')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card">
            <TabsTrigger value="structured" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4" />
              금쪽 상담
            </TabsTrigger>
            <TabsTrigger value="free" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="w-4 h-4" />
              자유 대화
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structured" className="mt-0">
            {!structuredConfig ? (
              <CounselingSetup onStart={handleStructuredStart} />
            ) : (
              <MetaverseVoiceCounseling 
                mode="structured"
                structuredConfig={structuredConfig}
              />
            )}
          </TabsContent>

          <TabsContent value="free" className="mt-0">
            <MetaverseVoiceCounseling mode="free" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaverseVoicePage;
