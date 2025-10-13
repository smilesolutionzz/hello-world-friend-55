import { getExpertImage } from '@/components/expert/ExpertImages';

export const mockExperts = [
  {
    id: '1',
    name: '김지연 박사',
    photo_url: getExpertImage('김지연') || '/placeholder.svg',
    credential: '임상심리학 박사, 아동발달전문가',
    verified: true,
    categories: ['아동발달', '학습장애'],
    region: '서울',
    online: true,
    rating: 4.9,
    price_per_50: 60000,
    availability_text: '평일 오후 가능',
    contact_form_url: 'https://forms.gle/example1',
    calendly_url: 'https://calendly.com/example1',
    intro: '20년 경력의 아동발달 전문가입니다.',
    visible: true
  },
  {
    id: '2',
    name: '박민수 교수',
    photo_url: getExpertImage('박민수') || '/placeholder.svg',
    credential: '정신의학과 전문의, 의학박사',
    verified: true,
    categories: ['우울증', '불안장애'],
    region: '경기',
    online: false,
    rating: 4.8,
    price_per_50: 50000,
    availability_text: '주말 오전 가능',
    contact_form_url: 'https://forms.gle/example2',
    calendly_url: 'https://calendly.com/example2',
    intro: '성인 정신건강 전문의입니다.',
    visible: true
  }
];