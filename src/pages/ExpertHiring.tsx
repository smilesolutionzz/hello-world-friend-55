import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { mockInstitutions } from '@/data/mockInstitutions';
import { mockExperts as mockExpertsData } from '@/data/mockExperts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Star, 
  Award, 
  Calendar, 
  Clock, 
  Users, 
  MessageCircle, 
  Video,
  CheckCircle,
  Crown,
  Sparkles,
  Search,
  Filter,
  Brain,
  Heart,
  Shield,
  Zap,
  ChevronRight,
  MapPin,
  Building,
  UserCheck,
  Phone,
  Globe,
  Medal,
  Target,
  TrendingUp,
  Plus,
  ThumbsUp,
  Send,
  Trash2,
  MoreHorizontal,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import GrowthStoryFeed from '@/components/growth/GrowthStoryFeed';
import GrowthStoryShare from '@/components/growth/GrowthStoryShare';
import { getExpertImage } from '@/components/expert/ExpertImages';
import { QuickConsultationRequest } from '@/components/booking/QuickConsultationRequest';
import { KakaoStyleReviews } from '@/components/reviews/KakaoStyleReviews';
import { InstantChatDialog } from '@/components/consultation/InstantChatDialog';

interface Expert {
  id: string;
  name: string;
  specialty: string[];
  credentials: string[];
  rating: number;
  reviews: number;
  experience: string;
  availability: string;
  monthlyPrice: number;
  hourlyPrice: number;
  image: string;
  description: string;
  languages: string[];
  consultationTypes: string[];
  monthlyServices: string[];
  portfolio: {
    cases: number;
    successRate: number;
    specializations: string[];
  };
  location: string;
  isOnline: boolean;
  responseTime: string;
  aiMatchScore?: number;
}

const mockExperts: Expert[] = [
  {
    id: '1',
    name: '김미영',
    specialty: ['아동발달', '언어치료'],
    credentials: ['아동발달 전문의', '언어재활사 1급'],
    rating: 4.9,
    reviews: 156,
    experience: '12년',
    availability: '평일 9-18시',
    monthlyPrice: 120000,
    hourlyPrice: 30000,
    image: '/api/placeholder/150/150',
    description: '12년간 아동발달센터에서 근무하며 수백 명의 아이들을 치료해온 경험이 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 2회 개별 상담 (월 8회)',
      '월 1회 부모 상담',
      '발달 평가 및 리포트',
      '24시간 긴급 상담 지원'
    ],
    portfolio: {
      cases: 450,
      successRate: 92,
      specializations: ['아동발달', '언어치료', '발달평가']
    },
    location: '서울 강남구',
    isOnline: true,
    responseTime: '평균 2시간 이내'
  },
  {
    id: '2',
    name: '박상훈',
    specialty: ['행동분석', '자폐스펙트럼'],
    credentials: ['BCBA 자격증', '행동분석사'],
    rating: 4.8,
    reviews: 89,
    experience: '8년',
    availability: '평일 10-19시',
    monthlyPrice: 95000,
    hourlyPrice: 25000,
    image: '/api/placeholder/150/150',
    description: 'ABA 치료 전문가로 자폐스펙트럼 아동의 행동 개선에 특화되어 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 3회 ABA 치료 (월 12회)',
      '행동 목표 설정 및 관리',
      '가족 교육 프로그램',
      '진전 상황 월간 리포트'
    ],
    portfolio: {
      cases: 280,
      successRate: 94,
      specializations: ['ABA 치료', '행동분석', '자폐스펙트럼']
    },
    location: '경기 성남시',
    isOnline: true,
    responseTime: '평균 1시간 이내'
  },
  {
    id: '3',
    name: '이정아',
    specialty: ['언어치료', '발음교정'],
    credentials: ['1급 언어재활사'],
    rating: 4.7,
    reviews: 124,
    experience: '6년',
    availability: '평일 14-20시',
    monthlyPrice: 85000,
    hourlyPrice: 22000,
    image: '/api/placeholder/150/150',
    description: '언어발달지연 아동의 언어능력 향상을 위한 맞춤형 치료를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 2회 언어치료 (월 8회)',
      '발음 교정 및 언어 자극',
      '부모 가정지도 교육',
      '언어발달 평가서 제공'
    ],
    portfolio: {
      cases: 320,
      successRate: 88,
      specializations: ['언어치료', '발음교정', '언어발달']
    },
    location: '서울 마포구',
    isOnline: false,
    responseTime: '평균 4시간 이내'
  },
  {
    id: '4',
    name: '김수현',
    specialty: ['감각통합', '특수체육'],
    credentials: ['작업치료사', '특수체육교육사'],
    rating: 4.9,
    reviews: 92,
    experience: '10년',
    availability: '평일 9-18시',
    monthlyPrice: 110000,
    hourlyPrice: 28000,
    image: '/api/placeholder/150/150',
    description: '감각통합 장애 아동의 신체적, 인지적 발달을 위한 전문 치료를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['방문상담', '센터상담'],
    monthlyServices: [
      '주 2회 감각통합치료 (월 8회)',
      '특수체육 활동 프로그램',
      '가정내 환경 설정 가이드',
      '월간 발달 평가'
    ],
    portfolio: {
      cases: 340,
      successRate: 89,
      specializations: ['감각통합치료', '특수체육', '운동발달']
    },
    location: '서울 송파구',
    isOnline: false,
    responseTime: '평균 3시간 이내'
  },
  {
    id: '5',
    name: '강은미',
    specialty: ['심리상담', '심리평가'],
    credentials: ['임상심리사 1급'],
    rating: 4.8,
    reviews: 203,
    experience: '14년',
    availability: '평일 9-17시',
    monthlyPrice: 135000,
    hourlyPrice: 34000,
    image: '/api/placeholder/150/150',
    description: '아동 및 청소년의 심리적 어려움을 전문적으로 평가하고 치료합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담'],
    monthlyServices: [
      '주 1회 심리상담 (월 4회)',
      '심리검사 및 평가',
      '가족 상담 프로그램',
      '정신건강 관리 가이드'
    ],
    portfolio: {
      cases: 420,
      successRate: 91,
      specializations: ['심리평가', 'ADHD', '우울증', '불안장애']
    },
    location: '서울 서초구',
    isOnline: true,
    responseTime: '평균 1.5시간 이내'
  },
  {
    id: '6',
    name: '정민호',
    specialty: ['놀이치료', '정신상담'],
    credentials: ['놀이치료사', '정신건강임상심리사'],
    rating: 4.7,
    reviews: 167,
    experience: '9년',
    availability: '평일 10-19시',
    monthlyPrice: 100000,
    hourlyPrice: 26000,
    image: '/api/placeholder/150/150',
    description: '놀이를 통한 아동의 정서적 안정과 사회성 발달을 돕는 전문가입니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담', '센터상담'],
    monthlyServices: [
      '주 2회 놀이치료 (월 8회)',
      '정신건강 상담 및 평가',
      '부모-자녀 상호작용 지도',
      '정서 발달 관찰 리포트'
    ],
    portfolio: {
      cases: 285,
      successRate: 87,
      specializations: ['놀이치료', '정서발달', '사회성훈련', '정신건강']
    },
    location: '서울 강북구',
    isOnline: true,
    responseTime: '평균 3시간 이내'
  },
  {
    id: '7',
    name: '이기훈',
    specialty: ['특수체육', '행동발달', '언어치료', '인지치료', '발달치료'],
    credentials: ['소소쌤언어치료실 기관장'],
    rating: 5.0,
    reviews: 0,
    experience: '10년',
    availability: '연중무휴 (0세부터 19세 이상)',
    monthlyPrice: 0,
    hourlyPrice: 0,
    image: getExpertImage('이기훈') || '/api/placeholder/150/150',
    description: '특수체육 행동발달 전문가로 모든 발달 관련 상담이 가능합니다. 소소쌤언어치료실 기관장으로서 언어치료, 인지치료, 발달치료, 출산 전후 상담, 계획 성취 등 폭넓은 전문성을 보유하고 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담', '센터상담'],
    monthlyServices: [
      '맞춤형 발달 평가 및 상담',
      '특수체육 및 행동발달 프로그램',
      '언어치료 및 인지치료',
      '부모 교육 및 가정 지도',
      '24시간 긴급 상담 지원'
    ],
    portfolio: {
      cases: 0,
      successRate: 0,
      specializations: ['특수체육', '행동발달', '언어치료', '인지치료', '발달치료', '출산전후상담', '계획성취']
    },
    location: '전국',
    isOnline: true,
    responseTime: '평균 1시간 이내'
  },
  {
    id: '8',
    name: '김재민',
    specialty: ['언어치료'],
    credentials: ['언어재활사', 'AIHPRO 언어검사 검수자', '치료사'],
    rating: 5.0,
    reviews: 0,
    experience: '8년',
    availability: '평일 9-18시',
    monthlyPrice: 100000,
    hourlyPrice: 26000,
    image: getExpertImage('김재민') || '/api/placeholder/150/150',
    description: 'AIHPRO 언어검사 검수자로 언어치료 전문가입니다. 언어발달지연, 발음장애, 의사소통 문제를 전문적으로 치료합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담', '센터상담'],
    monthlyServices: [
      '주 2회 언어치료 (월 8회)',
      'AIHPRO 언어검사 및 평가',
      '발음 교정 프로그램',
      '부모 가정지도 교육',
      '언어발달 진전 리포트'
    ],
    portfolio: {
      cases: 250,
      successRate: 93,
      specializations: ['언어치료', '언어발달', '발음교정', 'AIHPRO언어검사']
    },
    location: '전국',
    isOnline: true,
    responseTime: '평균 2시간 이내'
  },
  {
    id: '9',
    name: '조대룡',
    specialty: ['성인지적장애', '청소년지적장애', '일상생활지도'],
    credentials: ['치료사', '일상생활지도 전문가', '특수교사출신'],
    rating: 5.0,
    reviews: 0,
    experience: '15년',
    availability: '평일 9-18시',
    monthlyPrice: 120000,
    hourlyPrice: 30000,
    image: getExpertImage('조대룡') || '/api/placeholder/150/150',
    description: '성인 및 청소년 지적장애인의 일상생활 지도 전문가입니다. 특수교사 출신으로 장애인의 자립생활과 사회적응을 위한 맞춤형 지도를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담', '센터상담'],
    monthlyServices: [
      '주 2회 일상생활 지도 (월 8회)',
      '자립생활 훈련 프로그램',
      '사회적응 교육',
      '가족 상담 및 교육',
      '개별화 지원 계획 수립'
    ],
    portfolio: {
      cases: 380,
      successRate: 95,
      specializations: ['성인지적장애', '청소년지적장애', '일상생활지도', '자립생활훈련', '사회적응']
    },
    location: '전국',
    isOnline: true,
    responseTime: '평균 1.5시간 이내'
  },
  {
    id: '10',
    name: '양희진',
    specialty: ['특수체육', '운동발달', '사회성'],
    credentials: ['특수체육치료사', '학사', '남'],
    rating: 4.7,
    reviews: 0,
    experience: '5년',
    availability: '초등~성인 대상 가능',
    monthlyPrice: 120000,
    hourlyPrice: 30000,
    image: getExpertImage('양희진') || '/api/placeholder/150/150',
    description: '특수체육전공자로서 운동발달 및 사회성 행동에 관한 상담 가능합니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '전화상담', '센터상담', '카톡상담'],
    monthlyServices: [
      '주 2회 특수체육 치료 (월 8회)',
      '운동발달 평가 및 프로그램',
      '사회성 행동 개선 훈련',
      '부모 상담 및 교육'
    ],
    portfolio: {
      cases: 150,
      successRate: 88,
      specializations: ['특수체육', '운동발달', '사회성훈련']
    },
    location: '서울',
    isOnline: true,
    responseTime: '평균 2시간 이내'
  },
  {
    id: '11',
    name: '이효진',
    specialty: ['언어치료', '심리상담', 'ABA치료'],
    credentials: ['언어치료사', '심리상담사', 'ABA치료사', '박사', '여'],
    rating: 5.0,
    reviews: 0,
    experience: '20년',
    availability: '전연령 대상 가능',
    monthlyPrice: 280000,
    hourlyPrice: 70000,
    image: getExpertImage('이효진') || '/api/placeholder/150/150',
    description: '20년 경력의 언어, 심리, ABA 전문가입니다. 박사 학위를 보유하고 있으며 전 연령대의 다양한 발달 문제에 대한 전문적인 치료를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '화상상담'],
    monthlyServices: [
      '주 2회 전문 치료 (월 8회)',
      '언어/심리/ABA 통합 평가',
      '개별화 치료 프로그램',
      '부모 교육 및 가정 지도',
      '진전 상황 월간 리포트'
    ],
    portfolio: {
      cases: 500,
      successRate: 95,
      specializations: ['언어치료', '심리상담', 'ABA치료', '발달평가']
    },
    location: '서울',
    isOnline: true,
    responseTime: '평균 1시간 이내'
  },
  {
    id: '12',
    name: '전우준',
    specialty: ['미술치료', '심리상담'],
    credentials: ['미술치료사', '심리상담사', '석사', '남'],
    rating: 4.6,
    reviews: 0,
    experience: '2년',
    availability: '유아~청소년 대상 가능',
    monthlyPrice: 240000,
    hourlyPrice: 60000,
    image: getExpertImage('전우준') || '/api/placeholder/150/150',
    description: '미술치료와 심리상담 전문가입니다. 유아부터 청소년까지 다양한 연령대의 정서적 문제와 심리적 어려움을 미술을 통해 치료합니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '센터상담'],
    monthlyServices: [
      '주 2회 미술치료 (월 8회)',
      '심리평가 및 상담',
      '정서발달 프로그램',
      '부모 상담 및 교육'
    ],
    portfolio: {
      cases: 80,
      successRate: 90,
      specializations: ['미술치료', '심리상담', '정서발달', '아동청소년상담']
    },
    location: '서울',
    isOnline: false,
    responseTime: '평균 3시간 이내'
  },
  {
    id: '13',
    name: '김지수',
    specialty: ['언어치료'],
    credentials: ['언어치료사', '석사', '여'],
    rating: 4.8,
    reviews: 0,
    experience: '4년',
    availability: '영유아~초등 대상 가능',
    monthlyPrice: 140000,
    hourlyPrice: 35000,
    image: getExpertImage('김지수') || '/api/placeholder/150/150',
    description: '성장하는 우리 아이의 소중한 시간이 헛되이지 않게 유익하고 재밌는 수업이 되도록 노력하겠습니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '화상상담'],
    monthlyServices: [
      '주 1회 언어치료 (월 4회)',
      '발음 교정 및 언어 자극',
      '부모 가정지도 교육',
      '언어발달 평가서 제공'
    ],
    portfolio: {
      cases: 120,
      successRate: 90,
      specializations: ['언어치료', '발음교정', '언어발달']
    },
    location: '서울',
    isOnline: true,
    responseTime: '평균 2시간 이내'
  },
  {
    id: '14',
    name: '이성우',
    specialty: ['운동재활', '물리치료', '작업치료'],
    credentials: ['물리치료사', '박사', '남'],
    rating: 5.0,
    reviews: 0,
    experience: '20년',
    availability: '전연령 대상 가능',
    monthlyPrice: 200000,
    hourlyPrice: 50000,
    image: getExpertImage('이성우') || '/api/placeholder/150/150',
    description: '20년 경력의 물리치료 전문가로 운동재활, 작업치료 분야의 박사학위를 보유하고 있습니다. 아동부터 성인까지 전 연령대의 신체 기능 회복과 재활을 위한 맞춤형 치료 프로그램을 제공합니다. 과학적 근거에 기반한 체계적인 치료로 최상의 재활 결과를 이끌어냅니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '화상상담', '센터상담'],
    monthlyServices: [
      '주 1회 물리치료 및 운동재활 (월 4회)',
      '개인별 맞춤 재활 운동 프로그램',
      '작업치료 및 일상생활 훈련',
      '재활 진전도 평가 및 리포트',
      '가정 내 운동 지도 및 상담'
    ],
    portfolio: {
      cases: 600,
      successRate: 96,
      specializations: ['운동재활', '물리치료', '작업치료', '신경재활', '근골격계재활']
    },
    location: '전국',
    isOnline: true,
    responseTime: '평균 1시간 이내'
  },
  {
    id: '15',
    name: '윤은민',
    specialty: ['언어치료', '인지상담', '비언어성지능검사'],
    credentials: ['언어재활사', '박사', '언어치료전문가', '여'],
    rating: 5.0,
    reviews: 0,
    experience: '다년',
    availability: '전연령 대상 가능',
    monthlyPrice: 240000,
    hourlyPrice: 60000,
    image: getExpertImage('윤은민') || '/api/placeholder/150/150',
    description: '언어치료 전문가이자 박사 학위 소지자로, 언어발달지연, 조음장애, 의사소통 문제를 전문적으로 다룹니다. 비언어성지능검사를 통한 정확한 평가와 인지상담을 통해 아동의 전반적인 발달을 지원합니다. 과학적 근거에 기반한 체계적인 언어치료 프로그램으로 최상의 결과를 제공합니다.',
    languages: ['한국어'],
    consultationTypes: ['대면상담', '화상상담', '센터상담'],
    monthlyServices: [
      '주 2회 언어치료 (월 8회)',
      '비언어성지능검사 및 평가',
      '인지상담 및 발달 지원',
      '언어발달 평가 리포트',
      '부모 교육 및 가정 지도'
    ],
    portfolio: {
      cases: 400,
      successRate: 94,
      specializations: ['언어치료', '인지상담', '비언어성지능검사', '조음장애', '언어발달지연']
    },
    location: '전국',
    isOnline: true,
    responseTime: '평균 1.5시간 이내'
  }
];


const ExpertHiring = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  
  // SEO 구조화된 데이터
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "전문가 고용 및 상담",
    "provider": {
      "@type": "Organization",
      "name": "AIHumanPro",
      "description": "전문가 매칭 및 상담 서비스"
    },
    "areaServed": "KR",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://aihpro.com/expert-hiring"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "KRW",
      "lowPrice": "85000",
      "highPrice": "135000"
    }
  };
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Expert[]>([]);
  
  // 제휴기관 필터 상태
  const [filteredInstitutions, setFilteredInstitutions] = useState(mockInstitutions);
  const [institutionSearchTerm, setInstitutionSearchTerm] = useState("");
  const [institutionTypeFilter, setInstitutionTypeFilter] = useState("all");
  const [voucherOnlyFilter, setVoucherOnlyFilter] = useState(false);
  const [homeServiceFilter, setHomeServiceFilter] = useState(false);

  // 커뮤니티 상태
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [anonymousNickname, setAnonymousNickname] = useState("");
  const [commentAnonymousNickname, setCommentAnonymousNickname] = useState("");
  const [showStoryShare, setShowStoryShare] = useState(false);
  const [storyRefreshTrigger, setStoryRefreshTrigger] = useState(0);

  // 즉시 상담 모달 상태
  const [quickConsultModalOpen, setQuickConsultModalOpen] = useState(false);
  const [selectedQuickExpert, setSelectedQuickExpert] = useState<any>(null);
  
  // 즉시 채팅 상태
  const [instantChatOpen, setInstantChatOpen] = useState(false);
  const [selectedChatExpert, setSelectedChatExpert] = useState<any>(null);

  // 실제 전문가 데이터 로드
  const loadExperts = async () => {
    try {
      const { data: dbExperts, error } = await supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error loading experts:', error);
      }

      let formattedExperts: Expert[] = [];
      
      if (dbExperts) {
        // 데이터베이스 형식을 기존 Expert 인터페이스에 맞게 변환
        formattedExperts = dbExperts.map(expert => ({
          id: expert.id,
          name: expert.full_name,
          specialty: expert.specializations || [],
          credentials: expert.certifications || [],
          rating: expert.average_rating || 4.5,
          reviews: expert.total_sessions || 0,
          experience: `${expert.years_experience}년`,
          availability: '평일 9-18시',
          monthlyPrice: expert.hourly_rate * 4, // 월 4회 기준
          hourlyPrice: expert.hourly_rate,
          image: getExpertImage(expert.full_name) || expert.profile_image_url || '/api/placeholder/150/150',
          description: expert.bio || '',
          languages: expert.languages || ['한국어'],
          consultationTypes: expert.consultation_methods || ['화상상담'],
          monthlyServices: [
            '주 1회 개별 상담 (월 4회)',
            '전문가 평가 및 리포트',
            '상담 진행 관리',
            '24시간 문의 지원'
          ],
          portfolio: {
            cases: expert.total_sessions || 0,
            successRate: 90,
            specializations: expert.specializations || []
          },
          location: '온라인',
          isOnline: expert.consultation_methods?.includes('화상상담') || true,
          responseTime: '평균 2시간 이내'
        }));
      }
      
      // mockExperts 중에서 DB에 없는 전문가만 추가
      // 먼저 src/data/mockExperts.ts의 데이터를 Expert 인터페이스에 맞게 변환
      const convertedMockExperts = mockExpertsData.map(expert => ({
        id: expert.id,
        name: expert.name.replace(' 치료사', '').replace(' 박사', '').replace(' 교수', ''),
        specialty: expert.categories || [],
        credentials: [expert.credential],
        rating: expert.rating,
        reviews: 0,
        experience: '경력 다년',
        availability: expert.availability_text || '평일 9-18시',
        monthlyPrice: expert.price_per_50 ? expert.price_per_50 * 4 : 0,
        hourlyPrice: expert.price_per_50 || 0,
        image: expert.photo_url || '/api/placeholder/150/150',
        description: expert.intro || '',
        languages: ['한국어'],
        consultationTypes: expert.online ? ['화상상담', '방문상담'] : ['방문상담'],
        monthlyServices: [
          '주 1회 개별 상담 (월 4회)',
          '전문가 평가 및 리포트',
          '상담 진행 관리',
          '24시간 문의 지원'
        ],
        portfolio: {
          cases: 0,
          successRate: 90,
          specializations: expert.categories || []
        },
        location: expert.region || '온라인',
        isOnline: expert.online || false,
        responseTime: '평균 2시간 이내'
      }));
      
      // 중복 제거: 이름이 같은 전문가는 하나만 남기기
      const allCombined = [...mockExperts, ...convertedMockExperts];
      const uniqueExperts = new Map();
      
      allCombined.forEach(expert => {
        if (!uniqueExperts.has(expert.name)) {
          uniqueExperts.set(expert.name, expert);
        }
      });
      
      const mockExpertsToAdd = Array.from(uniqueExperts.values()).filter(mock => 
        !formattedExperts.some(db => db.name === mock.name || db.name.includes(mock.name) || mock.name.includes(db.name))
      );
      
      // DB 전문가 + mock 전문가 결합
      const allExperts = [...formattedExperts, ...mockExpertsToAdd];
      
      // 특정 전문가 순서 정의
      const preferredOrder = ['이수석', '장호탁', '김선길', '이하연', '이기훈', '김재민', '조대룡'];
      
      // Sort experts: 1) 지정된 순서, 2) 프로필 사진 있는 사람, 3) 나머지
      allExperts.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a.name);
        const indexB = preferredOrder.indexOf(b.name);
        
        // 둘 다 우선순위 목록에 있는 경우, 순서대로 정렬
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // A만 우선순위 목록에 있으면 A를 앞으로
        if (indexA !== -1) return -1;
        
        // B만 우선순위 목록에 있으면 B를 앞으로
        if (indexB !== -1) return 1;
        
        // 둘 다 우선순위 목록에 없는 경우, 프로필 사진 유무로 정렬
        const hasImageA = a.image && !a.image.includes('placeholder');
        const hasImageB = b.image && !b.image.includes('placeholder');
        
        if (hasImageA && !hasImageB) return -1;
        if (!hasImageA && hasImageB) return 1;
        
        // 둘 다 이미지가 있거나 없으면 기존 순서 유지
        return 0;
      });
      
      setExperts(allExperts);
      setFilteredExperts(allExperts);
      console.log('Loaded experts (DB + Mock):', allExperts.length);
    } catch (error) {
      console.error('Error loading experts:', error);
      // 에러 발생 시 mockExperts만 사용
      setExperts(mockExperts);
      setFilteredExperts(mockExperts);
    }
  };

  // 컴포넌트 마운트 시 실제 데이터 로드
  useEffect(() => {
    loadExperts();
  }, []);

  // AI 추천 전문가 가져오기
  const getAIRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 최신 평가 결과 가져오기
        const { data: assessments } = await supabase
          .from('assessment_enhanced_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (assessments && assessments.length > 0) {
          const assessment = assessments[0];
          
          // expert-matcher 엣지 함수 호출
          const { data, error } = await supabase.functions.invoke('expert-matcher', {
            body: { 
              analysis: assessment.enhanced_analysis || '평가 분석 데이터가 없습니다.',
              ageGroup: assessment.assessment_type || 'adult',
              age: 25 // 기본 나이, 실제로는 프로필에서 가져와야 함
            }
          });

          if (error) {
            console.error('Expert matcher error:', error);
            toast.error('AI 추천을 가져오는 중 오류가 발생했습니다.');
            return;
          }

          if (data && data.experts) {
            console.log('AI matched experts:', data.experts);
            // Normalize AI response to match Expert interface
            const normalized = data.experts.map((e: any, idx: number): Expert => ({
              id: e.id || `ai_${idx}`,
              name: e.full_name || e.name || '이름 미상',
              specialty: Array.isArray(e.specializations)
                ? e.specializations
                : Array.isArray(e.specialty)
                  ? e.specialty
                  : typeof e.specializations === 'string'
                    ? e.specializations.split(/[,\s]+/).filter(Boolean)
                    : [],
              credentials: Array.isArray(e.credentials)
                ? e.credentials
                : e.credentials
                  ? [e.credentials]
                  : Array.isArray(e.certifications)
                    ? e.certifications
                    : [],
              rating: Number(e.rating) || Number(e.average_rating) || 4.7,
              reviews: Number(e.reviews) || Number(e.review_count) || Number(e.total_sessions) || 0,
              experience: e.experience || (e.years_experience ? `${e.years_experience}년` : '경력 미상'),
              availability: e.availability || '평일 9-18시',
              monthlyPrice: Number(e.monthlyPrice) || (Number(e.hourlyPrice || e.hourly_rate) ? Number(e.hourlyPrice || e.hourly_rate) * 4 : 100000),
              hourlyPrice: Number(e.hourlyPrice || e.hourly_rate) || 25000,
              image: e.image || e.profile_image_url || '/api/placeholder/150/150',
              description: e.description || e.bio || '',
              languages: Array.isArray(e.languages) ? e.languages : ['한국어'],
              consultationTypes: Array.isArray(e.consultationTypes)
                ? e.consultationTypes
                : Array.isArray(e.consultation_methods)
                  ? e.consultation_methods
                  : ['화상상담'],
              monthlyServices: Array.isArray(e.monthlyServices) && e.monthlyServices.length > 0
                ? e.monthlyServices
                : [
                    '주 1회 개별 상담 (월 4회)',
                    '전문가 평가 및 리포트',
                    '상담 진행 관리',
                    '24시간 문의 지원'
                  ],
              portfolio: {
                cases: Number(e.portfolio?.cases || e.total_sessions) || 0,
                successRate: Number(e.portfolio?.successRate) || 90,
                specializations: Array.isArray(e.portfolio?.specializations) ? e.portfolio.specializations : []
              },
              location: e.location || '온라인',
              isOnline: typeof e.isOnline === 'boolean' ? e.isOnline : true,
              responseTime: e.responseTime || '평균 2시간 이내',
              aiMatchScore: Number(e.aiMatchScore || e.confidence) || undefined
            }));

            setAiRecommendations(normalized);
            toast.success(`${normalized.length}명의 전문가가 AI 분석을 통해 추천되었습니다.`);
          } else {
            // 실제 데이터베이스에서 전문가 목록 가져오기
            const { data: dbExperts } = await supabase
              .from('experts')
              .select('*')
              .eq('is_verified', true)
              .eq('is_available', true)
              .limit(3);
            
            if (dbExperts) {
              const formattedExperts = dbExperts.map(expert => ({
                id: expert.id,
                name: expert.full_name,
                specialty: expert.specializations,
                credentials: expert.certifications || [],
                rating: expert.average_rating || 4.5,
                reviews: expert.total_sessions || 0,
                experience: `${expert.years_experience}년`,
                availability: '평일 9-18시',
                monthlyPrice: expert.hourly_rate * 4, // 월 4회 기준
                hourlyPrice: expert.hourly_rate,
                image: expert.profile_image_url || '/api/placeholder/150/150',
                description: expert.bio,
                languages: expert.languages || ['한국어'],
                consultationTypes: expert.consultation_methods || ['화상상담'],
                monthlyServices: [
                  '주 1회 개별 상담 (월 4회)',
                  '전문가 평가 및 리포트',
                  '상담 진행 관리',
                  '24시간 문의 지원'
                ],
                portfolio: {
                  cases: expert.total_sessions || 0,
                  successRate: 90,
                  specializations: expert.specializations || []
                },
                location: '온라인',
                isOnline: expert.consultation_methods?.includes('화상상담') || true,
                responseTime: '평균 2시간 이내',
                aiMatchScore: 85
              }));
              
              setAiRecommendations(formattedExperts);
              toast.success(`${formattedExperts.length}명의 전문가를 추천합니다.`);
            }
          }
        } else {
          toast.info('먼저 평가를 완료하시면 더 정확한 AI 추천을 받을 수 있습니다.');
        }
      }
    } catch (error) {
      console.error('AI 추천 오류:', error);
      toast.error('AI 추천을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 성장 스토리 공유 완료 핸들러
  const handleStoryShared = () => {
    setStoryRefreshTrigger(prev => prev + 1);
    setShowStoryShare(false);
  };

  // 커뮤니티 게시물 로드
  const loadCommunityPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 예시 데이터 추가 (실제 데이터가 없을 때)
      const mockPosts = posts && posts.length > 0 ? posts : [
        {
          id: 'mock-1',
          title: '7살 아이 언어발달 고민',
          content: '안녕하세요. 7살 아이 엄마인데요, 아직도 발음이 부정확하고 문장을 제대로 만들지 못해서 걱정이 많아요. 언어치료를 받아야 할까요? 어떤 전문가를 만나야 할지 조언 부탁드려요.',
          user_id: 'mock-user-1',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 12,
          comments_count: 8,
          is_anonymous: true,
          tags: ['은지맘']
        },
        {
          id: 'mock-2',
          title: '',
          content: '우리 아이가 ADHD 진단을 받았어요. 처음엔 너무 충격이었는데, 전문가 선생님과 상담하면서 많이 달라졌어요. 아이도 훨씬 안정적이고 집중력도 좋아졌습니다. 혹시 비슷한 고민 있으신 분들, 너무 걱정하지 마세요!',
          user_id: 'mock-user-2',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 25,
          comments_count: 15,
          is_anonymous: true,
          tags: ['민수엄마']
        },
        {
          id: 'mock-3',
          title: '청소년 자녀와의 소통',
          content: '중학생 아들과 대화가 안 되서 고민이에요. 학업 스트레스도 심하고 집에서도 계속 짜증내고... 가족상담을 받아볼까 하는데 효과가 있을까요? 경험 있으신 분들 조언 부탁드려요.',
          user_id: 'mock-user-3',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 18,
          comments_count: 12,
          is_anonymous: true,
          tags: ['수진']
        },
        {
          id: 'mock-4',
          title: '',
          content: '발달센터에서 6개월 치료받고 있는데 정말 많이 달라졌어요! 처음엔 반신반의했는데 선생님들이 너무 전문적이시고 아이 개별 특성을 잘 파악해서 맞춤 치료해주시네요. 투자한 시간과 비용이 아깝지 않아요.',
          user_id: 'mock-user-4',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 31,
          comments_count: 9,
          is_anonymous: true,
          tags: ['현주']
        },
        {
          id: 'mock-5',
          title: '성인 상담 후기',
          content: '직장 스트레스와 대인관계로 힘들어서 상담받기 시작했어요. 처음엔 부끄럽고 망설여졌는데, 상담사 선생님이 정말 잘 들어주시고 구체적인 해결방법도 제시해주셔서 많은 도움이 되고 있어요.',
          user_id: 'mock-user-5',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 22,
          comments_count: 6,
          is_anonymous: true,
          tags: ['정호']
        },
        {
          id: 'mock-6',
          title: '자폐스펙트럼 아이 양육',
          content: '5살 아들이 자폐스펙트럼 진단받았어요. 처음엔 앞이 캄캄했는데 ABA 치료와 언어치료를 병행하면서 아이가 조금씩 변화하고 있어요. 같은 상황 계신 분들과 정보 공유하고 싶어요.',
          user_id: 'mock-user-6',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 19,
          comments_count: 14,
          is_anonymous: true,
          tags: ['지영맘']
        },
        {
          id: 'mock-7',
          title: '',
          content: '우울증으로 힘들어하던 시기에 이 플랫폼을 통해 좋은 상담사를 만나게 되었어요. AI 추천이 정말 정확하더라구요. 지금은 많이 회복되어서 일상생활이 가능해졌습니다. 도움을 요청하는 것이 부끄러운 일이 아니라는 걸 깨달았어요.',
          user_id: 'mock-user-7',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 45,
          comments_count: 18,
          is_anonymous: true,
          tags: ['서연']
        },
        {
          id: 'mock-8',
          title: '부모교육 프로그램 추천',
          content: '아이 양육하면서 제가 먼저 배워야겠다 싶어서 부모교육 프로그램 찾고 있어요. 혹시 좋은 곳 아시는 분 있나요? 온라인으로도 가능한지 궁금해요.',
          user_id: 'mock-user-8',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 16,
          comments_count: 11,
          is_anonymous: true,
          tags: ['혜진']
        },
        {
          id: 'mock-9',
          title: '',
          content: '제휴기관 바우처 사용해서 치료받고 있는데 정말 만족해요. 경제적 부담도 줄고 전문적인 서비스도 받을 수 있어서 좋네요. 아직 망설이고 계신 분들께 적극 추천드려요!',
          user_id: 'mock-user-9',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 28,
          comments_count: 7,
          is_anonymous: true,
          tags: ['태준맘']
        },
        {
          id: 'mock-10',
          title: '가족치료 경험담',
          content: '온 가족이 함께 상담받기 시작했어요. 처음엔 어색했는데 이제는 서로 마음을 열고 대화할 수 있게 되었습니다. 문제는 개인의 문제가 아니라 가족 전체가 함께 해결해야 한다는 걸 배웠어요.',
          user_id: 'mock-user-10',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 33,
          comments_count: 20,
          is_anonymous: true,
          tags: ['가족의힘']
        },
        {
          id: 'mock-11',
          title: '언어치료 시작했어요',
          content: '우리 아이 3살인데 말이 늦어서 걱정했는데요, 여기서 전문가 추천받아서 언어치료 시작했어요! 아직 한 달밖에 안됐는데 벌써 단어 수가 늘어나는게 느껴져요 ㅠㅠ 진작 시작할걸 그랬어요',
          user_id: 'mock-user-11',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 12,
          comments_count: 8,
          is_anonymous: true,
          tags: ['희망맘']
        },
        {
          id: 'mock-12',
          title: '',
          content: '아이 ADHD로 힘들어하시는 분들한테 꼭 말씀드리고 싶어요. 저희도 처음엔 많이 힘들었는데 전문가 상담 받으면서 아이를 이해하는 방법을 배웠고, 지금은 많이 좋아졌어요. 포기하지 마시고 꼭 도움 받으세요!',
          user_id: 'mock-user-12',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 27,
          comments_count: 15,
          is_anonymous: true,
          tags: ['민준맘']
        },
        {
          id: 'mock-13',
          title: '감각통합치료 후기',
          content: '감각통합치료 받으면서 아이가 정말 많이 변했어요. 예전엔 옷 입는것도 싫어하고 특정 소리에 민감하게 반응했는데, 지금은 일상생활이 훨씬 편해졌어요. 같은 고민 있으신 분들 상담 꼭 받아보세요~',
          user_id: 'mock-user-13',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 19,
          comments_count: 11,
          is_anonymous: true,
          tags: ['서준이엄마']
        },
        {
          id: 'mock-14',
          title: '심리상담 추천합니다',
          content: '애 키우면서 제 마음도 많이 힘들었거든요.. 근데 상담 받으면서 저 자신도 돌봐야 아이도 잘 돌볼 수 있다는 걸 알게 됐어요. 엄마들 자신을 위한 시간도 꼭 가지세요 ㅎㅎ',
          user_id: 'mock-user-14',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: 35,
          comments_count: 23,
          is_anonymous: true,
          tags: ['지우맘']
        }
      ];
      
      setCommunityPosts(mockPosts);
    } catch (error) {
      console.error('커뮤니티 게시물 로드 오류:', error);
    }
  };

  // 게시물 작성
  const createPost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      if (!newPostContent.trim()) {
        toast.error('내용을 입력해주세요.');
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: newPostTitle || null,
          content: newPostContent,
          is_anonymous: true,
          is_public: true,
          tags: anonymousNickname ? [anonymousNickname] : []
        })
        .select()
        .single();

      if (error) throw error;

      setCommunityPosts(prev => [data, ...prev]);
      setNewPostContent("");
      setNewPostTitle("");
      setAnonymousNickname("");
      setIsPostDialogOpen(false);
      toast.success('게시물이 작성되었습니다!');
    } catch (error) {
      console.error('게시물 작성 오류:', error);
      toast.error('게시물 작성 중 오류가 발생했습니다.');
    }
  };

  // 게시물 삭제
  const deletePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCommunityPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('게시물이 삭제되었습니다.');
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      toast.error('게시물 삭제 중 오류가 발생했습니다.');
    }
  };

  // 좋아요 토글
  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      // 이미 좋아요를 눌렀는지 확인
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // 좋아요 취소
        await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // 좋아요 추가
        await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // 게시물 목록 새로고침
      loadCommunityPosts();
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
    }
  };

  // 댓글 로드
  const loadComments = async (postId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: commentsData || [] }));
    } catch (error) {
      console.error('댓글 로드 오류:', error);
    }
  };

  // 댓글 작성
  const createComment = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      if (!newComment.trim()) {
        toast.error('댓글 내용을 입력해주세요.');
        return;
      }

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
          is_anonymous: true
        })
        .select()
        .single();

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), { ...data, anonymous_nickname: commentAnonymousNickname }]
      }));
      setNewComment("");
      setCommentAnonymousNickname("");
      
      // 게시물의 댓글 수 업데이트 (트리거로 자동 처리됨)
      loadCommunityPosts();
      toast.success('댓글이 작성되었습니다!');
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      toast.error('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    getAIRecommendations();
    loadCommunityPosts();
  }, []);

  // 전문가 필터링 로직
  useEffect(() => {
    let filtered = experts;

    if (searchTerm) {
      filtered = filtered.filter(expert =>
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        expert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialtyFilter && specialtyFilter !== "all") {
      filtered = filtered.filter(expert =>
        expert.specialty.some(s => s.includes(specialtyFilter))
      );
    }

    if (priceFilter && priceFilter !== "all") {
      if (priceFilter === "low") {
        filtered = filtered.filter(expert => expert.monthlyPrice <= 100000);
      } else if (priceFilter === "medium") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 100000 && expert.monthlyPrice <= 180000);
      } else if (priceFilter === "high") {
        filtered = filtered.filter(expert => expert.monthlyPrice > 180000);
      }
    }

    if (locationFilter && locationFilter !== "all") {
      if (locationFilter === "online") {
        filtered = filtered.filter(expert => expert.isOnline);
      } else {
        filtered = filtered.filter(expert => expert.location.includes(locationFilter));
      }
    }

    setFilteredExperts(filtered);
  }, [searchTerm, specialtyFilter, priceFilter, locationFilter, experts]);

  // 제휴기관 필터링 로직
  useEffect(() => {
    let filtered = mockInstitutions;

    if (institutionSearchTerm) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
        institution.description.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
        institution.services_offered.some(service => 
          service.toLowerCase().includes(institutionSearchTerm.toLowerCase())
        )
      );
    }

    if (institutionTypeFilter && institutionTypeFilter !== "all") {
      filtered = filtered.filter(institution =>
        institution.institution_type === institutionTypeFilter
      );
    }

    if (voucherOnlyFilter) {
      filtered = filtered.filter(institution =>
        institution.voucher_types && institution.voucher_types.length > 0
      );
    }

    if (homeServiceFilter) {
      filtered = filtered.filter(institution =>
        institution.services_offered && institution.services_offered.includes('방문서비스')
      );
    }

    setFilteredInstitutions(filtered);
  }, [institutionSearchTerm, institutionTypeFilter, voucherOnlyFilter, homeServiceFilter]);

  const handleHireExpert = (expertId: string) => {
    navigate(`/expert-contract/${expertId}`);
  };

  // 즉시 채팅 시작 (온라인 전문가용)
  const handleInstantChat = (expert: Expert | any) => {
    setSelectedChatExpert(expert);
    setInstantChatOpen(true);
  };

  const handleConsultExpert = async (expertIdParam: string) => {
    try {
      // 로그인 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      // 전문가 정보 조회
      const { data: dbExpert, error: expertErr } = await supabase
        .from('experts')
        .select('*')
        .eq('id', expertIdParam)
        .maybeSingle();

      if (expertErr) {
        console.error('전문가 조회 오류:', expertErr);
        toast.error('전문가 정보를 불러오지 못했습니다.');
        return;
      }
      if (!dbExpert) {
        toast.error('전문가를 찾을 수 없습니다.');
        return;
      }

      // 즉시 상담 모달 열기 (카카오톡 링크 무시)
      setSelectedQuickExpert(dbExpert);
      setQuickConsultModalOpen(true);
    } catch (error) {
      console.error('상담 시작 오류:', error);
      toast.error('상담 시작 중 오류가 발생했습니다.');
    }
  };

  const handleInstitutionBooking = (institutionName: string) => {
    // 로그인 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      // BookingManagement 페이지로 이동하면서 기관 정보 전달
      toast.success(`${institutionName} 예약 페이지로 이동합니다.`);
      navigate('/booking-management', { 
        state: { 
          institutionName: institutionName,
          autoOpenBooking: true 
        } 
      });
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <>
      <Helmet>
        <title>전문가 고용 - AIHumanPro | 검증된 전문가 매칭 서비스</title>
        <meta name="description" content="40+ 제휴기관의 검증된 전문가와 연결하세요. AI 매칭으로 최적의 전문가를 찾아 심리상담, 발달평가, 언어치료 등 전문 서비스를 받으실 수 있습니다." />
        <meta name="keywords" content="전문가 고용, 전문가 매칭, AI 매칭, 심리상담사, 발달전문가, 언어치료사, 전문상담" />
        <link rel="canonical" href="https://aihpro.com/expert-hiring" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="전문가 고용 - AIHumanPro" />
        <meta property="og:description" content="40+ 제휴기관의 검증된 전문가와 연결. AI 매칭으로 최적의 전문가 찾기" />
        <meta property="og:url" content="https://aihpro.com/expert-hiring" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        {/* 모던 헤더 섹션 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 mb-8">
          {/* 배경 효과 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative px-6 py-8 md:px-10 md:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <Users className="w-7 h-7 text-purple-300" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">AIHPRO</span> 전문가 & 제휴기관
                  </h1>
                  <p className="text-sm md:text-base text-white/60 mt-2 max-w-lg">
                    개인전문가부터 제휴기관까지, 당신에게 최적의 매칭을 제공합니다
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.open('https://naver.me/GPl0x4ry', '_blank')}
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                전문가 지원
              </Button>
            </div>
            
            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4 md:gap-8 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">129</div>
                <div className="text-xs md:text-sm text-white/50 mt-1">인증 전문가</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">40+</div>
                <div className="text-xs md:text-sm text-white/50 mt-1">제휴 기관</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-300 to-pink-100 bg-clip-text text-transparent">95.8%</div>
                <div className="text-xs md:text-sm text-white/50 mt-1">만족도</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">247</div>
                <div className="text-xs md:text-sm text-white/50 mt-1">성공 매칭</div>
              </div>
            </div>
          </div>
        </div>

        {/* 해외 거주 한국인을 위한 배너 */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-500/30">
          <CardContent className="py-5 md:py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-lg flex items-center gap-2 flex-wrap">
                    🌏 해외 거주 한국인을 위한 전문 상담
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300 text-[10px] md:text-xs">해외결제 OK</Badge>
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Visa/Mastercard 해외카드 결제 가능 • 시차 고려 예약 • 한국 전문가와 화상상담
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => window.open('https://pf.kakao.com/_CYGdn', '_blank')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white whitespace-nowrap text-xs md:text-sm"
              >
                해외 상담 신청
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 상담 정보 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
          <Card className="bg-muted/50">
            <CardContent className="py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">상담 시간</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">30분 / 60분 선택</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">상담 방식</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">화상/전화/채팅</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">토큰 사용</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">30분 = 10토큰</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="py-3 md:py-4 flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">세션 수</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">월 1~4회 제공</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* CTA 카드 섹션 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* 제휴기관 CTA */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 md:p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => {
              const tabsList = document.querySelector('[value="institutions"]') as HTMLElement;
              if (tabsList) tabsList.click();
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs">
                  40+ 인증기관
                </Badge>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                제휴기관 상담예약
              </h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                바우처 지원과 함께 전문적인 상담 서비스
              </p>
              
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                바우처 지원 가능
              </div>
              
              <Button 
                size="sm"
                className="w-full mt-5 bg-white text-purple-600 hover:bg-white/90 font-semibold rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                예약하기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* 개인전문가 CTA */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-6 md:p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            onClick={() => {
              const tabsList = document.querySelector('[value="experts"]') as HTMLElement;
              if (tabsList) tabsList.click();
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs">
                  129명 전문가
                </Badge>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                개인전문가 즉시상담
              </h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                검증된 전문가와 맞춤형 1:1 상담
              </p>
              
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                평균 응답시간 2시간
              </div>
              
              <Button 
                size="sm"
                className="w-full mt-5 bg-white text-blue-600 hover:bg-white/90 font-semibold rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                즉시 상담
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="experts" className="space-y-6">
          <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-2xl grid grid-cols-4 gap-1">
            <TabsTrigger 
              value="experts" 
              className="rounded-xl py-2.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              전문가
            </TabsTrigger>
            <TabsTrigger 
              value="institutions" 
              className="rounded-xl py-2.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              제휴기관
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="rounded-xl py-2.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              커뮤니티
            </TabsTrigger>
            <TabsTrigger 
              value="ai-matching" 
              className="rounded-xl py-2.5 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <span className="flex items-center gap-1">
                AI매칭
                <span className="hidden md:inline-block bg-purple-500/10 text-purple-600 text-[10px] px-1.5 py-0.5 rounded-full">New</span>
              </span>
            </TabsTrigger>
          </TabsList>

          {/* 커뮤니티 탭 */}
          <TabsContent value="community" className="space-y-6">
            {/* 게시물 작성 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">커뮤니티</h3>
                  <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        게시물 작성
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>새 게시물 작성</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="제목 (선택사항)"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                        <Input
                          placeholder="익명 닉네임 (선택사항)"
                          value={anonymousNickname}
                          onChange={(e) => setAnonymousNickname(e.target.value)}
                        />
                        <Textarea
                          placeholder="고민이나 성공사례, 평소 궁금했던 질문을 전문가에게 익명으로 공유해보세요..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={6}
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsPostDialogOpen(false)}
                          >
                            취소
                          </Button>
                          <Button onClick={createPost}>
                            게시하기
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  고민이나 성공사례, 평소 궁금했던 질문을 전문가에게 익명으로 공유해보세요. 
                  다른 부모님들의 경험담도 들어볼 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* 게시물 목록 */}
            <div className="space-y-4">
              {communityPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      아직 게시물이 없습니다
                    </h3>
                    <p className="text-muted-foreground">
                      첫 번째 게시물을 작성해보세요!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                communityPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                           <div>
                            <p className="font-medium text-sm">
                              {post.tags && post.tags.length > 0 ? post.tags[0] : '익명 사용자'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), { 
                                addSuffix: true,
                                locale: ko 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 z-50 border shadow-lg">
                              <DropdownMenuItem 
                                onClick={() => deletePost(post.id)}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제하기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {post.title && (
                        <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      )}
                      
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {post.likes_count || 0}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              loadComments(post.id);
                            }}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {post.comments_count || 0}
                          </Button>
                        </div>
                      </div>

                      {/* 댓글 섹션 */}
                      {selectedPost?.id === post.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="space-y-3 mb-4">
                            {(comments[post.id] || []).map((comment: any) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-100 text-gray-600">
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="font-medium text-sm mb-1">
                                        {comment.anonymous_nickname || '익명 사용자'}
                                      </p>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(comment.created_at), { 
                                      addSuffix: true,
                                      locale: ko 
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="space-y-2">
                            <Input
                              placeholder="익명 닉네임 (선택사항)"
                              value={commentAnonymousNickname}
                              onChange={(e) => setCommentAnonymousNickname(e.target.value)}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="댓글을 입력하세요..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    createComment(post.id);
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => createComment(post.id)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* AI 추천 전문가 탭 */}
          <TabsContent value="ai-matching" className="space-y-6">
            {/* AI 매칭 프로세스 안내 */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 매칭을 위한 정보 수집</h2>
                  <p className="text-gray-600">먼저 검사를 받아보세요. AI가 검사 결과를 바탕으로 최적의 전문가를 추천해드립니다.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">1. 평가/검사 실시</h3>
                    <p className="text-sm text-gray-600">온라인 맞춤형 검사를 실시하고 기본적인 정보를 수집합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">2. AI 분석 및 매칭</h3>
                    <p className="text-sm text-gray-600">100% 데이터 기반의 분석으로 최적의 전문가를 추천합니다</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">3. 맞춤형 추천</h3>
                    <p className="text-sm text-gray-600">가장 적합한 TOP 3 전문가를 매칭율과 함께 추천해드립니다</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button 
                    onClick={() => navigate('/assessment')}
                    className="gap-2"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                    검사 받으러 가기
                  </Button>
                  <Button 
                    onClick={getAIRecommendations}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        AI 분석 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        AI 매칭 시작하기
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm sm:text-base">AI가 최적의 전문가를 찾고 있습니다...</p>
              </Card>
            ) : aiRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecommendations.map((expert) => (
                  <Card key={expert.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-md">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mx-0">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm sm:text-lg font-bold">
                            {expert.name[0]}
                          </AvatarFallback>
                        </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2 flex-wrap">
                <h4 className="font-bold text-base sm:text-lg text-gray-800">{expert.name} 에이전트</h4>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5">
                  <Award className="w-3 h-3 mr-1" />
                  기관장
                </Badge>
                            {expert.aiMatchScore && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                매칭도 {expert.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-sm">{expert.rating}</span>
                            </div>
                            {expert.aiMatchScore && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                                매칭도 {expert.aiMatchScore}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 text-center sm:text-left line-clamp-2">
                        {Array.isArray(expert.specialty) ? expert.specialty.join(", ") : expert.specialty}
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleConsultExpert(expert.id)}
                          className="w-full bg-primary hover:bg-primary/90 text-sm"
                        >
                          즉시 상담하기
                        </Button>
                        <Button 
                          onClick={() => handleHireExpert(expert.id)}
                          variant="outline" 
                          className="w-full"
                        >
                          월간 계약하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">AI 매칭을 위한 정보 수집</h3>
                <p className="text-muted-foreground mb-4">
                  먼저 검사를 받아보세요. AI가 검사 결과를 바탕으로 최적의 전문가를 추천해드립니다.
                </p>
                <Button onClick={() => navigate('/assessment')}>
                  검사 받으러 가기
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* 개인 전문가 탭 */}
          <TabsContent value="experts" className="space-y-6">
            {/* 검색 및 필터 */}
            <Card className="p-6 bg-white shadow-sm">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="전문가 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="전문 분야" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="아동발달">아동발달</SelectItem>
                    <SelectItem value="언어치료">언어치료</SelectItem>
                    <SelectItem value="심리상담">심리상담</SelectItem>
                    <SelectItem value="행동분석">행동분석</SelectItem>
                    <SelectItem value="한의사">한의사</SelectItem>
                    <SelectItem value="음악치료">음악치료</SelectItem>
                    <SelectItem value="놀이치료">놀이치료</SelectItem>
                    <SelectItem value="감각통합">감각통합</SelectItem>
                    <SelectItem value="운동재활">운동재활</SelectItem>
                    <SelectItem value="행동치료">행동치료</SelectItem>
                    <SelectItem value="발달재활">발달재활</SelectItem>
                    <SelectItem value="약물관련">약물관련</SelectItem>
                    <SelectItem value="ABA치료">ABA치료</SelectItem>
                    <SelectItem value="전문의사">전문의사</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="가격대" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="low">15만원 이하</SelectItem>
                    <SelectItem value="medium">15-25만원</SelectItem>
                    <SelectItem value="high">25만원 이상</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="지역" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="online">온라인</SelectItem>
                    <SelectItem value="서울">서울</SelectItem>
                    <SelectItem value="경기">경기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* 전문가 목록 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert) => (
                <Card key={expert.id} className={`hover:shadow-lg transition-all duration-300 border-none shadow-md ${expert.isOnline ? 'ring-2 ring-green-400/50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={expert.image} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg font-bold">
                            {expert.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {expert.isOnline && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </span>
                        )}
                      </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-lg text-gray-800">{expert.name} 에이전트</h4>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5">
                  <Award className="w-3 h-3 mr-1" />
                  기관장
                </Badge>
              </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{expert.rating}</span>
                          <span className="text-sm text-muted-foreground">({expert.reviews})</span>
                        </div>
                        {expert.isOnline && (
                          <Badge className="mt-1 bg-green-100 text-green-700 text-xs">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                            온라인
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex flex-wrap gap-1">
                        {expert.specialty.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{expert.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>경력 {expert.experience}</span>
                        <span>월 {formatPrice(expert.monthlyPrice)}원</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {expert.isOnline ? (
                        <Button 
                          onClick={() => handleInstantChat(expert)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          즉시 채팅하기
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleConsultExpert(expert.id)}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          상담 신청하기
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleHireExpert(expert.id)}
                        variant="outline" 
                        className="w-full"
                      >
                        월간 계약하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 제휴기관 탭 */}
          <TabsContent value="institutions" className="space-y-6">
            {/* 제휴기관 검색 및 필터 */}
            <Card className="p-6 bg-white shadow-sm">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="기관명, 지역, 서비스 검색..."
                    value={institutionSearchTerm}
                    onChange={(e) => setInstitutionSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={institutionTypeFilter} onValueChange={setInstitutionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="기관 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="development_center">발달센터</SelectItem>
                    <SelectItem value="medical_center">의료기관</SelectItem>
                    <SelectItem value="counseling_center">상담센터</SelectItem>
                    <SelectItem value="oriental_clinic">한의원</SelectItem>
                    <SelectItem value="day_activity_center">주간활동센터</SelectItem>
                    <SelectItem value="after_school_center">방과후활동센터</SelectItem>
                    <SelectItem value="day_care_center">주간보호센터</SelectItem>
                    <SelectItem value="welfare_center">복지관</SelectItem>
                    <SelectItem value="nursing_home">요양원</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2">
                    <Shield className="w-4 h-4 mr-2" />
                    AIHPRO 인증전문기관
                  </Badge>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <Badge className="bg-blue-100 text-blue-800 shrink-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    바우처
                  </Badge>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voucherOnlyFilter}
                      onChange={(e) => setVoucherOnlyFilter(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-800">지원기관만</span>
                  </label>
                </div>
              </div>
              
              
              {/* 필터 결과 표시 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span>총 {filteredInstitutions.length}개 제휴기관</span>
                </div>
                {(institutionSearchTerm || institutionTypeFilter !== "all" || voucherOnlyFilter || homeServiceFilter) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setInstitutionSearchTerm("");
                      setInstitutionTypeFilter("all");
                      setVoucherOnlyFilter(false);
                      setHomeServiceFilter(false);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    필터 초기화
                  </Button>
                )}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution) => (
                <Card 
                  key={institution.id} 
                  className={`hover:shadow-lg transition-all duration-300 border-none shadow-md ${
                    institution.partnership_status === 'premium' 
                      ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50 border-2 border-amber-300 ring-2 ring-amber-200' 
                      : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${
                        institution.partnership_status === 'premium' 
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                          : 'bg-purple-100'
                        } p-3 rounded-lg shrink-0`}>
                        <Building className={`w-8 h-8 ${
                          institution.partnership_status === 'premium' 
                            ? 'text-white' 
                            : 'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {institution.partnership_status === 'premium' && (
                              <Crown className="w-4 h-4 text-amber-500" />
                            )}
                            <h4 className="font-semibold text-lg text-gray-800 truncate">{institution.name}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{institution.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            전문가 {institution.total_experts}명
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{institution.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {institution.services_offered.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {institution.services_offered.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{institution.services_offered.length - 3}
                          </Badge>
                        )}
                      </div>
                      {institution.voucher_types && institution.voucher_types.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            바우처 지원
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className={`w-full text-white ${
                          institution.partnership_status === 'premium' 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        onClick={() => handleInstitutionBooking(institution.name)}
                      >
                        상담 예약하기
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`w-full ${
                          institution.partnership_status === 'premium' 
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-50' 
                            : ''
                        }`}
                        onClick={() => {
                          // 네이버 지도에서 기관명 검색
                          const searchQuery = encodeURIComponent(institution.name);
                          window.open(`https://map.naver.com/v5/search/${searchQuery}`, '_blank');
                        }}
                      >
                        기관 정보 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI 매칭 탭 */}
          <TabsContent value="ai-matching" className="space-y-6">
            {/* AI 매칭 프로세스 설명 */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI 매칭을 위한 정보 수집</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    먼저 검사를 받아보세요. AI가 검사 결과를 바탕으로 최적의 전문가를 추천해드립니다.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. 평가/검사 실시</h4>
                    <p className="text-sm text-muted-foreground">
                      연령대별 발달평가나 심리검사를 통해 현재 상태를 정확히 파악합니다
                    </p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. AI 분석 및 매칭</h4>
                    <p className="text-sm text-muted-foreground">
                      100+ 데이터 포인트 분석으로 전문가 평점, 경력, 전문분야 등을 종합 매칭
                    </p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. 맞춤형 추천</h4>
                    <p className="text-sm text-muted-foreground">
                      가장 적합한 TOP 3 전문가를 매칭 점수와 함께 추천해드립니다
                    </p>
                  </div>
                </div>
                
                {/* 매칭 진행률 미션 */}
                <Card className="bg-white/80 backdrop-blur-sm border-primary/30 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Medal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">매칭 미션 완료하기</h4>
                          <p className="text-sm text-muted-foreground">단계별로 완료하여 최적의 전문가를 찾아보세요!</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                        35% 완료
                      </Badge>
                    </div>
                    
                    {/* 진행률 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
                    </div>
                    
                    {/* 미션 단계들 */}
                    <div className="space-y-4">
                      {/* 완료된 미션 */}
                      <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <span className="font-medium text-green-800">계정 생성</span>
                          <p className="text-sm text-green-600">AIHPRO 계정을 성공적으로 생성했습니다</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">완료</Badge>
                      </div>
                      
                      {/* 현재 미션 */}
                      <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200 ring-2 ring-purple-300">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-purple-800">평가/검사 완료</span>
                          <p className="text-sm text-purple-600">나에게 맞는 전문가 찾기 위한 첫 번째 단계입니다</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700">진행중</Badge>
                          <span className="text-sm font-medium text-purple-600">+50점</span>
                        </div>
                      </div>
                      
                      {/* 미완료 미션들 */}
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">AI 매칭 결과 확인</span>
                          <p className="text-sm text-gray-500">AI가 추천하는 전문가 3명을 확인해보세요</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-gray-300 text-gray-500">대기중</Badge>
                          <span className="text-sm font-medium text-gray-500">+30점</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-700">전문가와 첫 상담</span>
                          <p className="text-sm text-gray-500">추천받은 전문가와 실제 상담을 시작해보세요</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-gray-300 text-gray-500">대기중</Badge>
                          <span className="text-sm font-medium text-gray-500">+100점</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                    onClick={() => navigate('/assessment')}
                  >
                    <Target className="w-5 h-5 mr-2" />
                    미션 계속하기 - 검사 받으러 가기
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    검사 완료 시 <span className="font-medium text-purple-600">50 매칭포인트</span>를 획득합니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI 매칭 점수 시스템 설명 */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">스마트 매칭 시스템</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">매칭 점수 계산 요소</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">전문분야 일치도</span>
                        <span className="font-medium text-primary">30점</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">전문가 평점</span>
                        <span className="font-medium text-blue-600">20점</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">현재 시간 가능성</span>
                        <span className="font-medium text-green-600">20점</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">경력 년수</span>
                        <span className="font-medium text-purple-600">20점</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">상담방식 일치</span>
                        <span className="font-medium text-orange-600">15점</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">매칭 정확도</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">90점 이상</span>
                        <Badge className="bg-green-100 text-green-700">최고 적합</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">80-89점</span>
                        <Badge className="bg-blue-100 text-blue-700">매우 적합</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">70-79점</span>
                        <Badge className="bg-purple-100 text-purple-700">적합</Badge>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg mt-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">AI 매칭 성공률:</span> 95.8%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          247건의 성공적인 매칭 경험을 바탕으로 한 결과입니다
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 추천 전문가 */}
            {aiRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI 추천 전문가
                  </CardTitle>
                  <p className="text-muted-foreground">
                    고객님의 평가 결과를 바탕으로 AI가 추천하는 전문가들입니다
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {aiRecommendations.slice(0, 3).map((expert, index) => (
                      <Card key={expert.id} className={`${index === 0 ? 'ring-2 ring-primary/50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={expert.image} alt={expert.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {expert.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold">{expert.name}</h3>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5">
                      <Award className="w-3 h-3 mr-1" />
                      기관장
                    </Badge>
                                  {index === 0 && (
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                                      🏆 최고 매칭
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{expert.rating}</span>
                                  </div>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-sm text-muted-foreground">{expert.experience} 경력</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {expert.specialty.map((spec, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {expert.aiMatchScore || (90 - index * 5)}점
                              </div>
                              <div className="text-xs text-muted-foreground">매칭 점수</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              월 정기상담: <span className="font-medium">{formatPrice(expert.monthlyPrice)}원</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleConsultExpert(expert.id)}
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              상담 시작
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 카카오톡 스타일 리뷰 섹션 */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-lg">
          <CardContent className="p-8">
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">실제 성장 스토리</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                AIHPRO를 통해 전문가와 만나 변화를 경험한 실제 사용자들의 이야기를 확인해보세요.
                <br />
                <span className="text-sm font-medium text-purple-600">
                  전문가 상담 후 93%의 사용자가 긍정적 변화를 경험했습니다
                </span>
              </p>
              
              {/* 신뢰 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-green-600">93%</div>
                  <div className="text-sm text-gray-600">만족도</div>
                </div>
                <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-blue-600">247+</div>
                  <div className="text-sm text-gray-600">성공 매칭</div>
                </div>
                <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-gray-600">평균 별점</div>
                </div>
              </div>
            </div>
            
            {/* 성장 스토리 피드 통합 */}
            <div className="bg-white/90 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      다른 사용자들의 변화 스토리
                    </h3>
                    <p className="text-sm text-gray-600">
                      전문가 상담을 통해 실제로 변화를 경험한 분들의 이야기입니다
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowStoryShare(!showStoryShare)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {showStoryShare ? '피드 보기' : '스토리 작성'}
                  </Button>
                </div>
              </div>
              
              {showStoryShare ? (
                <div className="space-y-6">
                  <GrowthStoryShare onStoryShared={handleStoryShared} />
                </div>
              ) : (
                <GrowthStoryFeed refreshTrigger={storyRefreshTrigger} />
              )}
              
              {/* CTA 섹션 */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                <h4 className="text-xl font-bold mb-2">당신도 변화의 주인공이 되어보세요</h4>
                <p className="text-purple-100 mb-4">
                  전문가와의 만남으로 시작되는 긍정적 변화, 지금 시작해보세요
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/assessment')}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    AI 매칭 검사 받기
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="border-white text-purple-600 bg-white hover:bg-purple-50 transition-colors"
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    전문가 둘러보기
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => navigate('/expert-application')}
                    className="bg-white text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    전문가 신청하기
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* 즉시 상담 신청 모달 */}
    {selectedQuickExpert && (
      <QuickConsultationRequest
        open={quickConsultModalOpen}
        onClose={() => {
          setQuickConsultModalOpen(false);
          setSelectedQuickExpert(null);
        }}
        expert={selectedQuickExpert}
      />
    )}

    {/* 즉시 채팅 다이얼로그 */}
    {selectedChatExpert && (
      <InstantChatDialog
        open={instantChatOpen}
        onClose={() => {
          setInstantChatOpen(false);
          setSelectedChatExpert(null);
        }}
        expert={selectedChatExpert}
      />
    )}
    </>
  );
};

export default ExpertHiring;
