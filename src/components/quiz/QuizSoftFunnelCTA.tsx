import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, UserRound, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizSoftFunnelCTAProps {
  goalLabel?: string;
  concern?: string;
}

/**
 * Quiz 결과 화면 보조 CTA — Primary 결제 카드 직후 노출.
 * 결제를 망설이는 유저에게 무료 옵션 3가지(자가진단·전문가 상담·이메일 리포트)를 제공.
 */
export const QuizSoftFunnelCTA: React.FC<QuizSoftFunnelCTAProps> = ({ goalLabel, concern }) => {
  const navigate = useNavigate();
  const [emailLoading, setEmailLoading] = React.useState(false);

  const track = (option: string) => {
    try {
      // best-effort tracking; ignore failures
      // @ts-ignore
      window.gtag?.('event', 'quiz_soft_cta_click', { option });
    } catch {}
  };

  const handleAssessments = () => {
    track('assessments');
    navigate('/assessments');
  };

  const handleExpert = () => {
    track('expert');
    navigate('/expert-hiring');
  };

  const handleEmailReport = async () => {
    track('email_report');
    setEmailLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.info('리포트 발송을 위해 30초 가입이 필요합니다');
        navigate('/auth?redirect=/quiz&action=email_report');
        return;
      }
      // 로그인 유저: 간단히 대시보드의 마이 리포트로 안내
      toast.success('내 리포트는 대시보드에서 확인하실 수 있어요');
      navigate('/my-journey');
    } finally {
      setEmailLoading(false);
    }
  };

  const options = [
    {
      icon: ClipboardList,
      title: '무료 자가 진단 더 해보기',
      desc: '스트레스 · 우울 · 번아웃 등 무료 진단으로 더 깊이 들여다보세요',
      cta: '무료 진단 보기',
      onClick: handleAssessments,
      loading: false,
    },
    {
      icon: UserRound,
      title: '전문가에게 먼저 상담받기',
      desc: '결제 전에 검증된 전문가와 1:1 대화로 방향을 잡아보세요',
      cta: '전문가 보기',
      onClick: handleExpert,
      loading: false,
    },
    {
      icon: Mail,
      title: '내 리포트 이메일로 받기',
      desc: '오늘의 진단 결과를 저장하고 차분히 읽어보세요',
      cta: emailLoading ? '준비 중...' : '리포트 받기',
      onClick: handleEmailReport,
      loading: emailLoading,
    },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#C8B88A]/40" />
        <span className="text-xs font-medium tracking-wider text-muted-foreground">
          아직 결정하기 어렵다면
        </span>
        <div className="h-px flex-1 bg-[#C8B88A]/40" />
      </div>

      <p className="text-center text-sm text-muted-foreground break-keep">
        결제 전, 다른 방법으로 먼저 경험해 보세요
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <Card
              key={i}
              className="bg-white border border-border rounded-2xl hover:border-[#C8B88A]/60 hover:shadow-sm transition-all"
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="w-10 h-10 rounded-xl bg-[#C8B88A]/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#7a6c43]" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1.5 break-keep">
                  {opt.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed break-keep flex-1 mb-4">
                  {opt.desc}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={opt.onClick}
                  disabled={opt.loading}
                  className="w-full justify-between text-xs"
                >
                  {opt.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizSoftFunnelCTA;
