import expertJangHotak from '@/assets/expert-jang-hotak.jpg';
import expertKimSungil from '@/assets/expert-kim-sungil.jpg';
import expertOhSeeun from '@/assets/expert-oh-seeun.jpg';
import expertHeoSunhan from '@/assets/expert-heo-sunhan.jpg';
import expertSongSeyeong from '@/assets/expert-song-seyeong.jpg';
import expertYeSuyeo from '@/assets/expert-ye-suyeo.jpg';
import expertParkWonmuk from '@/assets/expert-park-wonmuk.jpg';
import expertLeeHayeon from '@/assets/expert-lee-hayeon.jpg';
import expertYeWonmuk from '@/assets/expert-ye-wonmuk.jpg';

export const expertImages: Record<string, string> = {
  '장호탁': expertJangHotak,
  '김선길': expertKimSungil,
  '오세은': expertOhSeeun,
  '허순한': expertHeoSunhan,
  '송세영': expertSongSeyeong,
  '예수여': expertYeSuyeo,
  '박원묵': expertParkWonmuk,
  '이하연': expertLeeHayeon,
  '예원묵': expertYeWonmuk,
};

export const getExpertImage = (name: string): string | null => {
  console.log('Getting image for:', name, expertImages[name]);
  return expertImages[name] || null;
};
