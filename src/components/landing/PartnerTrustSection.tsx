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
    "삼성웰니스의원",
    "한점미소발달센터",
    "메이플 ABA센터",
    "해웃음 심리센터",
    "정아동심리상담소",
    "우아함발달센터"
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
          <div className="relative overflow-hidden">
            <div className="flex gap-12 animate-scroll">
              {[...partners, ...partners].map((partner, index) => (
                <div 
                  key={index}
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
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnerTrustSection;
