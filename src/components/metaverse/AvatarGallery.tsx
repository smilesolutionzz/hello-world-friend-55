import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2 } from 'lucide-react';

// Ready Player Me 검증된 샘플 아바타 URL 목록
const SAMPLE_AVATARS = [
  {
    id: 1,
    name: '캐주얼 남성',
    url: 'https://models.readyplayer.me/6478d1c0c4349fb67cc65d60.glb',
    gender: 'male'
  },
  {
    id: 2,
    name: '비즈니스 여성',
    url: 'https://models.readyplayer.me/6478d2a8c4349fb67cc65f75.glb',
    gender: 'female'
  },
  {
    id: 3,
    name: '스포티 남성',
    url: 'https://models.readyplayer.me/6478d3f5c4349fb67cc66193.glb',
    gender: 'male'
  },
  {
    id: 4,
    name: '엘레강스 여성',
    url: 'https://models.readyplayer.me/6478d4bbc4349fb67cc662f8.glb',
    gender: 'female'
  },
  {
    id: 5,
    name: '스트릿 남성',
    url: 'https://models.readyplayer.me/6478d587c4349fb67cc66469.glb',
    gender: 'male'
  },
  {
    id: 6,
    name: '모던 여성',
    url: 'https://models.readyplayer.me/6478d64fc4349fb67cc665c8.glb',
    gender: 'female'
  }
];

interface AvatarGalleryProps {
  selectedUrl?: string;
  onSelect: (url: string) => void;
}

export const AvatarGallery = ({ selectedUrl, onSelect }: AvatarGalleryProps) => {
  return (
    <Card className="p-4 bg-muted/50">
      <h3 className="text-sm font-semibold mb-3">📸 샘플 아바타 갤러리</h3>
      <ScrollArea className="h-48">
        <div className="grid grid-cols-3 gap-3">
          {SAMPLE_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.url)}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                selectedUrl === avatar.url
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              {/* 썸네일 대신 기본 아이콘 표시 */}
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-3xl">
                  {avatar.gender === 'male' ? '👨' : '👩'}
                </div>
              </div>
              
              {/* 선택됨 표시 */}
              {selectedUrl === avatar.url && (
                <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {/* 이름 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-1 px-2 text-center">
                {avatar.name}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground mt-2">
        💡 샘플 아바타를 클릭하여 빠르게 선택하세요
      </p>
    </Card>
  );
};
