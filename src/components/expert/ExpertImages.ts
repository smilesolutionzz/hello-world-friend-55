// AI-generated professional portrait images for all experts
import female01 from '@/assets/experts/expert-female-01.jpg';
import female02 from '@/assets/experts/expert-female-02.jpg';
import female03 from '@/assets/experts/expert-female-03.jpg';
import female04 from '@/assets/experts/expert-female-04.jpg';
import female05 from '@/assets/experts/expert-female-05.jpg';
import female06 from '@/assets/experts/expert-female-06.jpg';
import female07 from '@/assets/experts/expert-female-07.jpg';
import female08 from '@/assets/experts/expert-female-08.jpg';
import female09 from '@/assets/experts/expert-female-09.jpg';
import female10 from '@/assets/experts/expert-female-10.jpg';
import female11 from '@/assets/experts/expert-female-11.jpg';
import female12 from '@/assets/experts/expert-female-12.jpg';
import female13 from '@/assets/experts/expert-female-13.jpg';
import female14 from '@/assets/experts/expert-female-14.jpg';
import female15 from '@/assets/experts/expert-female-15.jpg';
import female16 from '@/assets/experts/expert-female-16.jpg';
import female17 from '@/assets/experts/expert-female-17.jpg';
import female18 from '@/assets/experts/expert-female-18.jpg';
import male01 from '@/assets/experts/expert-male-01.jpg';
import male02 from '@/assets/experts/expert-male-02.jpg';
import male03 from '@/assets/experts/expert-male-03.jpg';
import male04 from '@/assets/experts/expert-male-04.jpg';
import male05 from '@/assets/experts/expert-male-05.jpg';
import male06 from '@/assets/experts/expert-male-06.jpg';
import male07 from '@/assets/experts/expert-male-07.jpg';
import male08 from '@/assets/experts/expert-male-08.jpg';
import male09 from '@/assets/experts/expert-male-09.jpg';
import male10 from '@/assets/experts/expert-male-10.jpg';
import male11 from '@/assets/experts/expert-male-11.jpg';
import male12 from '@/assets/experts/expert-male-12.jpg';
import male13 from '@/assets/experts/expert-male-13.jpg';
import male14 from '@/assets/experts/expert-male-14.jpg';

export const expertImages: Record<string, string> = {
  // 여성 전문가 (Female experts)
  '강은미': female01,
  '윤서연': female02,
  '김미영': female03,
  '이정아': female04,
  '오세은': female05,
  '이하연': female06,
  '김지연': female07,
  '양희진': female08,
  '김지수': female09,
  '조문주': female10,
  '박주현': female11,
  '허승연': female12,
  '이효진': female13,
  '김수현': female14,
  '주아인': female15,
  '김민주': female16,
  '한보경': female17,
  '손예영': female18,
  
  // 남성 전문가 (Male experts)
  '정민호': male01,
  '박상훈': male02,
  '장호탁': male03,
  '김선길': male04,
  '백경열': male05,
  '이수석': male06,
  '허승룡': male07,
  '송성목': male08,
  '이상록': male09,
  '문기웅': male10,
  '이기훈': male11,
  '박민수': male12,
  '장서원': male13,
  '전우준': male14,
};

export const getExpertImage = (name: string): string | null => {
  return expertImages[name] || null;
};
