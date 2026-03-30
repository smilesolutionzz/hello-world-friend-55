import { useCallback, useRef } from 'react';

type SFXType = 'footstep' | 'choice_select' | 'scene_transition' | 'rain' | 'cave_drip' | 'forest_ambient' | 'sparkle' | 'success' | 'whoosh';

export function useGameSFX() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playSFX = useCallback((type: SFXType) => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      switch (type) {
        case 'footstep': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 80 + Math.random() * 40;
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        case 'choice_select': {
          // 밝은 차임 소리
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.frequency.value = 523;
          osc2.frequency.value = 659;
          osc1.type = 'sine';
          osc2.type = 'sine';
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc1.start(now);
          osc2.start(now + 0.05);
          osc1.stop(now + 0.3);
          osc2.stop(now + 0.35);
          break;
        }
        case 'scene_transition': {
          // 우웅~ 전환 사운드
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'rain': {
          // 비 소리 (white noise burst)
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 3000;
          const gain = ctx.createGain();
          source.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
          gain.gain.setValueAtTime(0.08, now + 1.5);
          gain.gain.linearRampToValueAtTime(0, now + 2);
          source.start(now);
          source.stop(now + 2);
          break;
        }
        case 'cave_drip': {
          // 동굴 물방울
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'forest_ambient': {
          // 새소리 비슷한 효과
          [1, 2].forEach((_, i) => {
            const delay = i * 0.3;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(2000 + Math.random() * 1000, now + delay);
            osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 500, now + delay + 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.06, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
          });
          break;
        }
        case 'sparkle': {
          // 반짝이는 효과음
          [0, 0.08, 0.16].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1000 + delay * 3000;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
            osc.start(now + delay);
            osc.stop(now + delay + 0.15);
          });
          break;
        }
        case 'success': {
          // 성공/완료 팡파레
          [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.15, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.5);
          });
          break;
        }
        case 'whoosh': {
          // 바람 소리
          const bufferSize = ctx.sampleRate;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(500, now);
          filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
          filter.Q.value = 2;
          const gain = ctx.createGain();
          source.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          source.start(now);
          source.stop(now + 0.5);
          break;
        }
      }
    } catch (err) {
      // SFX failure should not block gameplay
      console.warn('SFX error:', err);
    }
  }, [getCtx]);

  const playSceneSFX = useCallback((sceneId: string) => {
    if (sceneId.includes('cave') || sceneId.includes('dark')) {
      playSFX('cave_drip');
    } else if (sceneId.includes('forest') || sceneId.includes('entrance')) {
      playSFX('forest_ambient');
    } else if (sceneId.includes('rain') || sceneId.includes('storm')) {
      playSFX('rain');
    } else if (sceneId.includes('treasure') || sceneId.includes('result')) {
      playSFX('sparkle');
    } else {
      playSFX('whoosh');
    }
  }, [playSFX]);

  return { playSFX, playSceneSFX };
}
