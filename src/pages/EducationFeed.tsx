import { Helmet } from 'react-helmet-async';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { CuratedContentFeed } from '@/components/education/CuratedContentFeed';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

const EducationFeed = () => {
  return (
    <>
      <Helmet>
        <title>교육 콘텐츠 - AIHumanPro | 큐레이션된 육아 교육 자료</title>
        <meta name="description" content="전문가가 큐레이션한 육아, 발달, 교육 콘텐츠를 확인하세요. 신뢰할 수 있는 출처의 최신 정보를 제공합니다." />
        <meta name="keywords" content="육아 교육, 발달 정보, 교육 콘텐츠, 큐레이션" />
        <link rel="canonical" href="https://aihpro.app/education-feed" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <AuthenticationGuard fallbackMessage="교육 콘텐츠를 보려면 로그인이 필요합니다.">
          <div className="container mx-auto py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">교육 콘텐츠</h1>
              <p className="text-muted-foreground">
                전문가가 큐레이션한 신뢰할 수 있는 육아 및 발달 교육 자료
              </p>
            </div>
            
            <CuratedContentFeed />
          </div>
        </AuthenticationGuard>
      </div>
    </>
  );
};

export default EducationFeed;
