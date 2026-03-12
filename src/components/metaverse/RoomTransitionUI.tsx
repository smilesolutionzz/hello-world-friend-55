import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Home, Bed, GraduationCap, Users, Sofa, Trees, Gamepad2, Package, Palette, BookOpen, Flower2 } from 'lucide-react';
import type { RoomType } from '@/components/3d/CounselingRoom';
import { useLanguage } from '@/i18n/LanguageContext';

interface RoomOption {
  id: RoomType;
  nameKo: string;
  nameEn: string;
  icon: any;
  descKo: string;
  descEn: string;
}

const roomOptions: RoomOption[] = [
  { id: 'counseling', nameKo: '상담실', nameEn: 'Counseling Room', icon: Sofa, descKo: '따뜻한 상담실', descEn: 'Warm counseling space' },
  { id: 'office', nameKo: '회사 사무실', nameEn: 'Office', icon: Building2, descKo: '업무 공간', descEn: 'Work space' },
  { id: 'home', nameKo: '친정 엄마집', nameEn: "Mom's House", icon: Home, descKo: '편안한 집', descEn: 'Cozy home' },
  { id: 'bedroom', nameKo: '안방', nameEn: 'Bedroom', icon: Bed, descKo: '아늑한 침실', descEn: 'Cozy bedroom' },
  { id: 'school', nameKo: '학교', nameEn: 'School', icon: GraduationCap, descKo: '학교 교실', descEn: 'Classroom' },
  { id: 'club', nameKo: '대학 동아리실', nameEn: 'Club Room', icon: Users, descKo: '동아리 공간', descEn: 'Club space' },
  { id: 'living', nameKo: '거실', nameEn: 'Living Room', icon: Sofa, descKo: '편안한 거실', descEn: 'Comfortable living room' },
  { id: 'outdoor', nameKo: '야외 잔디구장', nameEn: 'Outdoor Field', icon: Trees, descKo: '자연 속에서', descEn: 'In nature' },
  { id: 'playground', nameKo: '놀이터', nameEn: 'Playground', icon: Gamepad2, descKo: '신나는 놀이터', descEn: 'Fun playground' },
  { id: 'toyroom', nameKo: '장난감방', nameEn: 'Toy Room', icon: Package, descKo: '재미있는 장난감방', descEn: 'Fun toy room' },
  { id: 'artroom', nameKo: '미술실', nameEn: 'Art Room', icon: Palette, descKo: '창의적인 미술실', descEn: 'Creative art room' },
  { id: 'library', nameKo: '도서관', nameEn: 'Library', icon: BookOpen, descKo: '조용한 도서관', descEn: 'Quiet library' },
  { id: 'garden', nameKo: '정원', nameEn: 'Garden', icon: Flower2, descKo: '예쁜 꽃 정원', descEn: 'Beautiful garden' },
];

interface RoomTransitionUIProps {
  currentRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  onClose: () => void;
}

export const RoomTransitionUI = ({ currentRoom, onSelectRoom, onClose }: RoomTransitionUIProps) => {
  const { isEnglish } = useLanguage();
  const availableRooms = roomOptions.filter(room => room.id !== currentRoom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border-2 border-primary/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{isEnglish ? 'Move to Another Room' : '다른 방으로 이동'}</h2>
              <p className="text-sm text-muted-foreground mt-1">{isEnglish ? 'Choose your space' : '원하는 공간을 선택하세요'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              {isEnglish ? 'Cancel' : '취소'}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRooms.map((room) => {
              const Icon = room.icon;
              return (
                <Button key={room.id} variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-primary/10 hover:border-primary transition-all" onClick={() => { onSelectRoom(room.id); onClose(); }}>
                  <Icon className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{isEnglish ? room.nameEn : room.nameKo}</div>
                    <div className="text-xs text-muted-foreground">{isEnglish ? room.descEn : room.descKo}</div>
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
