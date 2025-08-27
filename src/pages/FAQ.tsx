import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "서비스 이용 방법이 궁금해요",
      answer: "회원가입 후 원하는 검사를 선택하여 진행하실 수 있습니다. 각 검사는 단계별 안내를 제공합니다."
    },
    {
      question: "검사 결과는 언제 확인할 수 있나요?",
      answer: "대부분의 검사는 완료 즉시 결과를 확인하실 수 있습니다. 일부 전문 분석이 필요한 검사는 24시간 이내에 결과가 제공됩니다."
    },
    {
      question: "결제 및 환불 정책이 어떻게 되나요?",
      answer: "신용카드, 카카오페이 등 다양한 결제 수단을 지원합니다. 서비스 이용 전 7일 이내 환불이 가능합니다."
    },
    {
      question: "개인정보는 안전하게 보호되나요?",
      answer: "모든 개인정보는 암호화되어 저장되며, 관련 법규를 준수하여 안전하게 관리됩니다. 검사 결과는 본인만 확인 가능합니다."
    },
    {
      question: "전문가 상담은 어떻게 받을 수 있나요?",
      answer: "검사 결과에 따라 적합한 전문가를 매칭해드립니다. 온라인 또는 오프라인 상담을 선택하실 수 있습니다."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">자주 묻는 질문</h1>
            <p className="text-muted-foreground">궁금한 점을 빠르게 해결해보세요</p>
          </div>
        </div>

        {/* FAQ Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              가장 자주 묻는 질문들을 모았습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              더 궁금한 점이 있으신가요?
            </CardTitle>
            <CardDescription>
              언제든지 문의해주세요. 빠르게 도움을 드리겠습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              이메일 문의
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              전화 문의
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;