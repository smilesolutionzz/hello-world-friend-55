import { CopilotBubble } from '@/components/copilot/CopilotBubble';
import SEOHead from '@/components/common/SEOHead';
import { Sparkles } from 'lucide-react';

const AiCopilotPage = () => {
  return (
    <>
      <SEOHead
        title="발달심리 코파일럿 - AIHPRO"
        description="14년 전문가가 설계한 발달심리 코파일럿. 어떤 도움이 필요한지 빠르게 안내해 드려요."
      />
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold break-keep">발달심리 코파일럿</h1>
          <p className="text-sm text-white/60 break-keep">
            아래 패널에서 어떤 도움이 필요한지 선택하면 바로 안내해 드릴게요.
            패널을 닫으면 우측 하단의 코파일럿 버튼으로 다시 열 수 있어요.
          </p>
        </div>
        <CopilotBubble />
      </div>
    </>
  );
};

export default AiCopilotPage;
