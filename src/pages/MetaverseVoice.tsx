import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mic, Theater, Sparkles, ArrowLeft, Home } from 'lucide-react';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import { RolePlaySetup } from '@/components/metaverse/RolePlaySetup';
import { RolePlayMode } from '@/components/metaverse/modes/RolePlayMode';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  
  // 금쪽상담 상태
  const [structuredConfig, setStructuredConfig] = useState<{
    ageGroup: AgeGroup;
    character: CharacterType;
  } | null>(null);
  
  // 롤플레이 상태
  const [roleplayScenario, setRoleplayScenario] = useState<RolePlayScenario | null>(null);

  // 금쪽상담 시작
  const handleStructuredStart = (ageGroup: AgeGroup, character: CharacterType) => {
    setStructuredConfig({ ageGroup, character });
  };

  // 롤플레이 시작
  const handleRoleplayStart = (scenario: RolePlayScenario) => {
    setRoleplayScenario(scenario);
  };

  // 자유상담 탭 선택 시 바로 이동
  if (activeTab === 'free') {
    return <MetaverseVoiceCounseling mode="free" />;
  }

  // 금쪽상담 - 설정 완료 시
  if (activeTab === 'structured' && structuredConfig) {
    return (
      <MetaverseVoiceCounseling 
        mode="structured"
        structuredConfig={structuredConfig}
      />
    );
  }

  // 롤플레이 - 시나리오 선택 완료 시
  if (activeTab === 'roleplay' && roleplayScenario) {
    return <RolePlayMode scenario={roleplayScenario} />;
  }

  // 탭 선택 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 상단 네비게이션 */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/90 backdrop-blur-sm shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/90 backdrop-blur-sm shadow-lg"
        >
          <Home className="w-4 h-4" />
          홈
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎭 AI 아지트
          </h1>
          <p className="text-purple-200/80">
            원하는 상담 방식을 선택하세요
          </p>
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg md:hidden max-w-md mx-auto">
            <p className="text-amber-200 text-sm flex items-center justify-center gap-2">
              💻 PC에서 사용하시면 더욱 원활하게 이용하실 수 있습니다.
            </p>
          </div>
        </div>

        <Tabs value={activeTab || ''} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-3 w-full mb-8 bg-black/40 p-1">
            <TabsTrigger 
              value="free" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/70"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">자유 상담</span>
              <span className="sm:hidden">자유</span>
            </TabsTrigger>
            <TabsTrigger 
              value="structured" 
              className="flex items-center gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white text-white/70"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">금쪽 상담</span>
              <span className="sm:hidden">금쪽</span>
            </TabsTrigger>
            <TabsTrigger 
              value="roleplay" 
              className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-white/70"
            >
              <Theater className="w-4 h-4" />
              <span className="hidden sm:inline">롤플레이</span>
              <span className="sm:hidden">롤플</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="free" className="mt-0">
            {/* 자유상담은 바로 MetaverseVoiceCounseling으로 이동 */}
          </TabsContent>

          <TabsContent value="structured" className="mt-0">
            <CounselingSetup onStart={handleStructuredStart} />
          </TabsContent>

          <TabsContent value="roleplay" className="mt-0">
            <RolePlaySetup onStart={handleRoleplayStart} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaverseVoicePage;