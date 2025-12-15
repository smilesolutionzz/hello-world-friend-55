import React, { useState } from 'react';
import { ConcernStorageList } from '@/components/concern/ConcernStorageList';
import AssessmentHistory from '@/components/history/AssessmentHistory';
import { Heart, ClipboardCheck, FolderHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const ConcernStorage = () => {
  const [activeTab, setActiveTab] = useState<'concerns' | 'assessments'>('concerns');

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      {/* 헤더 */}
      <header className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <FolderHeart className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">저장소</h1>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="border-b bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('concerns')}
              className={cn(
                "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'concerns'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("w-4 h-4 mx-auto mb-1", activeTab === 'concerns' && "fill-current")} />
              고민
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={cn(
                "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'assessments'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <ClipboardCheck className="w-4 h-4 mx-auto mb-1" />
              검사
            </button>
          </nav>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'concerns' ? (
          <ConcernStorageList />
        ) : (
          <AssessmentHistory />
        )}
      </main>
    </div>
  );
};

export default ConcernStorage;
