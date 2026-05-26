import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, ArrowRight, Sparkles, FileText, BarChart3 } from 'lucide-react';

/**
 * 랜딩 하단에 노출되는 B2B 진입 배너
 * /b2b-demo-report 화이트라벨 데모 → /b2b-jobcoach·/b2b-proposal 도입 상담으로 연결
 */
const B2BEntryBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 gap-1.5 border-primary/30">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            B2B SaaS · 기관 & 기업 전용
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground break-keep">
            기관·기업 도입을 검토 중이세요?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto break-keep">
            학교·상담센터·복지기관·기업 4가지 유형 중 선택하면 30초 안에
            우리 기관 로고가 들어간 화이트라벨 샘플 리포트를 받아볼 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 학교/상담/복지 */}
          <button
            onClick={() => navigate('/b2b-demo-report')}
            className="group text-left p-6 rounded-2xl bg-white border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">기관용</p>
                <h3 className="font-bold text-foreground">학교·상담센터·복지기관</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground break-keep mb-4">
              월간 발달 코칭 리포트 자동 생성. 지자체·교육청 보고 양식 자동 변환까지.
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              30초 데모 리포트 만들기 <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* 기업 잡코치 */}
          <button
            onClick={() => navigate('/b2b-demo-report')}
            className="group text-left p-6 rounded-2xl bg-white border-2 border-primary/30 hover:border-primary hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <Badge className="text-[10px] gap-1">
                <Sparkles className="w-3 h-3" />
                NEW
              </Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">기업·HR용</p>
                <h3 className="font-bold text-foreground">직장 내 정신건강 잡코치</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground break-keep mb-4">
              부서별 번아웃 히트맵 · 이직 위험 예측 · 익명 1:1 휴먼 코칭 · ROI 추정.
            </p>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              기업용 데모 리포트 보기 <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => navigate('/b2b-demo-report')} size="lg" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            데모 리포트 즉석 생성
          </Button>
          <Button onClick={() => navigate('/b2b-jobcoach')} variant="outline" size="lg">
            기업 잡코치 자세히 보기
          </Button>
          <Button onClick={() => navigate('/b2b-center')} variant="outline" size="lg">
            발달치료센터 솔루션
          </Button>
          <Button onClick={() => navigate('/b2b-proposal')} variant="ghost" size="lg">
            기관 도입 제안서 →
          </Button>
        </div>

        {/* 발달치료센터 운영자 전용 한 줄 배너 */}
        <button
          onClick={() => navigate('/b2b-center')}
          className="mt-6 mx-auto block w-full max-w-2xl text-center px-5 py-3 rounded-2xl bg-white border border-[#C8B88A]/40 hover:border-[#C8B88A] transition"
        >
          <span className="text-sm text-neutral-800">
            <span className="font-medium">발달치료센터 운영하시나요?</span>
            <span className="text-neutral-500 mx-2">·</span>
            <span className="text-neutral-600">케어플 대비 더 저렴한 ERP + 임상 인텔리전스 →</span>
          </span>
        </button>
      </div>
    </section>
  );
};

export default B2BEntryBanner;
