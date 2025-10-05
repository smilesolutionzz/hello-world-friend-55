import expertJangHotak from '@/assets/expert-jang-hotak.jpg';
import expertKimSungil from '@/assets/expert-kim-sungil.jpg';
import expertOhSeeun from '@/assets/expert-oh-seeun.jpg';
import expertHeoSunhan from '@/assets/expert-heo-sunhan.jpg';
import expertSongSeongmok from '@/assets/expert-song-seongmok.jpg';
import expertYeSuyeo from '@/assets/expert-ye-suyeo.jpg';
import expertBaekGyeongyeol from '@/assets/expert-baek-gyeongyeol.jpg';
import expertLeeHayeon from '@/assets/expert-lee-hayeon.jpg';
import expertYeWonmuk from '@/assets/expert-ye-wonmuk.jpg';
import expertLeeSuseok from '@/assets/expert-lee-suseok.jpg';
import expertHeoSeungryong from '@/assets/expert-heo-seungryong.jpg';
import expertSongSeongmokNew from '@/assets/expert-song-seongmok-new.jpg';

export const expertImages: Record<string, string> = {
  '이수석': expertLeeSuseok,
  '허승룡': expertHeoSeungryong,
  '송성목': expertSongSeongmokNew,
  '장호탁': expertJangHotak,
  '김선길': expertKimSungil,
  '오세은': expertOhSeeun,
  '허순한': expertHeoSunhan,
  '예수여': expertYeSuyeo,
  '백경열': expertBaekGyeongyeol,
  '이하연': expertLeeHayeon,
  '예원묵': expertYeWonmuk,
};

export const getExpertImage = (name: string): string | null => {
  console.log('Getting image for:', name, expertImages[name]);
  return expertImages[name] || null;
};
