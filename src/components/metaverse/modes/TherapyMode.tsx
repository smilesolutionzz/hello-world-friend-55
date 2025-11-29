import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MetaverseSessionEntrance, type RoomType } from '../shared/MetaverseSessionEntrance';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { useMetaverseSession } from '@/hooks/useMetaverseSession';
import { getTherapistProfile } from '@/utils/TherapistProfiles';
import type { TherapistType } from '@/types/therapist';

interface TherapyModeProps {
  therapistType: TherapistType;
  userConcern: string;
}

export const TherapyMode = ({ therapistType, userConcern }: TherapyModeProps) => {
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

  const therapistProfile = getTherapistProfile(therapistType);

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
          {/* 치료사 정보 */}
          <Card className="bg-primary/10 backdrop-blur-sm border border-primary/20 p-6 text-center mb-6 max-w-2xl w-full">
            <div className="text-4xl mb-3">{therapistProfile.icon}</div>
            <h3 className="text-2xl font-bold text-primary mb-2">{therapistProfile.nameKo}</h3>
            <p className="text-sm text-muted-foreground mb-3">{therapistProfile.name}</p>
            <p className="text-muted-foreground mb-2">{therapistProfile.description}</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {therapistProfile.specialty.map((spec, idx) => (
                <span key={idx} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {spec}
                </span>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">전문 치료 모드</h2>
            <p className="text-white/70 mb-4">
              환영합니다, {sessionConfig.userName}님!
            </p>
            <p className="text-white/60 text-sm mb-6">
              고민: {userConcern}
            </p>
            
            {/* TODO: 음성 채팅 UI, 치료 세션 로직 추가 */}
            
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
