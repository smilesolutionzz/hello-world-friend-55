import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Building, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockInstitutions } from '@/data/mockInstitutions';
import { mockExperts } from '@/data/mockExperts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const NewFeaturesSection = () => {
  const navigate = useNavigate();

  // 이번 주에 등록된 제휴기관 (최근 7일 이내)
  const getThisWeekInstitutions = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return mockInstitutions.filter(inst => {
      const startDate = new Date(inst.partnership_start_date);
      return startDate >= oneWeekAgo;
    }).slice(0, 3);
  };

  // 이번 주에 추가된 치료사 (mockExperts의 최근 추가된 항목)
  const getThisWeekExperts = () => {
    // id가 '7', '8', '9'인 최근 추가된 전문가들
    return mockExperts.filter(expert => ['7', '8', '9'].includes(expert.id));
  };

  const thisWeekInstitutions = getThisWeekInstitutions();
  const thisWeekExperts = getThisWeekExperts();

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full mb-4 animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">매주 업데이트</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            이번 주 NEW 기능
          </h2>
          <p className="text-sm sm:text-xl text-gray-600">
            새롭게 추가된 제휴기관과 전문 치료사를 만나보세요 ✨
          </p>
        </div>

        {/* 신규 제휴기관 */}
        {thisWeekInstitutions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-800">신규 제휴기관</h3>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">NEW</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thisWeekInstitutions.map((institution) => (
                <Card 
                  key={institution.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-purple-300"
                  onClick={() => navigate('/expert-hiring')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        신규
                      </Badge>
                      <span className="text-sm text-gray-500">{institution.partnership_start_date}</span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                      {institution.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{institution.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {institution.specializations?.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                      <span className="text-sm">자세히 보기</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 신규 전문 치료사 */}
        {thisWeekExperts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-pink-600" />
              <h3 className="text-2xl font-bold text-gray-800">신규 전문 치료사</h3>
              <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">NEW</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {thisWeekExperts.map((expert) => (
                <Card 
                  key={expert.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-pink-300"
                  onClick={() => navigate('/expert-hiring')}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar className="w-16 h-16 border-2 border-pink-200">
                        <AvatarImage src={expert.photo_url} alt={expert.name} />
                        <AvatarFallback>{expert.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-pink-600 transition-colors">
                          {expert.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{expert.credential}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {expert.categories.slice(0, 3).map((category, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{expert.intro}</p>
                    <div className="flex items-center gap-2 text-pink-600 font-semibold group-hover:gap-3 transition-all">
                      <span className="text-sm">상담 예약하기</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA 버튼 */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/expert-hiring')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            전문가 더 둘러보기
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
