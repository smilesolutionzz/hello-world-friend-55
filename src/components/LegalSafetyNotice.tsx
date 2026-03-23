import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Phone, Heart } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface LegalSafetyNoticeProps {
  onAccept: () => void;
  testType: string;
}

const LegalSafetyNotice = ({ onAccept, testType }: LegalSafetyNoticeProps) => {
  const { isEnglish } = useLanguage();
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
    if (isEnglish) {
      switch(testType) {
        case 'language': return 'Language Development Self-Check';
        case 'panic': return 'Anxiety Level Check';
        case 'depression': return 'Depression Self-Check';
        case 'adhd': return 'Attention & Focus Self-Check';
        default: return 'Age-Specific Assessment';
      }
    }
    switch(testType) {
      case 'language': return '언어발달 자가체크';
      case 'panic': return '불안감 수준 확인';
      case 'depression': return '우울감 자가체크';
      case 'adhd': return '주의집중력 자가체크';
      default: return '연령별 맞춤체크';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 flex items-center justify-center">
      <Card className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Emergency Contact */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            {isEnglish ? '🚨 Emergency Contacts' : '🚨 긴급상황 연락처'}
          </h2>
          <div className="space-y-2 text-red-700 font-medium">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{isEnglish ? 'Emergency: 911' : '응급실: 119'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{isEnglish ? 'Crisis Hotline: 988 (24/7)' : '자살예방상담: 1577-0199 (24시간)'}</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            {isEnglish ? '⚠️ Important Notice' : '⚠️ 필수 확인 사항'}
          </h3>
          <div className="text-blue-800 space-y-3">
            <p className="font-bold text-lg">
              {isEnglish 
                ? 'This service is a self-reference checklist and is NOT a professional medical or therapeutic service.'
                : '본 서비스는 자가 참고용 체크리스트이며, 전문적인 의료·치료 서비스가 아닙니다.'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>{isEnglish ? 'Not Medical Practice:' : '의료행위 아님:'}</strong> {isEnglish ? 'This service does not constitute medical practice requiring professional licenses such as physicians, speech therapists, occupational therapists, or physical therapists' : '본 서비스는 의사, 언어치료사, 작업치료사, 물리치료사 등 전문 면허가 필요한 의료행위가 아닙니다'}</li>
              <li><strong>{isEnglish ? 'No Diagnosis/Treatment:' : '진단·평가·치료 불가:'}</strong> {isEnglish ? 'This test is not intended for diagnosis, evaluation, or treatment and is for self-reference only' : '본 테스트는 진단, 평가, 치료의 목적이 없으며 단순 자가 참고용입니다'}</li>
              <li><strong>{isEnglish ? 'Professional Consultation Required:' : '전문가 상담 필수:'}</strong> {isEnglish ? 'For accurate diagnosis and treatment, please visit a medical institution and consult with professionals' : '정확한 진단과 치료를 위해서는 반드시 의료기관 및 전문가를 방문하시기 바랍니다'}</li>
              <li><strong>{isEnglish ? 'Individual Variation:' : '개인차 존재:'}</strong> {isEnglish ? 'Results may vary significantly between individuals and should be used as reference only' : '결과는 개인차가 클 수 있으며 참고자료로만 활용해주시기 바랍니다'}</li>
              <li><strong>{isEnglish ? 'Emergency Response:' : '응급상황 대응:'}</strong> {isEnglish ? 'In case of emergency, please call 911 or the Crisis Hotline 988 immediately' : '위기 상황 시에는 즉시 119 또는 자살예방상담 1577-0199로 연락하시기 바랍니다'}</li>
            </ul>
          </div>
        </div>

        {/* Test Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-gradient mb-2">{getTestTypeName()}</h1>
          <p className="text-muted-foreground">
            {isEnglish ? 'Please review before proceeding' : '이용 전 필수 확인사항'}
          </p>
        </div>

        {/* Agreement Items */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">
            {isEnglish ? '📋 Required Acknowledgements' : '📋 이용 전 필수 확인사항'}
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="understanding"
                checked={agreements.understanding}
                onCheckedChange={() => handleAgreementChange('understanding')}
                className="mt-1"
              />
              <label htmlFor="understanding" className="text-sm cursor-pointer">
                {isEnglish 
                  ? 'I understand that this service is a self-reference checklist and does not constitute medical practice, diagnosis, evaluation, or treatment'
                  : '본 서비스는 자가 참고용 체크리스트이며, 의료행위·진단·평가·치료가 아님을 이해합니다'}
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
                {isEnglish
                  ? 'I understand that accurate diagnosis and treatment requires visiting medical institutions and licensed professionals'
                  : '정확한 진단과 치료를 위해서는 반드시 의료기관 및 전문 면허 소지 치료사를 방문해야 함을 이해합니다'}
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
                {isEnglish
                  ? 'I understand that all responsibility for using this service lies with me, and the operator bears no legal liability'
                  : '본 서비스 이용 결과에 대한 모든 책임은 본인에게 있으며, 운영자는 법적 책임을 지지 않음을 이해합니다'}
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
                {isEnglish
                  ? 'I agree to contact 911 or 988 Crisis Hotline in case of emergency'
                  : '응급상황 시 119 또는 1577-0199로 연락할 것을 약속합니다'}
              </label>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
          <h5 className="font-bold text-yellow-900 mb-3 text-lg">
            {isEnglish ? '📜 Legal Disclaimer' : '📜 법적 면책조항'}
          </h5>
          <div className="text-sm text-yellow-900 leading-relaxed space-y-2">
            <p className="font-semibold">
              {isEnglish
                ? 'This service provides self-reference checklists and professional referral services, and does not include any medical practice, diagnosis, evaluation, or treatment.'
                : '본 서비스는 자가 참고용 체크리스트 제공 및 전문가 연결 서비스이며, 어떠한 의료행위, 진단, 평가, 치료행위도 포함하지 않습니다.'}
            </p>
            <p>
              <strong>{isEnglish ? 'Licensed Specialties:' : '전문 면허 영역:'}</strong> {isEnglish
                ? 'Speech therapy, occupational therapy, physical therapy, psychotherapy, etc. require direct evaluation and treatment by licensed professionals. This service cannot replace those professional services.'
                : '언어치료, 작업치료, 물리치료, 심리치료 등은 관련 전문 면허 소지자에 의한 직접 평가 및 치료가 필요한 영역입니다. 본 서비스는 해당 전문 영역의 평가나 치료를 대체할 수 없습니다.'}
            </p>
            <p>
              <strong>{isEnglish ? 'Reference Tool:' : '참고용 도구:'}</strong> {isEnglish
                ? 'All checklists and results provided are for reference only and may vary significantly between individuals. For accurate diagnosis and treatment planning, please visit medical institutions and professionals.'
                : '제공되는 모든 체크리스트와 결과는 단순 참고자료이며, 개인차가 클 수 있습니다. 정확한 진단과 치료계획 수립을 위해서는 반드시 의료기관 및 전문가를 방문하시기 바랍니다.'}
            </p>
            <p>
              <strong>{isEnglish ? 'Emergency Response:' : '응급상황 대응:'}</strong> {isEnglish
                ? 'In crisis or emergency situations, do not use this service. Please call 911 or the 988 Crisis Hotline immediately.'
                : '위기상황이나 응급상황에서는 본 서비스를 이용하지 마시고, 즉시 119 또는 자살예방상담 1577-0199로 연락하시기 바랍니다.'}
            </p>
            <p className="font-semibold text-red-700 mt-3">
              {isEnglish
                ? 'The operator bears no legal liability for outcomes resulting from use of this service. All responsibility lies with the user.'
                : '본 서비스 이용으로 인한 결과에 대해 운영자는 법적 책임을 지지 않으며, 모든 책임은 이용자 본인에게 있습니다.'}
            </p>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="/terms" className="text-blue-600 hover:underline font-medium">
              {isEnglish ? 'Terms of Service' : '이용약관'}
            </a>
            <a href="/privacy" className="text-blue-600 hover:underline font-medium">
              {isEnglish ? 'Privacy Policy' : '개인정보처리방침'}
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onAccept}
            disabled={!allAgreed}
            className="btn-brand px-8 py-3 text-lg"
          >
            {isEnglish ? 'I agree to all terms — Start Assessment' : '위 내용에 모두 동의하고 체크 시작하기'}
          </Button>
        </div>

        {!allAgreed && (
          <p className="text-center text-sm text-muted-foreground">
            {isEnglish ? 'You must agree to all items to proceed' : '모든 항목에 동의해야 체크를 시작할 수 있습니다'}
          </p>
        )}
      </Card>
    </div>
  );
};

export default LegalSafetyNotice;
