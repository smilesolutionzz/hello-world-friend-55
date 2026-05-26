import { BookOpen, Rocket, Brain, FileText, Users, Heart, Sparkles, Building2 } from "lucide-react";
import logo from '@/assets/logo.png';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n';

const Footer = () => {
  const { t } = useTranslation();
  const { localePath } = useLanguage();

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
              {t.footer.description}
            </p>
          </div>

          {/* 서비스 - 대표 카테고리만 */}
          <div>
            <h4 className="font-medium mb-4 text-white">{t.footer.services}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href={localePath('/mind-track')} className="hover:text-white transition-colors">7일 마음 트랙</a></li>
              <li><a href={localePath('/assessment')} className="hover:text-white transition-colors">심리 검사</a></li>
              <li><a href={localePath('/expert-hiring')} className="hover:text-white transition-colors">전문가 연결</a></li>
              <li><a href={localePath('/report-generator')} className="hover:text-white transition-colors">전문가급 리포트</a></li>
            </ul>
          </div>

          {/* 고객지원 - 대표 항목만 */}
          <div>
            <h4 className="font-medium mb-4 text-white">{t.footer.support}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href={localePath('/about')} className="hover:text-white transition-colors">서비스 소개</a></li>
              <li><a href={localePath('/pricing')} className="hover:text-white transition-colors">요금제</a></li>
              <li><a href={localePath('/legal/terms')} className="hover:text-white transition-colors">약관 · 정책</a></li>
              <li className="text-slate-300">{t.footer.inquiry} aihpro@naver.com</li>
            </ul>
          </div>

          {/* 자매 서비스 */}
          <div>
            <h4 className="font-medium mb-4 text-white">{t.footer.sisterServices}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://memolegacy.com?ref=highlight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-white">{t.footer.facilityService}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://rtplanai.com?ref=highlight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors group"
                >
                  <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-white">{t.footer.healthgrow}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Business Info */}
        <div className="border-t border-slate-700 mt-8 pt-6">
          <div className="text-sm text-slate-300 space-y-1">
            <p className="font-semibold text-white mb-2">{t.footer.businessInfo}</p>
            <p>{t.footer.companyName}</p>
            <p>{t.footer.ceo}</p>
            <p>{t.footer.bizNo}</p>
            <p>{t.footer.bizType}</p>
            <p>{t.footer.phone}</p>
            <p>{t.footer.emailInquiry}</p>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>{t.footer.copyright}</p>
          <div className="mt-2 space-x-4">
            <span className="text-red-400 font-medium">{t.footer.emergency}</span>
            <span className="text-blue-400 font-medium">{t.footer.suicidePrevention}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
