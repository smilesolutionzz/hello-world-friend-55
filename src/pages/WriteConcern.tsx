import React from 'react';
import InstantAIAnalysis from '@/components/InstantAIAnalysis';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { FolderHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * /write-concern — 고민 쓰기 전용 페이지.
 * 고민 보관함의 "내 고민 쓰기" 흐름과 동일하게 InstantAIAnalysis 폼을 사용하고,
 * 저장된 고민은 /concern-storage 의 "고민" 탭에서 확인할 수 있다.
 */
const WriteConcern: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <header className="sticky top-16 z-10 bg-background/70 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow">
              <FolderHeart className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-foreground leading-tight">고민 쓰기</h1>
              <p className="text-[11px] md:text-xs text-muted-foreground">적어두면 보관함에 자동 저장돼요</p>
            </div>
          </div>
          <Link
            to="/concern-storage"
            className="text-[12px] md:text-[13px] font-semibold text-[#8a7a4d] hover:text-[#1a1a1a] transition"
          >
            보관함 보기
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-3 md:px-4 py-5 md:py-8">
        <InstantAIAnalysis />
      </main>
    </div>
  );
};

export default WriteConcern;
