import { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Paintbrush, Eraser, Trash2, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Drawing3DPanelProps {
  onClose: () => void;
  onImageConverted: (imageUrl: string) => void;
}

export const Drawing3DPanel = ({ onClose, onImageConverted }: Drawing3DPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 흰색 배경으로 초기화
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const convertTo3D = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsConverting(true);
    try {
      const imageDataUrl = canvas.toDataURL('image/png');

      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: { imageDataUrl }
      });

      if (error) throw error;

      if (data?.image3D) {
        onImageConverted(data.image3D);
        toast({
          title: '3D 변환 완료!',
          description: '그림이 3D 큐브로 변환되어 메타버스에 배치되었습니다.',
        });
        onClose();
      }
    } catch (error) {
      console.error('3D conversion error:', error);
      toast({
        title: '변환 실패',
        description: '3D 변환 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="fixed right-4 top-20 z-50 w-96 p-4 bg-card/95 backdrop-blur-md border-2 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          그림 그리기
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 캔버스 */}
      <div className="mb-4 border-2 border-border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={352}
          height={280}
          className="cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* 도구 모음 */}
      <div className="space-y-3">
        {/* 색상 팔레트 */}
        <div className="flex gap-2 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setCurrentColor(color);
                setIsEraser(false);
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                currentColor === color && !isEraser ? 'border-primary scale-110' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* 브러시 크기 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">브러시 크기: {brushSize}px</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 도구 버튼 */}
        <div className="flex gap-2">
          <Button
            variant={isEraser ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEraser(!isEraser)}
            className="flex-1"
          >
            <Eraser className="w-4 h-4 mr-2" />
            지우개
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            전체 지우기
          </Button>
        </div>

        {/* 3D 변환 버튼 */}
        <Button
          onClick={convertTo3D}
          disabled={isConverting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              3D 변환 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              3D 큐브로 변환하기
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
