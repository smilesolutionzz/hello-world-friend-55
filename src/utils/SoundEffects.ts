// 사운드 효과 관리 클래스
export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private footstepInterval: NodeJS.Timeout | null = null;
  private ambientSound: HTMLAudioElement | null = null;
  private isMoving = false;

  constructor() {
    // Web Audio API 초기화
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // 발자국 소리 생성 (합성음)
  private createFootstepSound() {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 낮은 주파수의 짧은 톤 (발자국 효과)
    oscillator.frequency.value = 80 + Math.random() * 20; // 약간의 랜덤성
    oscillator.type = 'sine';
    
    // 빠르게 페이드아웃
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 발자국 소리 시작
  startFootsteps() {
    if (this.isMoving) return;
    this.isMoving = true;
    
    // 약 0.4초마다 발자국 소리 재생
    this.footstepInterval = setInterval(() => {
      this.createFootstepSound();
    }, 400);
  }

  // 발자국 소리 중지
  stopFootsteps() {
    this.isMoving = false;
    if (this.footstepInterval) {
      clearInterval(this.footstepInterval);
      this.footstepInterval = null;
    }
  }

  // 주변 환경음 재생 (간단한 화이트노이즈 기반)
  startAmbient(type: 'outdoor' | 'indoor' = 'indoor') {
    if (!this.audioContext) return;

    // 화이트노이즈 생성
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    
    // 실외: 높은 주파수 (새소리, 바람), 실내: 낮은 주파수 (미세한 소음)
    if (type === 'outdoor') {
      bandpass.frequency.value = 2000; // 높은 주파수
    } else {
      bandpass.frequency.value = 500; // 낮은 주파수
    }

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = type === 'outdoor' ? 0.03 : 0.015; // 매우 작은 볼륨

    whiteNoise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    whiteNoise.start();

    // 나중에 중지할 수 있도록 저장
    (this as any).ambientSource = whiteNoise;
  }

  // 환경음 중지
  stopAmbient() {
    if ((this as any).ambientSource) {
      (this as any).ambientSource.stop();
      (this as any).ambientSource = null;
    }
  }

  // 모든 사운드 중지 및 정리
  cleanup() {
    this.stopFootsteps();
    this.stopAmbient();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 싱글톤 인스턴스
let soundEffectsInstance: SoundEffects | null = null;

export const getSoundEffects = () => {
  if (!soundEffectsInstance) {
    soundEffectsInstance = new SoundEffects();
  }
  return soundEffectsInstance;
};
