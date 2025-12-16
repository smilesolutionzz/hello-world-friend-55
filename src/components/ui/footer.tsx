import { BookOpen, Rocket } from "lucide-react";
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="AIHPRO" className="h-8 w-8" />
              <h3 className="text-lg font-semibold text-white">AIHPRO</h3>
            </div>
            <p className="text-sm text-slate-300">
              AI 기반 심리 분석 및 상담 연결 서비스
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-white">서비스</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/assessment" className="hover:text-white transition-colors">심리 검사</a></li>
              <li><a href="/ai-counselor" className="hover:text-white transition-colors">AI 상담</a></li>
              <li><a href="/expert-hiring" className="hover:text-white transition-colors">전문가 연결</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4 text-white">고객지원</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/platform-manual" className="hover:text-white transition-colors">플랫폼 메뉴얼 보기</a></li>
              <li><a href="/terms-of-service" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              <li><a href="/refund-policy" className="hover:text-white transition-colors">환불정책</a></li>
              <li className="text-slate-300">문의: aihpro@naver.com</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-white">자매 서비스</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://memolegacy.com?ref=highlight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium text-white">요양시설 · 주간발달센터</div>
                    <div className="text-xs text-slate-400">전용 AI 솔루션</div>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href="https://youchancemvp.com?ref=highlight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors group"
                >
                  <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium text-white">AIHealthgrow</div>
                    <div className="text-xs text-slate-400">AI권리금산정 자동화마케팅</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 사업자 정보 (토스페이먼츠 요구사항) */}
        <div className="border-t border-slate-700 mt-8 pt-6">
          <div className="text-sm text-slate-300 space-y-1">
            <p className="font-semibold text-white mb-2">사업자 정보</p>
            <p>상호명: AIHPRO</p>
            <p>대표자명: 이수석</p>
            <p>사업자등록번호: 206-42-62002</p>
            <p>업태: 정보통신업 | 종목: 응용 소프트웨어 개발 및 공급업</p>
            <p>대표 전화: 010-3363-6604</p>
            <p>이메일 문의: aihpro@naver.com</p>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 AIHPRO. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <span className="text-red-400 font-medium">응급상황: 119</span>
            <span className="text-blue-400 font-medium">자살예방상담: 1577-0199</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;