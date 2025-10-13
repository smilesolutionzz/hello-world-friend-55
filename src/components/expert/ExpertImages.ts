import expertJangHotak from '@/assets/expert-jang-hotak.jpg';
import expertKimSungil from '@/assets/expert-kim-sungil.jpg';
import expertOhSeeun from '@/assets/expert-oh-seeun.jpg';
import expertHeoSunhan from '@/assets/expert-heo-sunhan.jpg';
import expertSongSeongmok from '@/assets/expert-song-seongmok.jpg';
import expertYeSuyeo from '@/assets/expert-ye-suyeo.jpg';
import expertBaekGyeongyeol from '@/assets/expert-baek-gyeongyeol.jpg';
import expertLeeHayeon from '@/assets/expert-lee-hayeon.jpg';
import expertYeWonmuk from '@/assets/expert-ye-wonmuk.jpg';
import expertLeeSuseok from '@/assets/expert-lee-suseok-male.jpg';
import expertHeoSeungryong from '@/assets/expert-heo-seungryong-male.jpg';
import expertSongSeongmokNew from '@/assets/expert-song-seongmok-male.jpg';
import expertLeeSangrok from '@/assets/expert-lee-sangrok.jpg';
import expertMoonGiwung from '@/assets/expert-moon-giwung.jpg';
import expertKimJiyeon from '@/assets/expert-kim-jiyeon.jpg';
import expertParkMinsu from '@/assets/expert-park-minsu.jpg';
import expertKimMiyoung from '@/assets/expert-kim-miyoung.jpg';
import expertParkSanghoon from '@/assets/expert-park-sanghoon.jpg';
import expertLeeJungah from '@/assets/expert-lee-jungah.jpg';
import expertKangEunmi from '@/assets/expert-kang-eunmi.jpg';
import expertKimJisoo from '@/assets/expert-kim-jisoo.jpg';
import expertParkMinjun from '@/assets/expert-park-minjun.jpg';
import expertLeeSeoyeon from '@/assets/expert-lee-seoyeon.jpg';
import expertChoiDongwook from '@/assets/expert-choi-dongwook.jpg';
import expertJangYujin from '@/assets/expert-jang-yujin.jpg';
import expertHanSoyoung from '@/assets/expert-han-soyoung.jpg';
import expertOhTaehyun from '@/assets/expert-oh-taehyun.jpg';
import expertLimGayoung from '@/assets/expert-lim-gayoung.jpg';

export const expertImages: Record<string, string> = {
  '문기웅': expertMoonGiwung,
  '이수석': expertLeeSuseok,
  '허승룡': expertHeoSeungryong,
  '송성목': expertSongSeongmokNew,
  '이상록': expertLeeSangrok,
  '장호탁': expertJangHotak,
  '김선길': expertKimSungil,
  '오세은': expertOhSeeun,
  '허순한': expertHeoSunhan,
  '예수여': expertYeSuyeo,
  '백경열': expertBaekGyeongyeol,
  '이하연': expertLeeHayeon,
  '예원묵': expertYeWonmuk,
  '김지연': expertKimJiyeon,
  '박민수': expertParkMinsu,
  '김미영': expertKimMiyoung,
  '박상훈': expertParkSanghoon,
  '이정아': expertLeeJungah,
  '강은미': expertKangEunmi,
  '김지수': expertKimJisoo,
  '박민준': expertParkMinjun,
  '이서연': expertLeeSeoyeon,
  '최동욱': expertChoiDongwook,
  '장유진': expertJangYujin,
  '한소영': expertHanSoyoung,
  '오태현': expertOhTaehyun,
  '임가영': expertLimGayoung,
};

export const getExpertImage = (name: string): string | null => {
  console.log('Getting image for:', name, expertImages[name]);
  return expertImages[name] || null;
};
