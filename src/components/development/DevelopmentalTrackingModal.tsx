import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentalTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  studentId?: string;
}

const domains = [
  { key: 'motor', label: '대소근육 운동' },
  { key: 'language', label: '언어발달' },
  { key: 'social', label: '사회성' },
  { key: 'cognitive', label: '인지발달' },
  { key: 'adaptive', label: '적응행동' }
];

const DevelopmentalTrackingModal = ({ isOpen, onClose, onSave, studentId }: DevelopmentalTrackingModalProps) => {
  const [formData, setFormData] = useState({
    domain: '',
    skill_area: '',
    current_level: [3],
    target_level: [4],
    notes: '',
    assessor_notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!formData.domain || !formData.skill_area) {
      toast({
        title: "입력 필요",
        description: "영역과 기술 영역을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('developmental_tracking')
        .insert({
          domain: formData.domain,
          skill_area: formData.skill_area,
          current_level: formData.current_level[0],
          target_level: formData.target_level[0],
          notes: formData.notes || null,
          assessor_notes: formData.assessor_notes || null,
          student_id: studentId || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "발달 추적 데이터가 성공적으로 저장되었습니다.",
        variant: "default"
      });

      // Reset form
      setFormData({
        domain: '',
        skill_area: '',
        current_level: [3],
        target_level: [4],
        notes: '',
        assessor_notes: ''
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('발달 추적 데이터 저장 오류:', error);
      toast({
        title: "저장 실패",
        description: "발달 추적 데이터 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      domain: '',
      skill_area: '',
      current_level: [3],
      target_level: [4],
      notes: '',
      assessor_notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            새 발달 추적 추가
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 영역 선택 */}
          <div className="space-y-2">
            <Label htmlFor="domain">발달 영역 *</Label>
            <Select value={formData.domain} onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="발달 영역을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(domain => (
                  <SelectItem key={domain.key} value={domain.key}>
                    {domain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 기술 영역 */}
          <div className="space-y-2">
            <Label htmlFor="skill_area">기술 영역 *</Label>
            <Input
              id="skill_area"
              value={formData.skill_area}
              onChange={(e) => setFormData(prev => ({ ...prev, skill_area: e.target.value }))}
              placeholder="예: 소근육 조작 능력, 단어 조합 능력 등"
            />
          </div>

          {/* 현재 수준 */}
          <div className="space-y-3">
            <Label>현재 수준: {formData.current_level[0]}/5</Label>
            <Slider
              value={formData.current_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, current_level: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>매우 부족</span>
              <span>보통</span>
              <span>매우 우수</span>
            </div>
          </div>

          {/* 목표 수준 */}
          <div className="space-y-3">
            <Label>목표 수준: {formData.target_level[0]}/5</Label>
            <Slider
              value={formData.target_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, target_level: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>매우 부족</span>
              <span>보통</span>
              <span>매우 우수</span>
            </div>
          </div>

          {/* 관찰 메모 */}
          <div className="space-y-2">
            <Label htmlFor="notes">관찰 메모</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="관찰된 행동이나 특이사항을 기록하세요"
              rows={3}
            />
          </div>

          {/* 평가자 메모 */}
          <div className="space-y-2">
            <Label htmlFor="assessor_notes">평가자 메모</Label>
            <Textarea
              id="assessor_notes"
              value={formData.assessor_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, assessor_notes: e.target.value }))}
              placeholder="평가자 의견이나 추천사항을 기록하세요"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.domain || !formData.skill_area}
            className="flex-1"
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentalTrackingModal;