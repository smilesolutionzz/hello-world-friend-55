import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sofa, Building2, Home, Bed, GraduationCap, Users, Trees, Gamepad2, Package, Palette, BookOpen, Flower2, CheckCircle2 } from 'lucide-react';
import { FIXED_AVATAR } from '@/components/metaverse/AvatarGallery';

export type RoomType = 'counseling' | 'office' | 'home' | 'bedroom' | 'school' | 'club' | 'living' | 'outdoor' | 'playground' | 'toyroom' | 'artroom' | 'library' | 'garden';

const roomOptions = [
  { id: 'counseling' as RoomType, name: '상담실', icon: Sofa, description: '따뜻한 상담실' },
  { id: 'office' as RoomType, name: '회사 사무실', icon: Building2, description: '업무 공간' },
  { id: 'home' as RoomType, name: '친정 엄마집', icon: Home, description: '편안한 집' },
  { id: 'bedroom' as RoomType, name: '안방', icon: Bed, description: '아늑한 침실' },
  { id: 'school' as RoomType, name: '학교', icon: GraduationCap, description: '학교 교실' },
  { id: 'club' as RoomType, name: '대학 동아리실', icon: Users, description: '동아리 공간' },
  { id: 'living' as RoomType, name: '거실', icon: Sofa, description: '편안한 거실' },
  { id: 'outdoor' as RoomType, name: '야외 잔디구장', icon: Trees, description: '자연 속에서' },
  { id: 'playground' as RoomType, name: '놀이터', icon: Gamepad2, description: '신나는 놀이터' },
  { id: 'toyroom' as RoomType, name: '장난감방', icon: Package, description: '재미있는 장난감방' },
  { id: 'artroom' as RoomType, name: '미술실', icon: Palette, description: '창의적인 미술실' },
  { id: 'library' as RoomType, name: '도서관', icon: BookOpen, description: '조용한 도서관' },
  { id: 'garden' as RoomType, name: '정원', icon: Flower2, description: '예쁜 꽃 정원' },
];

interface MetaverseSessionEntranceProps {
  onEnter: (config: {
    userName: string;
    consultTopic: string;
    selectedRoom: RoomType;
    avatarUrl: string;
    enableMovement: boolean;
    showSubtitles: boolean;
  }) => void;
  showConsultTopic?: boolean;
  showMovementToggle?: boolean;
}

export const MetaverseSessionEntrance = ({ 
  onEnter, 
  showConsultTopic = true,
  showMovementToggle = true
}: MetaverseSessionEntranceProps) => {
  const [userName, setUserName] = useState('');
  const [consultTopic, setConsultTopic] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('counseling');
  const [enableMovement, setEnableMovement] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);

  const handleEnter = () => {
    if (!userName.trim()) return;
    if (showConsultTopic && !consultTopic.trim()) return;
    
    onEnter({
      userName: userName.trim(),
      consultTopic: consultTopic.trim(),
      selectedRoom,
      avatarUrl: FIXED_AVATAR.url,
      enableMovement,
      showSubtitles
    });
  };

  return (
    <>
      <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 max-w-2xl w-full animate-scale-in shadow-xl shadow-purple-500/20">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">메타버스 입장</h2>
            <p className="text-white/70">정보를 입력하고 입장해주세요</p>
          </div>

          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-white">이름</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="bg-background/50 border-purple-500/30 text-white placeholder:text-white/40"
            />
          </div>

          {/* 상담 주제 (옵션) */}
          {showConsultTopic && (
            <div className="space-y-2">
              <Label htmlFor="consultTopic" className="text-white">상담 주제</Label>
              <Input
                id="consultTopic"
                value={consultTopic}
                onChange={(e) => setConsultTopic(e.target.value)}
                placeholder="어떤 이야기를 나누고 싶으신가요?"
                className="bg-background/50 border-purple-500/30 text-white placeholder:text-white/40"
              />
            </div>
          )}

          {/* 방 선택 */}
          <div className="space-y-3">
            <Label className="text-white">상담 공간 선택</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-background/30 rounded-lg">
              {roomOptions.map((room) => {
                const Icon = room.icon;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedRoom === room.id
                        ? 'bg-purple-500/30 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-background/50 border-purple-500/20 hover:bg-background/70'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="text-xs font-medium text-white">{room.name}</div>
                    <div className="text-[10px] text-white/60">{room.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 고정 아바타 표시 */}
          <div className="space-y-3">
            <Label className="text-white">아바타</Label>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{FIXED_AVATAR.name}</div>
                <div className="text-sm text-white/60">기본 아바타가 사용됩니다</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </div>

          {/* 추가 설정 */}
          <div className="space-y-3">
            {showMovementToggle && (
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <Label htmlFor="movement" className="text-white cursor-pointer">
                  캐릭터 이동 활성화
                </Label>
                <Switch
                  id="movement"
                  checked={enableMovement}
                  onCheckedChange={setEnableMovement}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <Label htmlFor="subtitles" className="text-white cursor-pointer">
                자막 표시
              </Label>
              <Switch
                id="subtitles"
                checked={showSubtitles}
                onCheckedChange={setShowSubtitles}
              />
            </div>
          </div>

          {/* 입장 버튼 */}
          <Button
            onClick={handleEnter}
            disabled={!userName.trim() || (showConsultTopic && !consultTopic.trim())}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            메타버스 입장
          </Button>
        </div>
      </Card>

    </>
  );
};
