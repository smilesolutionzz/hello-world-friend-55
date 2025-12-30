import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

// 아바타 타입 정의
export type AvatarType = 'cute' | 'female';

// 귀여운 캐릭터 (3D 동물 캐릭터 사용)
const CUTE_AVATAR = {
  id: 'cute',
  name: '귀여운 캐릭터',
  type: 'cute' as AvatarType,
  thumbnail: '🐘'
};

// 여성 아바타 (Ready Player Me)
const FEMALE_AVATAR = {
  id: 'female',
  name: '여성 아바타',
  type: 'female' as AvatarType,
  url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',
  thumbnail: '👩'
};

// 기존 호환성을 위한 export
export const FIXED_AVATAR = FEMALE_AVATAR;

interface AvatarGalleryProps {
  selectedType?: AvatarType;
  onSelect: (type: AvatarType, url?: string) => void;
}

export const AvatarGallery = ({ selectedType = 'cute', onSelect }: AvatarGalleryProps) => {
  return (
    <Card className="p-4 bg-muted/50">
      <h3 className="text-sm font-semibold mb-3">🎭 아바타</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* 귀여운 캐릭터 옵션 */}
        <button
          onClick={() => onSelect('cute')}
          className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
            selectedType === 'cute'
              ? 'border-primary shadow-lg shadow-primary/20'
              : 'border-transparent hover:border-primary/50'
          }`}
        >
          <div className="aspect-square bg-gradient-to-br from-amber-200 to-orange-100 flex items-center justify-center">
            <div className="text-4xl">🐘</div>
          </div>
          
          {selectedType === 'cute' && (
            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
              <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-1.5 px-2 text-center">
            {CUTE_AVATAR.name}
          </div>
        </button>

        {/* 여성 아바타 옵션 */}
        <button
          onClick={() => onSelect('female', FEMALE_AVATAR.url)}
          className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
            selectedType === 'female'
              ? 'border-primary shadow-lg shadow-primary/20'
              : 'border-transparent hover:border-primary/50'
          }`}
        >
          <div className="aspect-square bg-gradient-to-br from-pink-200 to-purple-100 flex items-center justify-center">
            <div className="text-4xl">👩</div>
          </div>
          
          {selectedType === 'female' && (
            <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
              <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-1.5 px-2 text-center">
            {FEMALE_AVATAR.name}
          </div>
        </button>
      </div>
    </Card>
  );
};