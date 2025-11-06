import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Review {
  id: string;
  userName: string;
  messages: {
    text: string;
    isHighlighted?: boolean;
  }[];
  time: string;
}

const reviews: Review[] = [
  {
    id: '1',
    userName: '박지영님',
    messages: [
      { text: '여기 AI 심리검사 해봤는데' },
      { text: '생각보다 정확하네요 😮' },
      { text: '친구한테도 추천했어요' },
    ],
    time: '오후 2:34',
  },
  {
    id: '2',
    userName: '이서준님',
    messages: [
      { text: '검사 결과 PDF로도 받을 수 있어서 좋았어요' },
      { text: '상담센터 가기 전에 미리 체크하기 딱이네요' },
    ],
    time: '오후 3:15',
  },
  {
    id: '3',
    userName: '최민지님',
    messages: [
      { text: '전문가 상담 연결도 되던데' },
      { text: '가격도 합리적이고' },
      { text: '진짜 편하게 이용했습니다 👍' },
    ],
    time: '오후 4:22',
  },
  {
    id: '4',
    userName: '김현우님',
    messages: [
      { text: '전문가 분들도 정말 많고' },
      { text: '집 근처 제휴기관 연결해주셔서' },
      { text: '실제 상담까지 받았어요' },
      { text: '처음엔 반신반의했는데 대박이네요 ㅎㅎ' },
    ],
    time: '오후 5:10',
  },
  {
    id: '5',
    userName: '정수연님',
    messages: [
      { text: '사실 상담센터 가는게 무서웠는데' },
      { text: '여기서 간단한 검사랑 AI 상담 먼저 해보고' },
      { text: '마음의 문이 열렸어요' },
      { text: '이제 용기내서 전문가 상담 신청했습니다!' },
    ],
    time: '오후 5:45',
  },
  {
    id: '6',
    userName: '강태민님',
    messages: [
      { text: '제휴 병원이 집 근처에도 있어서' },
      { text: '온라인 검사 후 바로 연결됐어요' },
      { text: '원스톱으로 해결되니 정말 편하네요 💯' },
    ],
    time: '오후 6:18',
  },
];

export const KakaoStyleReviews = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#B2C7D9] rounded-lg p-4 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 bg-[#8B7355]">
                <AvatarFallback className="bg-[#8B7355] text-white text-xs">
                  {review.userName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#3C3C3C]">
                {review.userName}
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-1 ml-12">
              {review.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.isHighlighted
                      ? 'bg-[#FFE812] text-[#3C3C3C]'
                      : 'bg-white text-[#3C3C3C]'
                  }`}
                  style={{
                    display: 'block',
                    marginBottom: idx < review.messages.length - 1 ? '4px' : '0',
                  }}
                >
                  {msg.text}
                </div>
              ))}
              <div className="text-xs text-[#5C5C5C] mt-1">{review.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
