export type CounselorEmotion = 'empathy' | 'encouragement' | 'concern' | 'joy' | 'neutral';

export const detectCounselorEmotion = (message: string): CounselorEmotion => {
  const lowerMessage = message.toLowerCase();
  
  // 공감/위로
  if (
    lowerMessage.includes('이해합니다') ||
    lowerMessage.includes('공감') ||
    lowerMessage.includes('힘드셨겠') ||
    lowerMessage.includes('괜찮아') ||
    lowerMessage.includes('위로')
  ) {
    return 'empathy';
  }
  
  // 격려/응원
  if (
    lowerMessage.includes('잘하셨') ||
    lowerMessage.includes('훌륭') ||
    lowerMessage.includes('멋지') ||
    lowerMessage.includes('힘내') ||
    lowerMessage.includes('할 수 있')
  ) {
    return 'encouragement';
  }
  
  // 걱정/우려
  if (
    lowerMessage.includes('걱정') ||
    lowerMessage.includes('어려우') ||
    lowerMessage.includes('힘들') ||
    lowerMessage.includes('조심')
  ) {
    return 'concern';
  }
  
  // 기쁨/축하
  if (
    lowerMessage.includes('축하') ||
    lowerMessage.includes('기쁘') ||
    lowerMessage.includes('좋아요') ||
    lowerMessage.includes('대단')
  ) {
    return 'joy';
  }
  
  return 'neutral';
};
