import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import { ThreeBackground } from '@/components/dashboard/ThreeBackground';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Users, ArrowLeft, Stethoscope } from 'lucide-react';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';
import { RolePlaySetup } from '@/components/metaverse/RolePlaySetup';
import { TherapistSelector } from '@/components/metaverse/TherapistSelector';
import type { TherapistType } from '@/types/therapist';
import { FreeCounseling } from '@/components/metaverse/modes/FreeCounseling';
import { StructuredCounselingMode } from '@/components/metaverse/modes/StructuredCounselingMode';
import { RolePlayMode } from '@/components/metaverse/modes/RolePlayMode';
import { TherapyMode } from '@/components/metaverse/modes/TherapyMode';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'structured' | 'free' | 'roleplay' | 'therapy'>('structured');
  const [structuredConfig, setStructuredConfig] = useState<{
    ageGroup: AgeGroup;
    character: CharacterType;
  } | null>(null);
  const [roleplayScenario, setRoleplayScenario] = useState<RolePlayScenario | null>(null);
  const [therapistType, setTherapistType] = useState<TherapistType | null>(null);
  const [therapyUserConcern, setTherapyUserConcern] = useState<string>('');

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

  const handleTherapistSelect = (type: TherapistType, concern: string) => {
    setTherapistType(type);
    setTherapyUserConcern(concern);
  };

  return (
    <div className="relative min-h-screen">
      <ThreeBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4 pb-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'structured' | 'free' | 'roleplay' | 'therapy')} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 mb-8 bg-black/40 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="structured" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">금쪽 상담</span>
            </TabsTrigger>
            <TabsTrigger value="therapy" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">AI 치료사</span>
            </TabsTrigger>
            <TabsTrigger value="roleplay" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">롤플레이 연습</span>
            </TabsTrigger>
            <TabsTrigger value="free" className="gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">자유 대화</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structured" className="mt-0">
            {!structuredConfig ? (
              <CounselingSetup onStart={handleStructuredStart} />
            ) : (
              <StructuredCounselingMode
                ageGroup={structuredConfig.ageGroup}
                character={structuredConfig.character}
              />
            )}
          </TabsContent>

          <TabsContent value="therapy" className="mt-0">
            {!therapistType ? (
              <TherapistSelector onSelect={handleTherapistSelect} />
            ) : (
              <TherapyMode
                therapistType={therapistType}
                userConcern={therapyUserConcern}
              />
            )}
          </TabsContent>

          <TabsContent value="roleplay" className="mt-0">
            {!roleplayScenario ? (
              <RolePlaySetup onStart={handleRoleplayStart} />
            ) : (
              <RolePlayMode scenario={roleplayScenario} />
            )}
          </TabsContent>

          <TabsContent value="free" className="mt-0">
            <FreeCounseling />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaverseVoicePage;
