import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Share2, Copy, Link2, Clock, Infinity, Eye, MessageCircle,
  Check, Loader2, Calendar, Lock
} from 'lucide-react';

interface ReportShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportHistoryIds: string[];
  reportTitle?: string;
}

const SHARE_OPTIONS = [
  {
    type: 'permanent' as const,
    icon: Infinity,
    label: '영구 링크',
    desc: '만료 없이 항상 열람 가능',
    badge: '추천',
    color: 'text-primary'
  },
  {
    type: 'temporary' as const,
    icon: Clock,
    label: '30일 한정',
    desc: '30일 후 자동 만료',
    badge: '',
    color: 'text-orange-500'
  },
  {
    type: 'one_time' as const,
    icon: Eye,
    label: '1회성 링크',
    desc: '1번 열람 후 자동 비활성화',
    badge: '보안',
    color: 'text-red-500'
  }
];

const ReportShareModal: React.FC<ReportShareModalProps> = ({
  open, onOpenChange, reportHistoryIds, reportTitle
}) => {
  const [shareType, setShareType] = useState<'permanent' | 'temporary' | 'one_time'>('permanent');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set(reportHistoryIds));
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState(reportTitle || '나의 심리 분석 리포트');
  const [existingLinks, setExistingLinks] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedReports(new Set(reportHistoryIds));
      setGeneratedLink(null);
      loadExistingLinks();
    }
  }, [open, reportHistoryIds]);

  const loadExistingLinks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('report_share_links')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setExistingLinks(data);
  };

  const handleGenerate = async () => {
    if (selectedReports.size === 0) {
      toast.error('공유할 리포트를 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const expiresAt = shareType === 'temporary'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 1) 공유 링크 생성
      const { data: linkData, error: linkError } = await supabase
        .from('report_share_links')
        .insert({
          user_id: user.id,
          share_type: shareType,
          title,
          expires_at: expiresAt,
          max_views: shareType === 'one_time' ? 1 : null,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // 2) 리포트 연결
      const reportInserts = Array.from(selectedReports).map((rid, idx) => ({
        share_link_id: linkData.id,
        report_history_id: rid,
        report_order: idx + 1
      }));

      await supabase.from('report_share_reports').insert(reportInserts);

      // 3) 링크 생성
      const shareUrl = `${window.location.origin}/shared-report/${linkData.share_token}`;
      setGeneratedLink(shareUrl);
      toast.success('공유 링크가 생성되었습니다!');
    } catch (err: any) {
      toast.error(err.message || '링크 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    toast.success('링크가 복사되었습니다!');
  };

  const handleKakaoShare = () => {
    if (!generatedLink) return;
    const message = `${title}\n\nAI 심리 분석 리포트를 확인해보세요!\n${generatedLink}`;
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
    } else {
      navigator.clipboard.writeText(generatedLink);
      toast.success('링크가 복사되었습니다. 카카오톡에서 붙여넣기하세요!');
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    await supabase
      .from('report_share_links')
      .update({ is_active: false })
      .eq('id', linkId);
    toast.success('링크가 비활성화되었습니다.');
    loadExistingLinks();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            리포트 공유하기
          </DialogTitle>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-5">
            {/* 제목 입력 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                공유 제목
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리포트 제목을 입력하세요"
                className="text-sm"
              />
            </div>

            {/* 공유 타입 선택 */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                공유 방식
              </label>
              <div className="space-y-2">
                {SHARE_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setShareType(opt.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      shareType === opt.type
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/40 hover:bg-muted/30'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 ${opt.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{opt.label}</span>
                        {opt.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {opt.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      shareType === opt.type ? 'border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {shareType === opt.type && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 포함 리포트 */}
            {reportHistoryIds.length > 1 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  포함할 리포트 회차 ({selectedReports.size}개 선택)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {reportHistoryIds.map((id, i) => (
                    <label key={id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                      <Checkbox
                        checked={selectedReports.has(id)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selectedReports);
                          if (checked) next.add(id); else next.delete(id);
                          setSelectedReports(next);
                        }}
                      />
                      <span className="text-sm">{i + 1}회차 리포트</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 생성 버튼 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 링크 생성 중...</>
              ) : (
                <><Link2 className="w-4 h-4 mr-2" /> 공유 링크 생성</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 생성된 링크 */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">링크가 생성되었습니다!</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="text-xs bg-background"
                />
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 공유 버튼들 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="text-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                링크 복사
              </Button>
              <Button
                onClick={handleKakaoShare}
                className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                카카오톡
              </Button>
            </div>

            {/* 새 링크 만들기 */}
            <Button
              variant="ghost"
              onClick={() => setGeneratedLink(null)}
              className="w-full text-xs text-muted-foreground"
            >
              다른 방식으로 새 링크 만들기
            </Button>
          </div>
        )}

        {/* 기존 공유 링크 관리 */}
        {existingLinks.length > 0 && !generatedLink && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">기존 공유 링크</p>
            <div className="space-y-1.5">
              {existingLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                  <div className="flex items-center gap-2">
                    {link.share_type === 'permanent' ? <Infinity className="w-3 h-3" /> :
                     link.share_type === 'temporary' ? <Clock className="w-3 h-3" /> :
                     <Lock className="w-3 h-3" />}
                    <span className="truncate max-w-[150px]">{link.title || '리포트'}</span>
                    <span className="text-muted-foreground">({link.current_views}회)</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] text-red-500 hover:text-red-600"
                    onClick={() => handleDeactivateLink(link.id)}
                  >
                    비활성화
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportShareModal;
