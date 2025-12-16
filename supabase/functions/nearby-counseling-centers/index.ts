import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 전국 정신건강복지센터 데이터 (주요 지역)
const COUNSELING_CENTERS = [
  // 서울
  { name: '서울시정신건강복지센터', address: '서울시 중구 퇴계로 16', phone: '02-3444-9934', lat: 37.5583, lng: 127.0038, region: '서울', type: 'mental_health', available24h: true },
  { name: '서울시자살예방센터', address: '서울시 중구 동호로 310', phone: '02-3458-1000', lat: 37.5574, lng: 127.0138, region: '서울', type: 'suicide_prevention', available24h: true },
  { name: '강남구정신건강복지센터', address: '서울시 강남구 삼성로 430', phone: '02-2226-0344', lat: 37.5111, lng: 127.0558, region: '서울', type: 'mental_health', available24h: false },
  { name: '송파구정신건강복지센터', address: '서울시 송파구 올림픽로 326', phone: '02-2147-3371', lat: 37.5145, lng: 127.1058, region: '서울', type: 'mental_health', available24h: false },
  
  // 경기
  { name: '경기도정신건강복지센터', address: '경기도 수원시 영통구 광교로 107', phone: '031-212-0435', lat: 37.2864, lng: 127.0516, region: '경기', type: 'mental_health', available24h: true },
  { name: '성남시정신건강복지센터', address: '경기도 성남시 수정구 수정로 187', phone: '031-754-3220', lat: 37.4502, lng: 127.1272, region: '경기', type: 'mental_health', available24h: false },
  { name: '고양시정신건강복지센터', address: '경기도 고양시 일산동구 중앙로 1036', phone: '031-968-2333', lat: 37.6559, lng: 126.7721, region: '경기', type: 'mental_health', available24h: false },
  
  // 부산
  { name: '부산시정신건강복지센터', address: '부산시 연제구 중앙대로 1000', phone: '051-242-2575', lat: 35.1764, lng: 129.0596, region: '부산', type: 'mental_health', available24h: true },
  { name: '부산시자살예방센터', address: '부산시 연제구 반송로 100', phone: '051-507-3567', lat: 35.1858, lng: 129.0726, region: '부산', type: 'suicide_prevention', available24h: true },
  
  // 대구
  { name: '대구시정신건강복지센터', address: '대구시 중구 국채보상로 140', phone: '053-256-0199', lat: 35.8700, lng: 128.5966, region: '대구', type: 'mental_health', available24h: true },
  
  // 인천
  { name: '인천시정신건강복지센터', address: '인천시 미추홀구 독배로 409', phone: '032-421-4045', lat: 37.4639, lng: 126.6403, region: '인천', type: 'mental_health', available24h: true },
  
  // 광주
  { name: '광주시정신건강복지센터', address: '광주시 동구 서석로 66', phone: '062-600-1930', lat: 35.1453, lng: 126.9182, region: '광주', type: 'mental_health', available24h: true },
  
  // 대전
  { name: '대전시정신건강복지센터', address: '대전시 중구 중앙로 76', phone: '042-486-0005', lat: 36.3284, lng: 127.4295, region: '대전', type: 'mental_health', available24h: true },
  
  // 울산
  { name: '울산시정신건강복지센터', address: '울산시 남구 중앙로 201', phone: '052-716-7199', lat: 35.5384, lng: 129.3115, region: '울산', type: 'mental_health', available24h: true },
  
  // 제주
  { name: '제주특별자치도정신건강복지센터', address: '제주시 연동 273', phone: '064-717-3000', lat: 33.4890, lng: 126.4983, region: '제주', type: 'mental_health', available24h: true },
];

// 청소년 전용 상담센터
const YOUTH_CENTERS = [
  { name: '한국청소년상담복지개발원', address: '부산시 해운대구 센텀동로 35', phone: '051-662-3000', lat: 35.1689, lng: 129.1319, type: 'youth', available24h: false },
  { name: '서울시청소년상담복지센터', address: '서울시 중구 서소문로 124', phone: '02-2285-1318', lat: 37.5636, lng: 126.9726, region: '서울', type: 'youth', available24h: false },
  { name: '경기도청소년상담복지센터', address: '경기도 수원시 영통구 도청로 30', phone: '031-248-1318', lat: 37.2907, lng: 127.0350, region: '경기', type: 'youth', available24h: false },
];

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, radius, type, limit, isYouth } = await req.json();
    
    console.log('[Nearby Centers] Request:', { latitude, longitude, radius, type, isYouth });

    // 기본값 설정
    const searchRadius = radius || 50; // km
    const maxResults = limit || 10;
    
    // 센터 목록 결합
    let allCenters = [...COUNSELING_CENTERS];
    if (isYouth) {
      allCenters = [...YOUTH_CENTERS, ...allCenters];
    }

    // 타입 필터링
    if (type) {
      allCenters = allCenters.filter(center => center.type === type);
    }

    let results;
    
    if (latitude && longitude) {
      // 위치 기반 거리 계산
      results = allCenters
        .map(center => ({
          ...center,
          distance: calculateDistance(latitude, longitude, center.lat, center.lng)
        }))
        .filter(center => center.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults);
    } else {
      // 위치 없을 경우 전국 24시간 센터 우선
      results = allCenters
        .filter(center => center.available24h)
        .slice(0, maxResults)
        .map(center => ({ ...center, distance: null }));
    }

    // 긴급 연락처 항상 포함
    const emergencyContacts = [
      { name: '자살예방상담전화', number: '1393', description: '24시간 자살예방 전문상담', priority: 1 },
      { name: '정신건강위기상담전화', number: '1577-0199', description: '24시간 정신건강 위기상담', priority: 2 },
      { name: '청소년전화', number: '1388', description: '청소년 전용 상담 (24시간)', priority: 3 },
      { name: '생명의전화', number: '1588-9191', description: '자살예방 상담', priority: 4 },
      { name: '정신건강위기상담전화', number: '1577-0199', description: '정신건강 상담', priority: 5 },
    ];

    const response = {
      success: true,
      nearbyCenters: results,
      totalFound: results.length,
      emergencyContacts,
      searchParams: {
        latitude,
        longitude,
        radius: searchRadius,
        type,
        isYouth
      },
      timestamp: new Date().toISOString(),
    };

    console.log('[Nearby Centers] Found:', results.length, 'centers');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Nearby Centers] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
