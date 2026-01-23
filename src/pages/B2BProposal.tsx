import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText,
  Download,
  Building2,
  Brain,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Printer,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  Lock,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { B2BPaymentModal } from '@/components/b2b/B2BPaymentModal';
import { B2BProductCards } from '@/components/b2b/B2BProductCards';

const B2BProposal = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institution_name: '',
    institution_type: 'daycare',
    contact_name: '',
    contact_email: '',
    target_users: '50'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const proposalTemplates = [
    {
      id: 'daycare',
      title: '어린이집/유치원용 제안서',
      description: 'AI 발달 선별 + 학부모 리포팅 솔루션',
      features: ['발달 영역별 AI 분석', '자동 학부모 리포트', '바우처 일지 연동'],
      pricing: '월 50만원~ (정원 기준)'
    },
    {
      id: 'academy',
      title: '학원용 제안서',
      description: '학습 패턴 분석 + 맞춤 커리큘럼 제안',
      features: ['학습 행동 분석', 'AI 커리큘럼 추천', '성과 대시보드'],
      pricing: '월 30만원~ (학생 수 기준)'
    },
    {
      id: 'development_center',
      title: '발달센터용 제안서',
      description: '전문 리포팅 + IEP 자동화 시스템',
      features: ['6종 바우처 일지', 'IEP 자동 생성', '전문가 연계'],
      pricing: '월 70만원~ (치료사 수 기준)'
    },
    {
      id: 'enterprise',
      title: '기업 EAP용 제안서',
      description: '직원 정신건강 + 자녀 발달 통합 케어',
      features: ['직원 스트레스 관리', '자녀 발달 검사', '가족 통합 리포트'],
      pricing: '연간 계약 별도 협의'
    }
  ];

  const generateProposalHTML = () => {
    const selectedTemplate = proposalTemplates.find(t => t.id === formData.institution_type);
    const currentDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>AIHPRO 파일럿 프로그램 제안서 - ${formData.institution_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #1a1a2e; background: #fff; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #3b82f6; }
    .logo { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 10px; }
    .subtitle { color: #64748b; font-size: 14px; }
    .proposal-title { font-size: 32px; font-weight: 700; color: #1e293b; margin: 30px 0 10px; }
    .proposal-meta { color: #64748b; font-size: 14px; }
    
    .section { margin: 40px 0; }
    .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    
    .info-box { background: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: 500; width: 120px; color: #64748b; }
    .info-value { color: #1e293b; }
    
    .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .feature-item { background: #eff6ff; border-radius: 8px; padding: 16px; }
    .feature-icon { font-size: 24px; margin-bottom: 8px; }
    .feature-title { font-weight: 600; color: #1e40af; margin-bottom: 4px; }
    .feature-desc { font-size: 14px; color: #64748b; }
    
    .pricing-box { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border-radius: 16px; padding: 32px; text-align: center; margin: 30px 0; }
    .pricing-title { font-size: 18px; opacity: 0.9; margin-bottom: 8px; }
    .pricing-value { font-size: 36px; font-weight: 700; margin-bottom: 16px; }
    .pricing-note { font-size: 14px; opacity: 0.8; }
    
    .timeline { background: #f8fafc; border-radius: 12px; padding: 24px; }
    .timeline-item { display: flex; align-items: flex-start; margin: 16px 0; }
    .timeline-step { width: 32px; height: 32px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 16px; flex-shrink: 0; }
    .timeline-content h4 { font-weight: 600; color: #1e293b; }
    .timeline-content p { font-size: 14px; color: #64748b; }
    
    .benefits-list { list-style: none; }
    .benefits-list li { padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
    .benefits-list li:last-child { border-bottom: none; }
    .check-icon { color: #22c55e; margin-right: 12px; font-size: 20px; }
    
    .cta-section { background: #1e293b; color: white; border-radius: 16px; padding: 40px; text-align: center; margin-top: 40px; }
    .cta-title { font-size: 24px; font-weight: 600; margin-bottom: 16px; }
    .cta-contact { margin-top: 20px; font-size: 14px; opacity: 0.8; }
    
    .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
    
    @media print {
      .container { padding: 20px; }
      .cta-section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AIHPRO</div>
      <div class="subtitle">AI 기반 아동발달 선별 및 전문가 매칭 플랫폼</div>
      <h1 class="proposal-title">${selectedTemplate?.title || '맞춤형 솔루션 제안서'}</h1>
      <p class="proposal-meta">제안일: ${currentDate} | 유효기간: 30일</p>
    </div>

    <div class="section">
      <h2 class="section-title">📋 제안 대상 기관</h2>
      <div class="info-box">
        <div class="info-row"><span class="info-label">기관명</span><span class="info-value">${formData.institution_name}</span></div>
        <div class="info-row"><span class="info-label">담당자</span><span class="info-value">${formData.contact_name}</span></div>
        <div class="info-row"><span class="info-label">이메일</span><span class="info-value">${formData.contact_email}</span></div>
        <div class="info-row"><span class="info-label">대상 인원</span><span class="info-value">${formData.target_users}명</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🎯 제안 배경</h2>
      <p style="margin-bottom: 16px;">
        McKinsey Health Institute 보고서에 따르면, "Brain Capital" 투자는 2050년까지 <strong>6.2조 달러</strong>의 GDP 창출이 가능하며, 
        특히 0-7세 조기 개입 프로그램은 <strong>연 7-13%의 투자 수익률</strong>을 기록하고 있습니다.
      </p>
      <p>
        AIHPRO는 AI 기술을 활용하여 아동의 발달 상태를 객관적으로 분석하고, 
        전문가 네트워크와의 연결을 통해 조기 발견 및 개입을 지원하는 플랫폼입니다.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">✨ 핵심 기능</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">🧠</div>
          <div class="feature-title">AI 발달 선별</div>
          <div class="feature-desc">5개 발달 영역 자동 분석 및 조기 발견 지원</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-title">자동 리포팅</div>
          <div class="feature-desc">학부모/기관용 맞춤 리포트 자동 생성</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">👥</div>
          <div class="feature-title">전문가 네트워크</div>
          <div class="feature-desc">40+ 전문가와의 실시간 상담 연결</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-title">관리자 대시보드</div>
          <div class="feature-desc">기관 전체 현황 모니터링 및 관리</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🎁 파일럿 프로그램 혜택</h2>
      <ul class="benefits-list">
        <li><span class="check-icon">✓</span> <strong>3개월 무료</strong> 시범 운영 제공</li>
        <li><span class="check-icon">✓</span> 전담 CS 매니저 배정</li>
        <li><span class="check-icon">✓</span> 맞춤형 온보딩 교육 (2회)</li>
        <li><span class="check-icon">✓</span> ROI 측정 리포트 제공</li>
        <li><span class="check-icon">✓</span> 정식 계약 시 <strong>20% 할인</strong> 적용</li>
      </ul>
    </div>

    <div class="pricing-box">
      <div class="pricing-title">파일럿 종료 후 예상 가격</div>
      <div class="pricing-value">${selectedTemplate?.pricing || '별도 협의'}</div>
      <div class="pricing-note">* 기관 규모 및 이용자 수에 따라 조정 가능</div>
    </div>

    <div class="section">
      <h2 class="section-title">📅 도입 일정</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-step">1</div>
          <div class="timeline-content">
            <h4>킥오프 미팅 (1주차)</h4>
            <p>니즈 분석 및 맞춤 설정, 관리자 계정 발급</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-step">2</div>
          <div class="timeline-content">
            <h4>온보딩 교육 (2주차)</h4>
            <p>담당자 교육 및 시스템 사용법 안내</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-step">3</div>
          <div class="timeline-content">
            <h4>파일럿 운영 (3-12주차)</h4>
            <p>실제 서비스 운영 및 피드백 수렴</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-step">4</div>
          <div class="timeline-content">
            <h4>성과 분석 (13주차)</h4>
            <p>ROI 측정 및 정식 계약 협의</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="cta-title">지금 바로 파일럿을 시작하세요</div>
      <p>3개월 무료 체험으로 ROI를 먼저 확인하세요</p>
      <div class="cta-contact">
        📧 b2b@aihpro.kr | 📞 02-1234-5678 | 🌐 aihpro.kr/b2b-consulting
      </div>
    </div>

    <div class="footer">
      <p>© 2024 AIHPRO. AI 기반 아동발달 선별 및 전문가 매칭 플랫폼</p>
      <p style="margin-top: 8px;">본 제안서는 기밀 문서이며, 무단 배포를 금합니다.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleGenerate = () => {
    if (!formData.institution_name || !formData.contact_name || !formData.contact_email) {
      toast({
        title: "필수 정보를 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedProposal(generateProposalHTML());
      setIsGenerating(false);
      toast({
        title: "제안서가 생성되었습니다",
        description: "다운로드 또는 인쇄할 수 있습니다."
      });
    }, 1500);
  };

  const handleDownload = () => {
    if (!generatedProposal) return;
    
    const blob = new Blob([generatedProposal], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AIHPRO_제안서_${formData.institution_name}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!generatedProposal) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedProposal);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <FileText className="w-3 h-3 mr-1" />
            B2B Proposal Generator
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            기관 맞춤 제안서 자동 생성
          </h1>
          <p className="text-muted-foreground">
            기관 정보를 입력하면 맞춤형 파일럿 프로그램 제안서가 자동으로 생성됩니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                기관 정보 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">기관명 *</label>
                <Input
                  value={formData.institution_name}
                  onChange={(e) => setFormData({...formData, institution_name: e.target.value})}
                  placeholder="예: 행복한 어린이집"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">기관 유형 *</label>
                <Select
                  value={formData.institution_type}
                  onValueChange={(value) => setFormData({...formData, institution_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daycare">어린이집/유치원</SelectItem>
                    <SelectItem value="academy">학원</SelectItem>
                    <SelectItem value="development_center">발달센터/치료기관</SelectItem>
                    <SelectItem value="enterprise">기업 (EAP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">담당자명 *</label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">이메일 *</label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="email@institution.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">대상 인원 수</label>
                <Input
                  type="number"
                  value={formData.target_users}
                  onChange={(e) => setFormData({...formData, target_users: e.target.value})}
                  placeholder="50"
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? '생성 중...' : '제안서 생성하기'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Templates Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">템플릿 미리보기</h3>
            {proposalTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${formData.institution_type === template.id ? 'border-blue-500 shadow-md' : 'hover:border-blue-200'}`}
                onClick={() => setFormData({...formData, institution_type: template.id})}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.institution_type === template.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{template.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generated Proposal Actions */}
        {generatedProposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-lg">제안서가 생성되었습니다!</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.institution_name} 맞춤 제안서 ({formData.target_users}명 대상)
                    </p>
                  </div>
                </div>
                
                {/* Free HTML Download */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    HTML 다운로드 (무료)
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    인쇄하기
                  </Button>
                </div>

                {/* Premium PDF Paywall */}
                <Card className={`border-2 ${hasPremiumAccess ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasPremiumAccess ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-blue-600" />
                        )}
                        <div>
                          <p className="font-semibold">프리미엄 PDF 제안서</p>
                          <p className="text-xs text-muted-foreground">
                            {hasPremiumAccess 
                              ? '프리미엄 버전을 다운로드할 수 있습니다' 
                              : '기관 로고 반영 + 프린트 최적화 + 전문 디자인'}
                          </p>
                        </div>
                      </div>
                      {hasPremiumAccess ? (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-2" />
                          PDF 다운로드
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          ₩30,000 결제
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* B2B Product Cards Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              Premium Services
            </Badge>
            <h2 className="text-2xl font-bold mb-2">즉시 구매 가능한 B2B 서비스</h2>
            <p className="text-muted-foreground">
              파일럿 시작 전 필요한 자료를 바로 구매하세요
            </p>
          </div>
          <B2BProductCards 
            onPurchaseComplete={(productId) => {
              if (productId === 'b2b_proposal_premium') {
                setHasPremiumAccess(true);
              }
              toast({
                title: "구매 완료",
                description: "결제가 완료되었습니다. 감사합니다!"
              });
            }}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <B2BPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        productId="b2b_proposal_premium"
        onSuccess={() => {
          setHasPremiumAccess(true);
          setShowPaymentModal(false);
          toast({
            title: "결제 완료",
            description: "프리미엄 제안서를 다운로드할 수 있습니다."
          });
        }}
      />
    </div>
  );
};

export default B2BProposal;
