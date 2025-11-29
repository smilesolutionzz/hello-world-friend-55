import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MetaverseSessionEntrance, type RoomType } from '../shared/MetaverseSessionEntrance';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { useMetaverseSession } from '@/hooks/useMetaverseSession';
import { StructuredCounseling } from '@/components/metaverse/StructuredCounseling';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import { CHARACTERS } from '@/utils/CounselingQuestions';

interface StructuredCounselingModeProps {
  ageGroup: AgeGroup;
  character: CharacterType;
}

export const StructuredCounselingMode = ({ ageGroup, character }: StructuredCounselingModeProps) => {
  const navigate = useNavigate();
  const { hasEntered, handleEnter: onEnter, handleExit } = useMetaverseSession();
  const { openAvatarCreator } = useReadyPlayerMe();
  
  const [sessionConfig, setSessionConfig] = useState<{
    userName: string;
    consultTopic: string;
    selectedRoom: RoomType;
    avatarUrl: string;
    enableMovement: boolean;
    showSubtitles: boolean;
  } | null>(null);

  const handleEnterSession = (config: typeof sessionConfig) => {
    setSessionConfig(config);
    onEnter();
  };

  const characterInfo = CHARACTERS[character];

  if (!hasEntered || !sessionConfig) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-900 to-pink-900/50" />
        
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="absolute top-4 left-4 text-white hover:bg-white/10 z-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로가기
        </Button>

        <MetaverseSessionEntrance
          onEnter={handleEnterSession}
          showConsultTopic={false}
          showMovementToggle={false}
          onAvatarCreatorOpen={openAvatarCreator}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <CounselingRoom 
        roomType={sessionConfig.selectedRoom}
        enableMovement={false}
        character={character}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* 캐릭터 정보 */}
          <Card className="bg-primary/10 backdrop-blur-sm border border-primary/20 p-6 text-center mb-6 max-w-2xl w-full">
            <div className="text-4xl mb-3">🐘</div>
            <h3 className="text-2xl font-bold text-primary mb-2">{characterInfo.name}</h3>
            <p className="text-muted-foreground">{characterInfo.personality}</p>
          </Card>

          {/* 구조화된 상담 컴포넌트 */}
          <StructuredCounseling
            ageGroup={ageGroup}
            character={character}
            onComplete={(result) => console.log('상담 완료:', result)}
            onMessage={(message, isUser) => console.log(`${isUser ? '사용자' : 'AI'}:`, message)}
          />

          <Button 
            onClick={handleExit}
            variant="outline"
            className="mt-6"
          >
            퇴장하기
          </Button>
        </div>
      </CounselingRoom>
    </div>
  );
};
