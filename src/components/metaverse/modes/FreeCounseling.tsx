import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MetaverseSessionEntrance, type RoomType } from '../shared/MetaverseSessionEntrance';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { useMetaverseSession } from '@/hooks/useMetaverseSession';

export const FreeCounseling = () => {
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

  if (!hasEntered || !sessionConfig) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-900 to-pink-900/50" />
        
        {/* 뒤로가기 버튼 */}
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
          showConsultTopic={true}
          showMovementToggle={true}
          onAvatarCreatorOpen={openAvatarCreator}
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
        {/* 메타버스 3D 씬 */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">자유 대화 모드</h2>
            <p className="text-white/70 mb-4">
              환영합니다, {sessionConfig.userName}님!
            </p>
            <p className="text-white/60 text-sm mb-6">
              주제: {sessionConfig.consultTopic}
            </p>
            
            {/* TODO: 음성 채팅 UI, 컨트롤 등 추가 */}
            
            <Button 
              onClick={handleExit}
              variant="outline"
              className="w-full"
            >
              퇴장하기
            </Button>
          </Card>
        </div>
      </CounselingRoom>
    </div>
  );
};
