import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import { ThreeBackground } from '@/components/dashboard/ThreeBackground';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Users, ArrowLeft, Home } from 'lucide-react';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';
import { RolePlaySetup } from '@/components/metaverse/RolePlaySetup';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'structured' | 'free' | 'roleplay'>('structured');
  const [structuredConfig, setStructuredConfig] = useState<{
    ageGroup: AgeGroup;
    character: CharacterType;
  } | null>(null);
  const [roleplayScenario, setRoleplayScenario] = useState<RolePlayScenario | null>(null);

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

  const handleRoleplayStart = (scenario: RolePlayScenario) => {
    setRoleplayScenario(scenario);
  };

  return (
    <div className="relative min-h-screen">
      <ThreeBackground />
      {/* 네비게이션 버튼 */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
        >
          <Home className="w-4 h-4" />
          홈
        </Button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'structured' | 'free' | 'roleplay')} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-8 bg-black/40 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="structured" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Sparkles className="w-4 h-4" />
              금쪽 상담
            </TabsTrigger>
            <TabsTrigger value="roleplay" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Users className="w-4 h-4" />
              롤플레이 연습
            </TabsTrigger>
            <TabsTrigger value="free" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
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

          <TabsContent value="roleplay" className="mt-0">
            {!roleplayScenario ? (
              <RolePlaySetup onStart={handleRoleplayStart} />
            ) : (
              <MetaverseVoiceCounseling 
                mode="roleplay"
                roleplayScenario={roleplayScenario}
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
