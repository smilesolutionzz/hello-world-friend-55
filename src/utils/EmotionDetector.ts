export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'thinking';

interface EmotionState {
  emotion: EmotionType;
  intensity: number;
  confidence: number;
}

export class EmotionDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private currentEmotion: EmotionType = 'neutral';

  constructor(private onEmotionChange: (emotion: EmotionState) => void) {}

  async init(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(new ArrayBuffer(bufferLength));

    this.startAnalysis();
  }

  private startAnalysis() {
    const analyze = () => {
      if (!this.analyser || !this.dataArray) return;

      // @ts-ignore - TypeScript 타입 호환성 문제 무시 (런타임에서는 정상 작동)
      this.analyser.getByteFrequencyData(this.dataArray);

      // 음성 특성 분석
      const volume = this.calculateVolume(this.dataArray);
      const pitch = this.calculatePitch(this.dataArray);
      const tempo = this.calculateTempo(this.dataArray);

      // 감정 추론
      const emotion = this.inferEmotion(volume, pitch, tempo);
      
      if (emotion.emotion !== this.currentEmotion) {
        this.currentEmotion = emotion.emotion;
        this.onEmotionChange(emotion);
      }

      requestAnimationFrame(analyze);
    };

    analyze();
  }

  private calculateVolume(data: Uint8Array): number {
    const sum = Array.from(data).reduce((acc, val) => acc + val, 0);
    return sum / data.length / 255; // 0-1로 정규화
  }

  private calculatePitch(data: Uint8Array): number {
    // 주파수 분석으로 피치 계산 (간단한 버전)
    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < data.length / 2; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i];
        maxIndex = i;
      }
    }

    return maxIndex / (data.length / 2); // 0-1로 정규화
  }

  private calculateTempo(data: Uint8Array): number {
    // 에너지 변화율로 템포 추정
    let changes = 0;
    let prev = data[0];

    for (let i = 1; i < data.length; i++) {
      if (Math.abs(data[i] - prev) > 20) {
        changes++;
      }
      prev = data[i];
    }

    return changes / data.length;
  }

  private inferEmotion(volume: number, pitch: number, tempo: number): EmotionState {
    // 간단한 규칙 기반 감정 추론
    let emotion: EmotionType = 'neutral';
    let intensity = 0;
    let confidence = 0;

    // 높은 볼륨 + 높은 피치 + 빠른 템포 = 화남/놀람
    if (volume > 0.6 && pitch > 0.6 && tempo > 0.5) {
      emotion = 'angry';
      intensity = 0.8;
      confidence = 0.7;
    }
    // 높은 볼륨 + 중간 피치 + 빠른 템포 = 기쁨
    else if (volume > 0.5 && pitch > 0.4 && pitch < 0.7 && tempo > 0.4) {
      emotion = 'happy';
      intensity = 0.7;
      confidence = 0.75;
    }
    // 낮은 볼륨 + 낮은 피치 + 느린 템포 = 슬픔
    else if (volume < 0.3 && pitch < 0.4 && tempo < 0.3) {
      emotion = 'sad';
      intensity = 0.6;
      confidence = 0.7;
    }
    // 높은 피치 + 빠른 변화 = 놀람
    else if (pitch > 0.7 && tempo > 0.6) {
      emotion = 'surprised';
      intensity = 0.75;
      confidence = 0.65;
    }
    // 중간 볼륨 + 일정한 패턴 = 생각 중
    else if (volume > 0.2 && volume < 0.5 && tempo < 0.3) {
      emotion = 'thinking';
      intensity = 0.5;
      confidence = 0.6;
    }
    // 기본값
    else {
      emotion = 'neutral';
      intensity = 0.3;
      confidence = 0.8;
    }

    return { emotion, intensity, confidence };
  }

  disconnect() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}

// 감정별 아바타 효과 매핑
export const getEmotionEffect = (emotion: EmotionType) => {
  switch (emotion) {
    case 'happy':
      return {
        color: '#FFD700',
        scale: 1.1,
        brightness: 1.5,
        particles: true
      };
    case 'sad':
      return {
        color: '#4169E1',
        scale: 0.95,
        brightness: 0.7,
        particles: false
      };
    case 'angry':
      return {
        color: '#FF4500',
        scale: 1.15,
        brightness: 1.3,
        particles: true
      };
    case 'surprised':
      return {
        color: '#FF69B4',
        scale: 1.2,
        brightness: 1.4,
        particles: true
      };
    case 'fearful':
      return {
        color: '#9370DB',
        scale: 0.9,
        brightness: 0.8,
        particles: false
      };
    case 'thinking':
      return {
        color: '#20B2AA',
        scale: 1.0,
        brightness: 1.1,
        particles: false
      };
    default:
      return {
        color: '#FFFFFF',
        scale: 1.0,
        brightness: 1.0,
        particles: false
      };
  }
};
