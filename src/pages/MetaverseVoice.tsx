import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mic, ArrowLeft, Home, Gamepad2, Sparkles } from 'lucide-react';
import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import { CounselingSetup } from '@/components/metaverse/CounselingSetup';
import GameCounselingMode from '@/components/metaverse/GameCounselingMode';
import GameCounseling3DMode from '@/components/metaverse/GameCounseling3DMode';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';

const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [use3D, setUse3D] = useState(false);
  
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
            🎭 금쪽상담소
          </h1>
          <p className="text-purple-200/80">
            원하는 상담 방식을 선택하세요
          </p>
        </div>

        <Tabs value={activeTab || ''} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
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
            {/* 3D/2D 전환 토글 */}
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUse3D(!use3D)}
                className={`gap-2 text-xs ${use3D ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700' : 'bg-black/30 text-white/70 border-white/10'}`}
              >
                <Sparkles className="w-3 h-3" />
                {use3D ? '3D 몰입형 ✨' : '2D 카드형'}
              </Button>
            </div>
            {use3D ? <GameCounseling3DMode /> : <GameCounselingMode />}
          </TabsContent>

          <TabsContent value="voice" className="mt-0">
            <CounselingSetup onStart={handleStructuredStart} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaverseVoicePage;
