/**
 * 아이 프로필 입력 — child_development 트랙 시작 전 표시.
 * 닉네임·생년월일·페인포인트(최대 5개)·30일 후 변화 한 줄.
 */

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PAIN_POINT_OPTIONS } from "@/lib/mindTrackChildMissions";

export interface ChildProfile {
  id: string;
  child_nickname: string;
  birth_date: string;
  pain_points: string[];
  goal_text: string | null;
}

interface Props {
  open: boolean;
  initial?: ChildProfile | null;
  onClose: () => void;
  onSaved: (p: ChildProfile) => void;
}

export default function ChildProfileSetup({ open, initial, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [pains, setPains] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.child_nickname);
      setBirth(initial.birth_date);
      setPains(initial.pain_points || []);
      setGoal(initial.goal_text || "");
    }
  }, [initial]);

  const togglePain = (p: string) => {
    setPains(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : prev.length >= 5 ? prev : [...prev, p]
    );
  };

  const save = async () => {
    // Validation
    const nick = name.trim();
    if (nick.length < 1 || nick.length > 20) {
      toast({ title: "닉네임은 1~20자로 입력해 주세요", variant: "destructive" }); return;
    }
    if (!birth) {
      toast({ title: "생년월일을 선택해 주세요", variant: "destructive" }); return;
    }
    const bd = new Date(birth);
    if (isNaN(bd.getTime())) {
      toast({ title: "올바른 생년월일을 입력해 주세요", variant: "destructive" }); return;
    }
    const now = new Date();
    if (bd.getTime() > now.getTime()) {
      toast({ title: "생년월일은 오늘 이전이어야 합니다", variant: "destructive" }); return;
    }
    const minDate = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
    if (bd.getTime() < minDate.getTime()) {
      toast({ title: "이 코칭은 만 0~18세 대상입니다", variant: "destructive" }); return;
    }
    if (pains.length > 5) {
      toast({ title: "고민은 최대 5개까지 선택할 수 있습니다", variant: "destructive" }); return;
    }
    const goalText = goal.trim();
    if (goalText.length > 200) {
      toast({ title: "목표는 200자 이내로 작성해 주세요", variant: "destructive" }); return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "로그인이 필요합니다", variant: "destructive" });
        return;
      }
      const payload = {
        user_id: user.id,
        child_nickname: nick,
        birth_date: birth,
        pain_points: pains,
        goal_text: goalText || null,
      };
      const q = initial?.id
        ? supabase.from("user_child_profiles").update(payload).eq("id", initial.id).select().single()
        : supabase.from("user_child_profiles").insert(payload).select().single();
      const { data, error } = await q;
      if (error) throw error;
      onSaved(data as ChildProfile);
      toast({ title: "아이 프로필이 저장되었습니다", description: "맞춤 미션을 준비합니다…" });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>내 아이에 맞게 코칭 시작하기</DialogTitle>
          <DialogDescription>
            아이의 연령과 주요 고민에 맞춰 30일 미션이 개인화됩니다. 닉네임만 사용하고 실명·민감정보는 저장하지 않습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="child-name">아이 닉네임</Label>
            <Input id="child-name" placeholder="예: 민준이, 둘째" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
          </div>

          <div>
            <Label htmlFor="child-birth">아이 생년월일</Label>
            <Input id="child-birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
          </div>

          <div>
            <Label>주요 고민 (최대 5개)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PAIN_POINT_OPTIONS.map((p) => {
                const active = pains.includes(p);
                return (
                  <Badge
                    key={p}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => togglePain(p)}
                  >
                    {p}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pains.length}/5 선택됨</p>
          </div>

          <div>
            <Label htmlFor="child-goal">30일 후 보고 싶은 변화 (선택)</Label>
            <Textarea
              id="child-goal"
              placeholder="예: 떼쓰는 빈도가 줄고 감정 단어로 표현했으면 좋겠어요"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "저장 중..." : "맞춤 코칭 시작"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
