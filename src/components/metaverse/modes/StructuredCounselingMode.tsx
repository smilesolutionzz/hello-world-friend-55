import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, MessageCircle } from 'lucide-react';
import { MetaverseSessionEntrance, type RoomType } from '../shared/MetaverseSessionEntrance';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { useMetaverseSession } from '@/hooks/useMetaverseSession';
import { StructuredCounseling } from '@/components/metaverse/StructuredCounseling';
import { CounselingResult } from '@/components/metaverse/CounselingResult';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import { CHARACTERS } from '@/utils/CounselingQuestions';

interface StructuredCounselingModeProps {
  ageGroup: AgeGroup;
  character: CharacterType;
}

export const StructuredCounselingMode = ({ ageGroup, character }: StructuredCounselingModeProps) => {
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

  // 대화창 표시 여부
  const [showChat, setShowChat] = useState(true);
  // 상담 완료 결과
  const [counselingResult, setCounselingResult] = useState<any>(null);

  const handleEnterSession = (config: typeof sessionConfig) => {
    setSessionConfig(config);
    onEnter();
  };

  // 대화창 닫기 (대시보드로 이동하지 않음)
  const handleCloseChat = () => {
    setShowChat(false);
  };

  // 대화창 다시 열기
  const handleOpenChat = () => {
    setShowChat(true);
  };

  // 상담 완료 핸들러
  const handleCounselingComplete = (result: any) => {
    console.log('상담 완료:', result);
    setCounselingResult(result);
  };

  // 다시 상담하기
  const handleRestart = () => {
    setCounselingResult(null);
    setShowChat(true);
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
      {/* 상담 결과 모달 */}
      {counselingResult && (
        <CounselingResult
          result={counselingResult}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      )}

      {/* 대화창 열기 버튼 (대화창이 숨겨졌을 때만 표시) */}
      {!showChat && !counselingResult && (
        <Button
          onClick={handleOpenChat}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          대화 계속하기
        </Button>
      )}

      {/* 대시보드로 이동 버튼 */}
      <Button
        onClick={handleExit}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-50 bg-black/40 hover:bg-black/60 text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        나가기
      </Button>

      <CounselingRoom 
        roomType={sessionConfig.selectedRoom}
        enableMovement={sessionConfig.enableMovement}
        character={character}
      >
        {/* 대화창 (showChat이 true일 때만 표시) */}
        {showChat && !counselingResult && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            {/* X 버튼 - 대화창만 닫기 */}
            <Button
              onClick={handleCloseChat}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

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
              onComplete={handleCounselingComplete}
              onMessage={(message, isUser) => console.log(`${isUser ? '사용자' : 'AI'}:`, message)}
            />

            <Button 
              onClick={handleCloseChat}
              variant="outline"
              className="mt-6"
            >
              대화창 숨기기
            </Button>
          </div>
        )}
      </CounselingRoom>
    </div>
  );
};
