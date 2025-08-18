import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Phone, Heart } from "lucide-react";
import { useState } from "react";

interface LegalSafetyNoticeProps {
  onAccept: () => void;
  testType: string;
}

const LegalSafetyNotice = ({ onAccept, testType }: LegalSafetyNoticeProps) => {
  const [agreements, setAgreements] = useState({
    understanding: false,
    responsibility: false,
    emergency: false,
    limitations: false
  });

  const allAgreed = Object.values(agreements).every(Boolean);

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTestTypeName = () => {
    switch(testType) {
      case 'language': return '언어발달 자가체크';
      case 'panic': return '불안감 수준 확인';
      case 'depression': return '우울감 자가체크';
      case 'adhd': return '주의집중력 자가체크';
      default: return '마음상태 체크';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 flex items-center justify-center">
      <Card className="max-w-4xl mx-auto p-8 space-y-6">
        {/* 긴급상황 안내 */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-800 mb-2">🚨 긴급상황 연락처</h2>
          <div className="space-y-2 text-red-700 font-medium">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>응급실: 119</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              <span>자살예방상담: 1577-0199 (24시간)</span>
            </div>
          </div>
        </div>

        {/* 서비스 성격 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">⚠️ 중요 안내</h3>
          <div className="text-blue-800 space-y-2">
            <p className="font-semibold">본 서비스는 참고용 자가체크 및 심리상담 연결 서비스입니다.</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>의학적 진단이나 치료행위는 포함되지 않습니다</li>
              <li>정확한 진단과 치료는 반드시 의료기관에서 받으시기 바랍니다</li>
              <li>결과는 개인차가 있는 참고자료입니다</li>
            </ul>
          </div>
        </div>

        {/* 체크리스트 제목 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-gradient mb-2">{getTestTypeName()}</h1>
          <p className="text-muted-foreground">이용 전 필수 확인사항</p>
        </div>

        {/* 필수 동의 항목 */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">📋 이용 전 필수 확인사항</h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="understanding"
                checked={agreements.understanding}
                onCheckedChange={() => handleAgreementChange('understanding')}
                className="mt-1"
              />
              <label htmlFor="understanding" className="text-sm cursor-pointer">
                이 체크리스트는 자가 참고용이며 의학적 진단이 아님을 이해합니다
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="responsibility"
                checked={agreements.responsibility}
                onCheckedChange={() => handleAgreementChange('responsibility')}
                className="mt-1"
              />
              <label htmlFor="responsibility" className="text-sm cursor-pointer">
                결과는 개인차가 있는 참고자료임을 이해합니다
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="emergency"
                checked={agreements.emergency}
                onCheckedChange={() => handleAgreementChange('emergency')}
                className="mt-1"
              />
              <label htmlFor="emergency" className="text-sm cursor-pointer">
                심각한 증상 시 의료기관 방문이 필요함을 이해합니다
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="limitations"
                checked={agreements.limitations}
                onCheckedChange={() => handleAgreementChange('limitations')}
                className="mt-1"
              />
              <label htmlFor="limitations" className="text-sm cursor-pointer">
                응급상황 시 119 또는 1577-0199로 연락할 것을 약속합니다
              </label>
            </div>
          </div>
        </div>

        {/* 면책조항 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-2">📜 면책조항</h5>
          <p className="text-sm text-gray-700 leading-relaxed">
            본 서비스는 심리적 지지를 위한 참고용 도구이며, 의료행위, 진단행위, 치료행위를 포함하지 않습니다. 
            서비스 결과는 개인차가 클 수 있으며, 정확한 진단과 치료를 위해서는 반드시 의료기관을 방문하시기 바랍니다. 
            위기상황이나 응급상황에서는 즉시 119 또는 전문 상담기관에 연락하시기 바랍니다.
          </p>
        </div>

        {/* 동의 버튼 */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onAccept}
            disabled={!allAgreed}
            className="btn-brand px-8 py-3 text-lg"
          >
            위 내용에 모두 동의하고 체크 시작하기
          </Button>
        </div>

        {!allAgreed && (
          <p className="text-center text-sm text-muted-foreground">
            모든 항목에 동의해야 체크를 시작할 수 있습니다
          </p>
        )}
      </Card>
    </div>
  );
};

export default LegalSafetyNotice;