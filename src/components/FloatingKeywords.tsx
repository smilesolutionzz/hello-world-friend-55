import { useState, useEffect } from 'react';

const FloatingKeywords = () => {
  const keywords = [
    '마음건강', '심리상담', 'AI분석', '스트레스관리', '우울증', '불안장애',
    '정신건강', '심리치료', '감정조절', '멘탈케어', '치유', '회복',
    '상담센터', '전문가', '진단', '검사', '테스트', '분석',
    '아동발달', 'ADHD', '학습장애', '언어발달', '행동치료', '조기개입',
    '발달지연', '인지발달', '사회성발달', '정서발달', '운동발달', '놀이치료',
    '발달검사', '아동심리', '유아발달', '발달상담', '특수교육', '감각통합',
    '가족상담', '부부상담', '연애상담', '관계개선', '소통',
    '트라우마', 'PTSD', '공황장애', '강박증', '조울증',
    '자존감', '자신감', '성격개선', '인간관계', '사회성',
    '직장스트레스', '번아웃', '진로상담', '적성검사'
  ];

  const [floatingItems, setFloatingItems] = useState<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    speed: number;
    angle: number;
    opacity: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const items = keywords.map((keyword, index) => ({
      id: index,
      text: keyword,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.05 + Math.random() * 0.1,
      angle: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.3,
      size: 12 + Math.random() * 8
    }));
    setFloatingItems(items);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingItems(prev => prev.map(item => {
        let newX = item.x + Math.cos(item.angle) * item.speed;
        let newY = item.y + Math.sin(item.angle) * item.speed;
        let newAngle = item.angle;

        // 벽에 닿으면 반사
        if (newX <= 0 || newX >= 100) {
          newAngle = Math.PI - item.angle;
          newX = Math.max(0, Math.min(100, newX));
        }
        if (newY <= 0 || newY >= 100) {
          newAngle = -item.angle;
          newY = Math.max(0, Math.min(100, newY));
        }

        return {
          ...item,
          x: newX,
          y: newY,
          angle: newAngle
        };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="absolute select-none font-medium text-muted-foreground/60 transition-all duration-1000 ease-linear"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            opacity: item.opacity,
            fontSize: `${item.size}px`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(0.2px)',
            fontWeight: Math.random() > 0.5 ? 'normal' : 'bold'
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingKeywords;