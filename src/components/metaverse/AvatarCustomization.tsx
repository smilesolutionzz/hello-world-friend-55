import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Shirt, Glasses } from 'lucide-react';

interface AvatarCustomizationProps {
  onCustomize: (customization: AvatarCustomization) => void;
}

export interface AvatarCustomization {
  skinTone: number; // 0-360 (hue)
  hairColor: number; // 0-360 (hue)
  shirtColor: number; // 0-360 (hue)
  pantsColor: number; // 0-360 (hue)
  hasGlasses: boolean;
  glassesStyle: number; // 0-2
}

export const AvatarCustomization = ({ onCustomize }: AvatarCustomizationProps) => {
  const [customization, setCustomization] = useState<AvatarCustomization>({
    skinTone: 30,
    hairColor: 30,
    shirtColor: 210,
    pantsColor: 220,
    hasGlasses: false,
    glassesStyle: 0
  });

  const updateCustomization = (key: keyof AvatarCustomization, value: number | boolean) => {
    const updated = { ...customization, [key]: value };
    setCustomization(updated);
    onCustomize(updated);
  };

  const hueToColor = (hue: number) => `hsl(${hue}, 70%, 50%)`;

  return (
    <Card className="bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Palette className="w-5 h-5" />
          아바타 커스터마이징
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 피부톤 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">피부톤</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[customization.skinTone]}
              onValueChange={([value]) => updateCustomization('skinTone', value)}
              max={60}
              step={1}
              className="flex-1"
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: hueToColor(customization.skinTone) }}
            />
          </div>
        </div>

        {/* 머리 색상 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">머리 색상</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[customization.hairColor]}
              onValueChange={([value]) => updateCustomization('hairColor', value)}
              max={360}
              step={1}
              className="flex-1"
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: hueToColor(customization.hairColor) }}
            />
          </div>
        </div>

        {/* 셔츠 색상 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Shirt className="w-4 h-4" />
            셔츠 색상
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[customization.shirtColor]}
              onValueChange={([value]) => updateCustomization('shirtColor', value)}
              max={360}
              step={1}
              className="flex-1"
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: hueToColor(customization.shirtColor) }}
            />
          </div>
        </div>

        {/* 바지 색상 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">바지 색상</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[customization.pantsColor]}
              onValueChange={([value]) => updateCustomization('pantsColor', value)}
              max={360}
              step={1}
              className="flex-1"
            />
            <div 
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: hueToColor(customization.pantsColor) }}
            />
          </div>
        </div>

        {/* 안경 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Glasses className="w-4 h-4" />
            안경
          </Label>
          <div className="flex gap-2">
            <Button
              variant={customization.hasGlasses ? "default" : "outline"}
              size="sm"
              onClick={() => updateCustomization('hasGlasses', !customization.hasGlasses)}
            >
              {customization.hasGlasses ? '착용 중' : '없음'}
            </Button>
            {customization.hasGlasses && (
              <div className="flex gap-1">
                {[0, 1, 2].map((style) => (
                  <Button
                    key={style}
                    variant={customization.glassesStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateCustomization('glassesStyle', style)}
                  >
                    스타일 {style + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          💡 색상 슬라이더를 조정하여 아바타를 꾸며보세요
        </div>
      </CardContent>
    </Card>
  );
};
