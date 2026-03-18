import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAMES = [
  '김서연', '이준호', '박지민', '최영수', '정하은', '강민재', '조수빈', '윤도현',
  '장예린', '임태우', '한소희', '오진우', '서유진', '신동혁', '권나영', '황재윤',
  '안미소', '송현우', '류지아', '전성민', '홍세은', '고태영', '문채원', '양승호',
];

const ACTIONS = [
  '심층 심리검사를 완료하셨습니다',
  '개인화 AI 리포트를 생성하셨습니다',
  '월 정기구독을 구독하셨습니다',
  '종합 발달검사를 완료하셨습니다',
  'AI 맞춤 분석을 받으셨습니다',
  '전문가 상담을 예약하셨습니다',
];

const TIME_LABELS = ['방금 전', '1분 전', '2분 전', '3분 전', '5분 전', '10분 전'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState({ name: '', action: '', time: '' });

  const showNotification = useCallback(() => {
    setMessage({
      name: getRandomItem(NAMES),
      action: getRandomItem(ACTIONS),
      time: getRandomItem(TIME_LABELS),
    });
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    // Show first one after 10 seconds
    const initial = setTimeout(showNotification, 10000);
    // Then every 3 minutes
    const interval = setInterval(showNotification, 180000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [showNotification]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50"
        >
          <div className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">
                {message.name}님이 {message.action}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {message.time}
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
