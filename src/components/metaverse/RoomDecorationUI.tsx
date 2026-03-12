import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Sofa, TreePine, Frame, Lamp } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface RoomDecorationUIProps {
  onClose: () => void;
  onPlaceItem: (itemType: string, itemId: string) => void;
}

interface DecorationItem {
  type: string;
  id: string;
  nameKo: string;
  nameEn: string;
  icon: any;
  descKo: string;
  descEn: string;
}

const decorationItems: DecorationItem[] = [
  { type: 'furniture', id: 'sofa_1', nameKo: '편안한 소파', nameEn: 'Cozy Sofa', icon: Sofa, descKo: '따뜻한 분위기의 소파', descEn: 'Warm atmosphere sofa' },
  { type: 'furniture', id: 'chair_1', nameKo: '의자', nameEn: 'Chair', icon: Sofa, descKo: '심플한 의자', descEn: 'Simple chair' },
  { type: 'plant', id: 'tree_1', nameKo: '작은 나무', nameEn: 'Small Tree', icon: TreePine, descKo: '싱그러운 화분', descEn: 'Fresh potted plant' },
  { type: 'plant', id: 'plant_1', nameKo: '관엽 식물', nameEn: 'Foliage Plant', icon: TreePine, descKo: '공기정화 식물', descEn: 'Air-purifying plant' },
  { type: 'picture', id: 'frame_1', nameKo: '액자', nameEn: 'Frame', icon: Frame, descKo: '벽걸이 액자', descEn: 'Wall-mounted frame' },
  { type: 'picture', id: 'photo_1', nameKo: '사진', nameEn: 'Photo', icon: Frame, descKo: '추억의 사진', descEn: 'Memory photo' },
  { type: 'light', id: 'lamp_1', nameKo: '스탠드', nameEn: 'Lamp', icon: Lamp, descKo: '따뜻한 조명', descEn: 'Warm lighting' },
  { type: 'light', id: 'ceiling_1', nameKo: '천장 조명', nameEn: 'Ceiling Light', icon: Lamp, descKo: '밝은 조명', descEn: 'Bright lighting' },
];

export const RoomDecorationUI = ({ onClose, onPlaceItem }: RoomDecorationUIProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { isEnglish } = useLanguage();

  const categories = [
    { id: 'all', nameKo: '전체', nameEn: 'All' },
    { id: 'furniture', nameKo: '가구', nameEn: 'Furniture' },
    { id: 'plant', nameKo: '식물', nameEn: 'Plants' },
    { id: 'picture', nameKo: '장식품', nameEn: 'Decor' },
    { id: 'light', nameKo: '조명', nameEn: 'Lighting' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? decorationItems
    : decorationItems.filter(item => item.type === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{isEnglish ? '🏠 Decorate Your Space' : '🏠 공간 꾸미기'}</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-white/70 mb-4">
          {isEnglish ? 'Select an item and place it in your space!' : '원하는 아이템을 선택하고 배치해보세요!'}
        </p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button key={cat.id} onClick={() => setSelectedCategory(cat.id)} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" className="whitespace-nowrap">
              {isEnglish ? cat.nameEn : cat.nameKo}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="bg-black/30 border-purple-500/20 p-4 hover:bg-black/40 transition-colors cursor-pointer" onClick={() => { onPlaceItem(item.type, item.id); onClose(); }}>
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon className="w-8 h-8 text-primary" />
                  <div>
                    <h4 className="text-white font-medium text-sm">{isEnglish ? item.nameEn : item.nameKo}</h4>
                    <p className="text-xs text-white/60">{isEnglish ? item.descEn : item.descKo}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-white/80">
            {isEnglish
              ? '💡 Tip: Select an item to place it in the 3D space. Use your mouse to adjust its position!'
              : '💡 팁: 아이템을 선택하면 3D 공간에 나타납니다. 마우스로 위치를 조정할 수 있어요!'}
          </p>
        </div>
      </Card>
    </div>
  );
};
