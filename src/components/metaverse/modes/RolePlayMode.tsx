import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MetaverseSessionEntrance, type RoomType } from '../shared/MetaverseSessionEntrance';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { useMetaverseSession } from '@/hooks/useMetaverseSession';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';

interface RolePlayModeProps {
  scenario: RolePlayScenario;
}

export const RolePlayMode = ({ scenario }: RolePlayModeProps) => {
  const navigate = useNavigate();
  const { hasEntered, handleEnter: onEnter, handleExit } = useMetaverseSession();
  const { avatarUrl, setAvatarUrl, openAvatarCreator } = useReadyPlayerMe();
  
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
          showMovementToggle={true}
          onAvatarCreatorOpen={openAvatarCreator}
          initialAvatarUrl={avatarUrl}
          onAvatarUrlChange={setAvatarUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <CounselingRoom 
        roomType={sessionConfig.selectedRoom}
        enableMovement={sessionConfig.enableMovement}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* 시나리오 정보 */}
          <Card className="bg-primary/10 backdrop-blur-sm border border-primary/20 p-6 text-center mb-6 max-w-2xl w-full">
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="text-2xl font-bold text-primary mb-2">{scenario.title}</h3>
            <p className="text-muted-foreground mb-4">{scenario.description}</p>
            <div className="text-sm text-muted-foreground">
              <strong>상황:</strong> {scenario.situation}
            </div>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">롤플레이 모드</h2>
            <p className="text-white/70 mb-4">
              환영합니다, {sessionConfig.userName}님!
            </p>
            
            {/* TODO: 음성 채팅 UI, 시나리오 진행 로직 추가 */}
            
            <Button 
              onClick={handleExit}
              variant="outline"
              className="w-full mt-6"
            >
              퇴장하기
            </Button>
          </Card>
        </div>
      </CounselingRoom>
    </div>
  );
};
