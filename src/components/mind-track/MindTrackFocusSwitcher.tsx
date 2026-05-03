/**
 * MindTrackFocusSwitcher — 30일 진행 중 니즈 트랙 변경 UX
 *
 * 정책:
 *  - 현재 진행 Day는 유지하고, 해당 Day 이후의 콘텐츠만 새 트랙 매트릭스로 교체
 *  - 변경 이력은 `mind_track_focus_changes` 에 자동 기록 (RPC)
 *  - 결제 완료 enrollment에서만 호출 가능 (RPC 내부 검증)
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, RefreshCw } from 'lucide-react';
import {
  MIND_TRACK_FOCUSES,
  getFocus,
  type MindTrackFocusId,
} from '@/lib/mindTrackFocusTracks';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  enrollmentId: string;
  currentFocusId: string | null;
  currentDay: number;
  onSwitched?: (newFocusId: MindTrackFocusId) => void;
}

export default function MindTrackFocusSwitcher({
  open, onOpenChange, enrollmentId, currentFocusId, currentDay, onSwitched,
}: Props) {
  const [selected, setSelected] = useState<MindTrackFocusId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const current = getFocus(currentFocusId);

  const handleConfirm = async () => {
    if (!selected || selected === current.id) {
      toast.info('지금과 다른 트랙을 골라주세요');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('switch_mind_track_focus', {
        _enrollment_id: enrollmentId,
        _new_focus: selected,
      });
      if (error) throw error;
      toast.success(`${getFocus(selected).label} 트랙으로 전환되었어요. 오늘부터 새 콘텐츠가 반영됩니다.`);
      onSwitched?.(selected);
      onOpenChange(false);
    } catch (e: any) {
      console.error('[focus-switch]', e);
      toast.error(e.message || '트랙 전환에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#8a7a4d]" />
            니즈 트랙 변경
          </DialogTitle>
          <DialogDescription className="break-keep">
            지금 진행 중인 Day {String(currentDay).padStart(2, '0')}는 유지되고,
            오늘부터 새 트랙의 미션·영상·5분 액션이 적용돼요.
          </DialogDescription>
        </DialogHeader>

        <div className="text-xs text-slate-500 mt-1">
          현재 트랙: <Badge variant="outline" className={current.badgeClass}>{current.icon} {current.label}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {MIND_TRACK_FOCUSES.map((f) => {
            const isCurrent = f.id === current.id;
            const isSelected = f.id === selected;
            return (
              <button
                key={f.id}
                onClick={() => !isCurrent && setSelected(f.id)}
                disabled={isCurrent}
                className={`text-left p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-[#1a1a1a] bg-[#fbf8f0] ring-2 ring-[#C8B88A]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 break-keep">{f.label}</p>
                    <p className="text-[11px] text-slate-500 break-keep mt-0.5">{f.desc}</p>
                  </div>
                  {isCurrent && <span className="text-[10px] text-slate-400">현재</span>}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || !selected || selected === current.id}
            className="bg-[#1a1a1a] text-white hover:bg-black"
          >
            {submitting ? '전환 중…' : (
              <>이 트랙으로 변경 <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
