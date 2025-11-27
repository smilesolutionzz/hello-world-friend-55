import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Home, Bed, GraduationCap, Users, Sofa, Trees, Gamepad2, Package, Palette, BookOpen, Flower2 } from 'lucide-react';
import type { RoomType } from '@/components/3d/CounselingRoom';

interface RoomOption {
  id: RoomType;
  name: string;
  icon: any;
  description: string;
}

const roomOptions: RoomOption[] = [
  { id: 'counseling', name: '상담실', icon: Sofa, description: '따뜻한 상담실' },
  { id: 'office', name: '회사 사무실', icon: Building2, description: '업무 공간' },
  { id: 'home', name: '친정 엄마집', icon: Home, description: '편안한 집' },
  { id: 'bedroom', name: '안방', icon: Bed, description: '아늑한 침실' },
  { id: 'school', name: '학교', icon: GraduationCap, description: '학교 교실' },
  { id: 'club', name: '대학 동아리실', icon: Users, description: '동아리 공간' },
  { id: 'living', name: '거실', icon: Sofa, description: '편안한 거실' },
  { id: 'outdoor', name: '야외 잔디구장', icon: Trees, description: '자연 속에서' },
  { id: 'playground', name: '놀이터', icon: Gamepad2, description: '신나는 놀이터' },
  { id: 'toyroom', name: '장난감방', icon: Package, description: '재미있는 장난감방' },
  { id: 'artroom', name: '미술실', icon: Palette, description: '창의적인 미술실' },
  { id: 'library', name: '도서관', icon: BookOpen, description: '조용한 도서관' },
  { id: 'garden', name: '정원', icon: Flower2, description: '예쁜 꽃 정원' },
];

interface RoomTransitionUIProps {
  currentRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  onClose: () => void;
}

export const RoomTransitionUI = ({ currentRoom, onSelectRoom, onClose }: RoomTransitionUIProps) => {
  const availableRooms = roomOptions.filter(room => room.id !== currentRoom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border-2 border-primary/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">다른 방으로 이동</h2>
              <p className="text-sm text-muted-foreground mt-1">원하는 공간을 선택하세요</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              취소
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRooms.map((room) => {
              const Icon = room.icon;
              return (
                <Button
                  key={room.id}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => {
                    onSelectRoom(room.id);
                    onClose();
                  }}
                >
                  <Icon className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{room.name}</div>
                    <div className="text-xs text-muted-foreground">{room.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
