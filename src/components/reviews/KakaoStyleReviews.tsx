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
    userName: '김다현님',
    messages: [
      { text: '친구 아들이 6세인데, 검사 해보고 싶다고 하네요' },
      { text: '저랑 제 와이프' },
      { text: '주변에 한번씩' },
      { text: '보여줬더니' },
      { text: '다 대박이라고' },
      { text: '매시지 실제입었습니다.' },
      { text: '번거롭게' },
      { text: '상담센터 안가고 검사 자동하게 하니' },
      { text: '여기까지 힘으셨습니다.' },
    ],
    time: '오후 4:58',
  },
  {
    id: '2',
    userName: '김다현님',
    messages: [
      { text: '신혼들이라며 난리네요' },
      { text: 'ㅎㅎ' },
      { text: '대박입니다 따로' },
      { text: '1회 검사할땜 10~20 달라고 했다라구요' },
      { text: '근데 기본검사에 1회 만원정도면' },
      { text: '대박인거죠..' },
      { text: '말인즉 근데 여기 129명 임상심리사부터 의사 정신과 한의사 심리상담사 발달트러지' },
      { text: '다있어서' },
      { text: '실제로 검사를 접속하고 상담까지 이어집니다. 상담도 설대에서 30%이상자릅니다.' },
    ],
    time: '오후 5:00',
  },
  {
    id: '3',
    userName: '김다현님',
    messages: [
      { text: '합력사 분들이 너무 많으셔서' },
      { text: '신뢰도도 높고 훌륭이저 진짜 잘 만들어졌네요' },
      { text: '오세는 사진첨터에도 든 쓰는생애에' },
      { text: '올라던 칼 의뢰하는 유튜즈 나가서겟습니다...' },
    ],
    time: '오후 5:01',
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
