export type MusicType = 'none' | 'piano' | 'rain' | 'nature' | 'ambient';

export const MUSIC_OPTIONS = {
  none: { name: '없음', icon: '🔇' },
  piano: { name: '차분한 피아노', icon: '🎹' },
  rain: { name: '빗소리', icon: '🌧️' },
  nature: { name: '자연의 소리', icon: '🌿' },
  ambient: { name: '앰비언트', icon: '✨' }
} as const;

export class BackgroundMusicPlayer {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: MusicType = 'none';

  async init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3; // 기본 볼륨 30%
    }
  }

  async play(type: MusicType) {
    if (type === 'none') {
      this.stop();
      return;
    }

    if (!this.audioContext || !this.gainNode) {
      await this.init();
    }

    // 이전 음악 중지
    this.stop();

    this.currentType = type;

    // 합성 음악 생성 (실제 음악 파일 대신)
    const duration = 30; // 30초 루프
    const sampleRate = this.audioContext!.sampleRate;
    const buffer = this.audioContext!.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      
      switch (type) {
        case 'piano':
          this.generatePianoSound(data, sampleRate);
          break;
        case 'rain':
          this.generateRainSound(data, sampleRate);
          break;
        case 'nature':
          this.generateNatureSound(data, sampleRate);
          break;
        case 'ambient':
          this.generateAmbientSound(data, sampleRate);
          break;
      }
    }

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.gainNode!);
    source.start(0);

    this.currentSource = source;
  }

  private generatePianoSound(data: Float32Array, sampleRate: number) {
    // 차분한 피아노 화음 시뮬레이션
    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (C 메이저 코드)
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // 각 음표를 부드럽게 혼합
      notes.forEach((freq, idx) => {
        const envelope = Math.exp(-t * 0.5) * Math.sin(2 * Math.PI * t * (idx + 1) * 0.5);
        sample += Math.sin(2 * Math.PI * freq * t) * envelope * 0.1;
      });
      
      data[i] = sample;
    }
  }

  private generateRainSound(data: Float32Array, sampleRate: number) {
    // 빗소리 시뮬레이션 (화이트노이즈 필터링)
    for (let i = 0; i < data.length; i++) {
      const whiteNoise = (Math.random() * 2 - 1) * 0.15;
      // 저주파 필터로 부드러운 빗소리 효과
      data[i] = i > 0 ? whiteNoise * 0.3 + data[i - 1] * 0.7 : whiteNoise;
    }
  }

  private generateNatureSound(data: Float32Array, sampleRate: number) {
    // 자연의 소리 (새소리 + 바람)
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // 새소리 (높은 주파수의 짧은 톤)
      const birdSound = Math.random() > 0.995 
        ? Math.sin(2 * Math.PI * (2000 + Math.random() * 1000) * t) * Math.exp(-t * 10) * 0.1
        : 0;
      
      // 바람 소리 (저주파 노이즈)
      const wind = (Math.random() * 2 - 1) * 0.05 * Math.sin(t * 0.5);
      
      data[i] = birdSound + wind;
    }
  }

  private generateAmbientSound(data: Float32Array, sampleRate: number) {
    // 앰비언트 드론 사운드
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // 여러 주파수의 사인파를 겹쳐서 풍부한 사운드 생성
      const drone1 = Math.sin(2 * Math.PI * 110 * t) * 0.05; // A2
      const drone2 = Math.sin(2 * Math.PI * 165 * t) * 0.04; // E3
      const drone3 = Math.sin(2 * Math.PI * 220 * t) * 0.03; // A3
      
      data[i] = drone1 + drone2 + drone3;
    }
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    this.currentType = 'none';
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      // 0-1 범위의 볼륨
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getCurrentType(): MusicType {
    return this.currentType;
  }

  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 싱글톤 인스턴스
let musicPlayerInstance: BackgroundMusicPlayer | null = null;

export const getMusicPlayer = () => {
  if (!musicPlayerInstance) {
    musicPlayerInstance = new BackgroundMusicPlayer();
  }
  return musicPlayerInstance;
};
