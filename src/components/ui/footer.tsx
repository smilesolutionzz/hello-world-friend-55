import { Card } from "./card";

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">하이라이트 AI</h3>
            <p className="text-sm text-muted-foreground">
              AI 기반 심리 분석 및 상담 연결 서비스
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/assessment" className="hover:text-foreground">심리 검사</a></li>
              <li><a href="/ai-counselor" className="hover:text-foreground">AI 상담</a></li>
              <li><a href="/expert-hiring" className="hover:text-foreground">전문가 연결</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/terms" className="hover:text-foreground">이용약관</a></li>
              <li><a href="/privacy" className="hover:text-foreground">개인정보처리방침</a></li>
              <li>문의: aihpro@naver.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 하이라이트 AI. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <span className="text-red-600 font-medium">응급상황: 119</span>
            <span className="text-blue-600 font-medium">자살예방상담: 1577-0199</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;