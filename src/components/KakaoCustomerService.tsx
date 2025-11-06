import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KakaoCustomerService = () => {
  const handleKakaoClick = () => {
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
  };

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40">
      <Button
        onClick={handleKakaoClick}
        className="bg-[#FEE500] hover:bg-[#FDD800] text-[#3C1E1E] rounded-full px-4 py-3 sm:px-5 sm:py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base font-bold"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>고객센터</span>
      </Button>
    </div>
  );
};

export default KakaoCustomerService;
