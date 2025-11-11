import type { GestureType } from './GestureSystem';

export const detectCounselorGesture = (message: string): GestureType | null => {
  const lowerMessage = message.toLowerCase();
  
  // 위로/공감 제스처
  if (
    lowerMessage.includes('힘내세요') ||
    lowerMessage.includes('괜찮아') ||
    lowerMessage.includes('걱정') ||
    lowerMessage.includes('이해합니다') ||
    lowerMessage.includes('공감') ||
    lowerMessage.includes('위로')
  ) {
    return 'bow'; // 위로의 인사
  }
  
  // 박수/칭찬 제스처
  if (
    lowerMessage.includes('잘하셨') ||
    lowerMessage.includes('훌륭') ||
    lowerMessage.includes('대단') ||
    lowerMessage.includes('축하') ||
    lowerMessage.includes('멋지') ||
    lowerMessage.includes('좋아요')
  ) {
    return 'clap';
  }
  
  // 인사/환영 제스처
  if (
    lowerMessage.includes('안녕') ||
    lowerMessage.includes('환영') ||
    lowerMessage.includes('처음') ||
    lowerMessage.includes('만나서') ||
    lowerMessage.includes('반가')
  ) {
    return 'wave';
  }
  
  return null;
};
