import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export const ExpertConsultationNotice = () => {
  const navigate = useNavigate();
  const { isEnglish, localePath } = useLanguage();

  return (
    <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 mt-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="font-bold text-lg text-amber-900">
            {isEnglish ? '⚠️ Professional Consultation Recommended' : '⚠️ 전문가 상담이 필요합니다'}
          </h3>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-gray-900">
              {isEnglish
                ? 'This result is a non-medical self-reference checklist. It is not a diagnosis. For accurate evaluation, please consult a licensed professional.'
                : '본 결과는 비의료 자가 참고용 체크리스트이며 의학적 진단이 아닙니다. 정확한 평가가 필요할 경우 면허 전문가 상담을 권장드립니다.'}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-800">
              <li>{isEnglish ? 'Clinical evaluation can only be performed by licensed professionals' : '임상 평가는 면허 전문가만이 수행할 수 있습니다'}</li>
              <li>{isEnglish ? 'Speech, occupational, and physical therapy are licensed professional fields' : '언어·작업·물리치료 등은 면허 전문가 영역입니다'}</li>
              <li>{isEnglish ? 'Individual differences may be significant — use results as a reference only' : '개인차가 크므로 결과는 참고용으로만 활용해 주세요'}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate(localePath('/expert-hiring'))}
              className="btn-brand flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              {isEnglish ? 'Find Experts' : '전문가 찾기'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate(localePath('/expert-hiring'))}
              variant="outline"
              className="flex-1 border-amber-400 text-amber-800 bg-white hover:bg-amber-100"
            >
              <Phone className="w-4 h-4 mr-2" />
              {isEnglish ? 'Request Consultation' : '상담 신청하기'}
            </Button>
          </div>

          <p className="text-xs text-gray-700 pt-2 border-t border-amber-300">
            <strong className="text-red-600">{isEnglish ? 'Urgent:' : '긴급상황:'}</strong> {isEnglish 
              ? 'In crisis situations, use our urgent expert matching for immediate professional support'
              : '위기 상황 시 플랫폼 내 긴급 전문가 매칭을 통해 즉시 전문가 지원을 받으세요'}
          </p>
        </div>
      </div>
    </Card>
  );
};
