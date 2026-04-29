import { CopilotBubble } from '@/components/copilot/CopilotBubble';
import SEOHead from '@/components/common/SEOHead';
import { Sparkles } from 'lucide-react';

const AiCopilotPage = () => {
  return (
    <>
      <SEOHead
        title="발달심리 코파일럿 - AIHPRO"
        description="14년 전문가가 설계한 코파일럿이 필요한 도움을 빠르게 안내해 드려요."
      />
      <div className="min-h-screen bg-slate-950 text-white px-4 pt-10 pb-[560px] flex flex-col items-center">
        <div className="w-full max-w-sm text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold break-keep">발달심리 코파일럿</h1>
          <p className="text-xs text-white/60 break-keep leading-relaxed">
            아래 패널에서 도움이 필요한 항목을 골라보세요.
          </p>
        </div>
        <CopilotBubble />
      </div>
    </>
  );
};

export default AiCopilotPage;
