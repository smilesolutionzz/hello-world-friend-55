import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ExpertConsultationNotice = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 mt-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="font-bold text-lg text-amber-900">
            ⚠️ 전문가 상담이 필요합니다
          </h3>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-gray-900">
              본 결과는 자가 참고용 체크리스트이며, 정확한 진단과 치료를 위해서는 반드시 전문가 상담이 필요합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-800">
              <li>의료기관 및 전문 면허 소지 치료사의 직접 평가가 필요합니다</li>
              <li>언어치료, 작업치료, 물리치료 등은 전문 면허 영역입니다</li>
              <li>개인차가 클 수 있으므로 결과는 참고용으로만 활용하세요</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate('/expert-hiring')}
              className="btn-brand flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              전문가 찾기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/expert-hiring')}
              variant="outline"
              className="flex-1 border-amber-400 text-amber-800 bg-white hover:bg-amber-100"
            >
              <Phone className="w-4 h-4 mr-2" />
              상담 신청하기
            </Button>
          </div>

          <p className="text-xs text-gray-700 pt-2 border-t border-amber-300">
            <strong className="text-red-600">응급상황:</strong> 위기 상황 시 즉시 119 또는 자살예방상담 1577-0199로 연락하세요
          </p>
        </div>
      </div>
    </Card>
  );
};
