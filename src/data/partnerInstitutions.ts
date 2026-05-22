export type PartnerInstitution = {
  id: string;
  name: string;
  type: string;
  location: string;
  specialties: string[];
  isVerified: boolean;
  website?: string;
};

export const PARTNER_INSTITUTIONS: PartnerInstitution[] = [
  { id: 'inst_1', name: 'APA발달센터', type: '발달센터', location: '본점', specialties: ['ABA', '발달재활'], isVerified: true },
  { id: 'inst_2', name: 'APA주간활동서비스센터', type: '발달센터', location: '본점', specialties: ['주간활동', '발달재활'], isVerified: true },
  { id: 'inst_3', name: '한점미소발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '놀이치료'], isVerified: true },
  { id: 'inst_4', name: '한점미소발달센터 부천점', type: '발달센터', location: '경기 부천', specialties: ['발달재활', '놀이치료'], isVerified: true },
  { id: 'inst_5', name: '우아함발달센터 안산점', type: '발달센터', location: '경기 안산', specialties: ['발달재활', 'ABA'], isVerified: true },
  { id: 'inst_6', name: '우아함발달센터 화성세솔점', type: '발달센터', location: '경기 화성', specialties: ['발달재활', 'ABA'], isVerified: true },
  { id: 'inst_7', name: '메이플 ABA 목동센터', type: 'ABA센터', location: '서울 목동', specialties: ['ABA', '행동치료'], isVerified: true },
  { id: 'inst_8', name: '엘림아동발달센터', type: '발달센터', location: '대구', specialties: ['언어치료', '인지치료'], isVerified: true },
  { id: 'inst_9', name: '해웃음 심리발달센터', type: '심리발달센터', location: '서울 강서구', specialties: ['심리상담', '발달재활'], isVerified: true },
  { id: 'inst_10', name: '핌발달센터 남양주점', type: '발달센터', location: '경기 남양주', specialties: ['발달재활', '감각통합'], isVerified: true },
  { id: 'inst_11', name: '정관언어발달센터', type: '언어발달센터', location: '부산 기장', specialties: ['언어치료', '조음치료'], isVerified: true },
  { id: 'inst_12', name: '해오름 아동발달센터', type: '발달센터', location: '부산 기장', specialties: ['발달재활', '놀이치료'], isVerified: true },
  { id: 'inst_13', name: '넘나들 언어인지학습연구소', type: '연구소', location: '경기 양주', specialties: ['언어치료', '인지학습'], isVerified: true },
  { id: 'inst_14', name: '별하언어심리상담센터', type: '심리상담센터', location: '서울 구로', specialties: ['언어치료', '심리상담'], isVerified: true },
  { id: 'inst_15', name: '정아동발달센터', type: '발달센터', location: '미입력', specialties: ['발달재활'], isVerified: true },
  { id: 'inst_16', name: '소리엘언어발달센터', type: '언어발달센터', location: '부산 동래', specialties: ['언어치료', '발달재활'], isVerified: true },
  { id: 'inst_17', name: '나아가다발달상담센터', type: '발달상담센터', location: '부산 연제구', specialties: ['발달상담', '심리상담'], isVerified: true },
  { id: 'inst_18', name: '우리aba사회성발달센터', type: '발달센터', location: '경기 의왕', specialties: ['ABA', '사회성발달'], isVerified: true },
  { id: 'inst_19', name: '한걸음발달 연구소', type: '연구소', location: '대구 달서구', specialties: ['발달재활', '연구'], isVerified: true },
  { id: 'inst_20', name: '참소리언어심리연구소', type: '연구소', location: '경기 화성', specialties: ['언어치료', '심리상담'], isVerified: true },
  { id: 'inst_21', name: '산본아동발달센터', type: '발달센터', location: '경기 군포', specialties: ['발달재활', '아동발달'], isVerified: true },
  { id: 'inst_22', name: '도란도란 심리상담센터', type: '심리상담센터', location: '전국', specialties: ['심리상담', '가족치료'], isVerified: true },
  { id: 'inst_23', name: '다다언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], isVerified: true },
  { id: 'inst_24', name: '풍무아동청소년아동발달센터', type: '발달센터', location: '경기', specialties: ['아동발달', '청소년발달'], isVerified: true },
  { id: 'inst_25', name: '창원튼튼병원 부설 아동발달센터', type: '병원부설', location: '창원', specialties: ['아동발달', '의료상담'], isVerified: true },
  { id: 'inst_26', name: '톡톡말톡톡 언어인지학습센터', type: '학습센터', location: '경기 고양', specialties: ['언어치료', '인지학습'], isVerified: true },
  { id: 'inst_27', name: '인애 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], isVerified: true },
  { id: 'inst_28', name: '가까이 한의원 강남점', type: '한의원', location: '서울 강남', specialties: ['한방치료', '아동건강'], isVerified: true },
  { id: 'inst_29', name: '굿모닝언어심리발달센터', type: '발달센터', location: '울산', specialties: ['언어치료', '심리발달'], isVerified: true },
  { id: 'inst_30', name: '디딤돌언어사회성연구소', type: '연구소', location: '부산', specialties: ['언어치료', '사회성발달'], isVerified: true },
  { id: 'inst_31', name: '그리미미술 옥포점', type: '미술치료센터', location: '경남 옥포', specialties: ['미술치료', '표현예술'], isVerified: true },
  { id: 'inst_32', name: '인애 한의원 안산점', type: '한의원', location: '경기 안산', specialties: ['한방치료', '아동건강'], isVerified: true },
  { id: 'inst_33', name: '부천주간 활동서비스', type: '주간활동서비스', location: '부천', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_34', name: '시흥주간 활동서비스', type: '주간활동서비스', location: '시흥', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_35', name: '남양주주간 활동서비스', type: '주간활동서비스', location: '남양주', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_36', name: '용인주간 활동서비스', type: '주간활동서비스', location: '용인', specialties: ['주간활동', '장애인서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_37', name: '부천주간 보호시설', type: '주간보호시설', location: '부천', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_38', name: '구로주간 보호시설', type: '주간보호시설', location: '서울 구로', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_39', name: '하남주간 보호시설', type: '주간보호시설', location: '하남', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_40', name: '양천주간 보호시설', type: '주간보호시설', location: '서울 양천', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_41', name: '평택주간 방과후 서비스센터', type: '방과후서비스', location: '평택', specialties: ['방과후활동', '주간서비스'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_42', name: '진접주간 사회문화 연구소', type: '연구소', location: '남양주 진접', specialties: ['사회문화', '연구'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_43', name: '강릉주간 특수체육', type: '특수체육', location: '강릉', specialties: ['특수체육', '운동발달'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_44', name: '남양주화도점 주간보호시설', type: '주간보호시설', location: '남양주 화도', specialties: ['주간보호', '장애인보호'], isVerified: true, website: 'https://www.xn--3o5bl1yp0a.com/' },
  { id: 'inst_45', name: '함께하는우리 발달장애 주간활동', type: '주간활동서비스', location: '전국', specialties: ['발달장애', '주간활동'], isVerified: true },
  { id: 'inst_46', name: '함께하는우리 방과후활동서비스기관', type: '방과후서비스', location: '전국', specialties: ['방과후활동', '발달장애'], isVerified: true },
  { id: 'inst_47', name: '한국스포츠과학연구소 장애인주간활동,방과후활동센터 하남점', type: '주간활동서비스', location: '하남', specialties: ['장애인주간활동', '방과후활동', '스포츠과학'], isVerified: true },
];
