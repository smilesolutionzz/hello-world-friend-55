import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mic, ArrowLeft, Home, Gamepad2 } from 'lucide-react';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import GameCounseling3DMode from '@/components/metaverse/GameCounseling3DMode';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [structuredConfig, setStructuredConfig] = useState<{
    ageGroup: AgeGroup;
    character: CharacterType;
  } | null>(null);

  const handleStructuredStart = (ageGroup: AgeGroup, character: CharacterType) => {
    setStructuredConfig({ ageGroup, character });
  };

  // 음성 상담 진입 시
  if (activeTab === 'voice' && structuredConfig) {
    return (
      <MetaverseVoiceCounseling 
        mode="structured"
        structuredConfig={structuredConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 상단 네비게이션 */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={goBack}
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

      <div className="w-full mx-auto px-3 md:px-6 py-16 max-w-[1600px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎭 금쪽상담소
          </h1>
          <p className="text-purple-200/80">
            원하는 상담 방식을 선택하세요
          </p>
        </div>

        <Tabs value={activeTab || ''} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-black/40 p-1 max-w-md mx-auto">
            <TabsTrigger 
              value="game" 
              className="flex items-center gap-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white text-white/70"
            >
              <Gamepad2 className="w-4 h-4" />
              게임 상담
            </TabsTrigger>
            <TabsTrigger 
              value="voice" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/70"
            >
              <Mic className="w-4 h-4" />
              음성 상담
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="mt-0">
            <GameCounseling3DMode />
          </TabsContent>

          <TabsContent value="voice" className="mt-0">
            <div className="rounded-3xl bg-white/95 border border-white/40 p-8 text-center max-w-xl mx-auto shadow-xl">
              <div className="text-6xl mb-4">🐘</div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">코끼리와 실시간 음성 상담</h2>
              <p className="text-neutral-500 mb-6 text-sm break-keep">
                자연스럽게 말하면 코끼리가 끊김 없이 들어주고 답해드려요. 새로워진 깔끔한 화면으로 안내해드릴게요.
              </p>
              <Button
                onClick={() => navigate('/voice-counseling')}
                className="h-12 px-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white gap-2"
              >
                <Mic className="w-4 h-4" /> 코끼리와 대화 시작
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaverseVoicePage;
