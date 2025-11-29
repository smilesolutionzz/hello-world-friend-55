import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Sofa, TreePine, Frame, Lamp } from 'lucide-react';

interface RoomDecorationUIProps {
  onClose: () => void;
  onPlaceItem: (itemType: string, itemId: string) => void;
}

interface DecorationItem {
  type: string;
  id: string;
  name: string;
  icon: any;
  description: string;
}

const decorationItems: DecorationItem[] = [
  { type: 'furniture', id: 'sofa_1', name: '편안한 소파', icon: Sofa, description: '따뜻한 분위기의 소파' },
  { type: 'furniture', id: 'chair_1', name: '의자', icon: Sofa, description: '심플한 의자' },
  { type: 'plant', id: 'tree_1', name: '작은 나무', icon: TreePine, description: '싱그러운 화분' },
  { type: 'plant', id: 'plant_1', name: '관엽 식물', icon: TreePine, description: '공기정화 식물' },
  { type: 'picture', id: 'frame_1', name: '액자', icon: Frame, description: '벽걸이 액자' },
  { type: 'picture', id: 'photo_1', name: '사진', icon: Frame, description: '추억의 사진' },
  { type: 'light', id: 'lamp_1', name: '스탠드', icon: Lamp, description: '따뜻한 조명' },
  { type: 'light', id: 'ceiling_1', name: '천장 조명', icon: Lamp, description: '밝은 조명' },
];

export const RoomDecorationUI = ({ onClose, onPlaceItem }: RoomDecorationUIProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'furniture', name: '가구' },
    { id: 'plant', name: '식물' },
    { id: 'picture', name: '장식품' },
    { id: 'light', name: '조명' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? decorationItems
    : decorationItems.filter(item => item.type === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">🏠 공간 꾸미기</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-white/70 mb-4">
          원하는 아이템을 선택하고 배치해보세요!
        </p>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* 아이템 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="bg-black/30 border-purple-500/20 p-4 hover:bg-black/40 transition-colors cursor-pointer"
                onClick={() => {
                  onPlaceItem(item.type, item.id);
                  onClose();
                }}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon className="w-8 h-8 text-primary" />
                  <div>
                    <h4 className="text-white font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-white/60">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-white/80">
            💡 팁: 아이템을 선택하면 3D 공간에 나타납니다. 마우스로 위치를 조정할 수 있어요!
          </p>
        </div>
      </Card>
    </div>
  );
};