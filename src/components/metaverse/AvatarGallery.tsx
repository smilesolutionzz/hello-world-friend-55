import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2 } from 'lucide-react';

// Ready Player Me 샘플 아바타 URL 목록
const SAMPLE_AVATARS = [
  {
    id: 1,
    name: '샘플 남성 1',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',
    thumbnail: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.png',
    gender: 'male'
  },
  {
    id: 2,
    name: '샘플 여성 1',
    url: 'https://models.readyplayer.me/64bfa2c90e72c63d7c393712.glb',
    thumbnail: 'https://models.readyplayer.me/64bfa2c90e72c63d7c393712.png',
    gender: 'female'
  },
  {
    id: 3,
    name: '샘플 남성 2',
    url: 'https://models.readyplayer.me/64c0a1234f5b7890abc12345.glb',
    thumbnail: 'https://models.readyplayer.me/64c0a1234f5b7890abc12345.png',
    gender: 'male'
  },
  {
    id: 4,
    name: '샘플 여성 2',
    url: 'https://models.readyplayer.me/64c0a5678f5b7890abc67890.glb',
    thumbnail: 'https://models.readyplayer.me/64c0a5678f5b7890abc67890.png',
    gender: 'female'
  },
  {
    id: 5,
    name: '샘플 남성 3',
    url: 'https://models.readyplayer.me/659c0e1bb5a8520a57d05a26.glb',
    thumbnail: 'https://models.readyplayer.me/659c0e1bb5a8520a57d05a26.png',
    gender: 'male'
  },
  {
    id: 6,
    name: '샘플 여성 3',
    url: 'https://models.readyplayer.me/659c0f3ab5a8520a57d05d42.glb',
    thumbnail: 'https://models.readyplayer.me/659c0f3ab5a8520a57d05d42.png',
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
