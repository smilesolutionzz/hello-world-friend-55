import { Shield, Award, Lock, CheckCircle } from 'lucide-react';

const PartnerTrustSection = () => {
  const trustBadges = [
    {
      icon: Shield,
      title: "의료기관 인증"
    },
    {
      icon: Lock,
      title: "SSL 암호화"
    },
    {
      icon: Award,
      title: "ISO 인증"
    },
    {
      icon: CheckCircle,
      title: "AI 투명성"
    }
  ];

  const partners = [
    "우아함발달센터 안산점",
    "우아함발달센터 화성새솔점",
    "메이플 ABA 목동센터",
    "엘림아동발달센터",
    "해웃음 심리발달센터",
    "핌발달센터",
    "정관언어발달센터",
    "해오름 아동발달센터",
    "넘나들발달센터",
    "별하 아동발달센터",
    "정아동심리상담소",
    "소리엘 언어치료센터",
    "나아가다 발달센터",
    "우리 ABA 센터",
    "한걸음 발달센터",
    "참소리 언어센터",
    "산본 발달치료센터",
    "도란도란 심리센터",
    "다다 아동발달센터",
    "창원발달의학센터",
    "튼튼발달센터",
    "아이사랑발달센터",
    "희망발달센터",
    "푸른하늘발달센터",
    "새싹발달센터",
    "햇살발달센터"
  ];

  return (
    <section className="py-24 bg-[#F5F7FA]">
      <div className="container mx-auto px-6">
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-600 mb-6 uppercase tracking-wider">
            신뢰할 수 있는 플랫폼
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#5E8FFF]" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{badge.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partner Logos Slider */}
        <div className="border-t border-gray-200 pt-12">
          <p className="text-center text-sm font-semibold text-gray-600 mb-8 uppercase tracking-wider">
            파트너 기관 & 협력 네트워크
          </p>
          <div 
            className="relative overflow-hidden flex flex-nowrap"
            style={{ ['--marquee-duration' as any]: '16s' }}
          >
            <div className="marquee-track">
              {partners.map((partner, index) => (
                <div 
                  key={`track1-${index}`}
                  className="flex-shrink-0 px-8 py-4 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {partner}
                  </p>
                </div>
              ))}
            </div>
            <div className="marquee-track second" aria-hidden="true">
              {partners.map((partner, index) => (
                <div 
                  key={`track2-${index}`}
                  className="flex-shrink-0 px-8 py-4 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {partner}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track {
          display: flex;
          gap: 3rem;
          min-width: max-content;
          animation: marquee var(--marquee-duration, 3s) linear infinite;
        }
        .marquee-track.second {
          animation-delay: calc(var(--marquee-duration, 3s) / -2);
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnerTrustSection;
