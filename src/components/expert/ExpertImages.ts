import expertJangHotak from '@/assets/expert-jang-hotak.jpg';
import expertKimSungil from '@/assets/expert-kim-sungil.jpg';

export const expertImages: Record<string, string> = {
  '장호탁': expertJangHotak,
  '김선길': expertKimSungil,
};

export const getExpertImage = (name: string): string | null => {
  console.log('Getting image for:', name, expertImages[name]);
  return expertImages[name] || null;
};
