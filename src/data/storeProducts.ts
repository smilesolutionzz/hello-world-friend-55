/**
 * 큐레이션 스토어 상품
 * - 외부 Cafe24 스토어(smilezzsolution.cafe24.com)와 연결
 * - 발달/육아 관련 상품만 선별 노출
 * - 이미지/가격/링크는 운영자가 관리자 페이지에서 수정 가능하도록 추후 DB화 예정
 */

export const STORE_BASE_URL = 'https://smilezzsolution.cafe24.com';

export type StoreCategory =
  | 'developmental_toy'
  | 'sensory'
  | 'book'
  | 'parenting'
  | 'wellness'
  | 'assessment_package';

export interface StoreProduct {
  id: string;
  name: string;
  category: StoreCategory;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  /** Cafe24 상품 상세 URL (절대경로) */
  url: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  badge?: 'BEST' | 'NEW' | 'HOT' | '추천';
  /** 한 줄 카피 — 심리검사 패키지 등에서 사용 */
  tagline?: string;
}

export const STORE_CATEGORIES: { key: StoreCategory; label: string; emoji?: string }[] = [
  { key: 'developmental_toy', label: '발달 교구' },
  { key: 'sensory', label: '감각 통합' },
  { key: 'book', label: '추천 도서' },
  { key: 'parenting', label: '부모 코칭' },
  { key: 'wellness', label: '웰니스' },
  { key: 'assessment_package', label: '심리검사 패키지' },
];

/**
 * 초기 큐레이션 상품 (placeholder)
 * 실제 운영 시 Cafe24 상품 상세 URL과 이미지를 정확히 매핑할 것.
 * URL은 일단 스토어 메인으로 fallback — 운영자가 상품 ID 확정 후 교체.
 */
export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'p001',
    name: '소근육 발달 끼우기 교구',
    category: 'developmental_toy',
    price: 24900,
    originalPrice: 35000,
    discountPercent: 29,
    image: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=24`,
    rating: 4.9,
    reviewCount: 142,
    badge: 'BEST',
    tags: ['12~36개월', '소근육'],
  },
  {
    id: 'p002',
    name: '감각통합 촉감 매트',
    category: 'sensory',
    price: 38000,
    originalPrice: 52000,
    discountPercent: 27,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=25`,
    rating: 4.8,
    reviewCount: 87,
    badge: '추천',
    tags: ['감각', '24~60개월'],
  },
  {
    id: 'p003',
    name: '언어 자극 카드 100',
    category: 'developmental_toy',
    price: 19800,
    originalPrice: 28000,
    discountPercent: 29,
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=24`,
    rating: 4.9,
    reviewCount: 211,
    badge: 'HOT',
    tags: ['언어', '18~48개월'],
  },
  {
    id: 'p004',
    name: '부모를 위한 발달 가이드북',
    category: 'book',
    price: 16200,
    originalPrice: 18000,
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=27`,
    rating: 5.0,
    reviewCount: 56,
    tags: ['부모', '가이드'],
  },
  {
    id: 'p005',
    name: '아이 수면 루틴 인형',
    category: 'wellness',
    price: 32000,
    originalPrice: 45000,
    discountPercent: 29,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=28`,
    rating: 4.7,
    reviewCount: 33,
    badge: 'NEW',
    tags: ['수면', '0~36개월'],
  },
  {
    id: 'p006',
    name: '부모 마음챙김 워크북',
    category: 'parenting',
    price: 14800,
    originalPrice: 19800,
    discountPercent: 25,
    image: 'https://images.unsplash.com/photo-1531070314440-04f3cd1eb1ad?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=27`,
    rating: 4.8,
    reviewCount: 74,
    tags: ['부모', '마음챙김'],
  },
  {
    id: 'p007',
    name: '대근육 발달 점프 매트',
    category: 'developmental_toy',
    price: 49000,
    originalPrice: 69000,
    discountPercent: 29,
    image: 'https://images.unsplash.com/photo-1518830638800-0adb09a39ce0?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=24`,
    rating: 4.9,
    reviewCount: 119,
    badge: 'BEST',
    tags: ['대근육', '24~72개월'],
  },
  {
    id: 'p008',
    name: '감정 인식 보드게임',
    category: 'developmental_toy',
    price: 27800,
    originalPrice: 35000,
    discountPercent: 21,
    image: 'https://images.unsplash.com/photo-1611601322175-ef8ec8c85f01?w=600&q=80',
    url: `${STORE_BASE_URL}/product/list.html?cate_no=24`,
    rating: 4.8,
    reviewCount: 64,
    badge: '추천',
    tags: ['정서', '48개월+'],
  },
];

export const getStoreProductsByCategory = (category?: StoreCategory) =>
  category ? STORE_PRODUCTS.filter((p) => p.category === category) : STORE_PRODUCTS;
