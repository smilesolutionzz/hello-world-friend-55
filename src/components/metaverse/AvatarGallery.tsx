import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

// Ready Player Me 샘플 아바타 URL 목록
// 고정 아바타 1개
const FIXED_AVATAR = {
  id: 1,
  name: '기본 아바타',
  url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',
  thumbnail: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.png',
  gender: 'male' as const
};

export { FIXED_AVATAR };

interface AvatarGalleryProps {
  selectedUrl?: string;
  onSelect: (url: string) => void;
}

export const AvatarGallery = ({ selectedUrl, onSelect }: AvatarGalleryProps) => {
  return (
    <Card className="p-4 bg-muted/50">
      <h3 className="text-sm font-semibold mb-3">🎭 아바타</h3>
      <button
        onClick={() => onSelect(FIXED_AVATAR.url)}
        className={`relative w-full rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
          selectedUrl === FIXED_AVATAR.url
            ? 'border-primary shadow-lg shadow-primary/20'
            : 'border-transparent hover:border-primary/50'
        }`}
      >
        <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="text-5xl">👤</div>
        </div>
        
        {selectedUrl === FIXED_AVATAR.url && (
          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-sm py-2 px-3 text-center">
          {FIXED_AVATAR.name}
        </div>
      </button>
    </Card>
  );
};
