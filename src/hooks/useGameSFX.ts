import { useCallback, useRef } from 'react';

type SFXType = 
  | 'footstep' | 'choice_select' | 'scene_transition' | 'rain' | 'cave_drip' 
  | 'forest_ambient' | 'sparkle' | 'success' | 'whoosh'
  | 'village_bell' | 'kids_playing' | 'bakery_ding' | 'crying' | 'market_bustle'
  | 'thunder' | 'festival_fanfare' | 'farewell_chime' | 'wind_gentle';

export function useGameSFX() {
  const ctxRef = useRef<AudioContext | null>(null);
  const bgmSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);

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

        // ========== 마을 탐험 전용 효과음 ==========
        
        case 'village_bell': {
          // 마을 광장 종소리 - 맑은 교회 종 느낌
          [784, 988, 1175].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.12, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 1);
          });
          break;
        }

        case 'kids_playing': {
          // 놀이터 - 아이들 까르르 웃음 (높은 톤 + 빠른 트릴)
          [0, 0.1, 0.2, 0.35, 0.5].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(1800 + Math.random() * 600, now + delay);
            osc.frequency.exponentialRampToValueAtTime(2200 + Math.random() * 400, now + delay + 0.05);
            osc.frequency.exponentialRampToValueAtTime(1500, now + delay + 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.06, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
            osc.start(now + delay);
            osc.stop(now + delay + 0.15);
          });
          break;
        }

        case 'bakery_ding': {
          // 빵집 오븐 타이머 딩 소리
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bellOsc.connect(bellGain);
          bellGain.connect(ctx.destination);
          bellOsc.frequency.value = 2400;
          bellOsc.type = 'sine';
          bellGain.gain.setValueAtTime(0.15, now);
          bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          bellOsc.start(now);
          bellOsc.stop(now + 0.5);
          // 두번째 딩
          const bell2 = ctx.createOscillator();
          const bell2G = ctx.createGain();
          bell2.connect(bell2G);
          bell2G.connect(ctx.destination);
          bell2.frequency.value = 2400;
          bell2.type = 'sine';
          bell2G.gain.setValueAtTime(0.12, now + 0.3);
          bell2G.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          bell2.start(now + 0.3);
          bell2.stop(now + 0.8);
          break;
        }

        case 'crying': {
          // 울고 있는 아이 - 저주파 슬픈 멜로디
          [392, 349, 330, 294].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.08, now + i * 0.25);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.3);
            osc.start(now + i * 0.25);
            osc.stop(now + i * 0.25 + 0.35);
          });
          break;
        }

        case 'market_bustle': {
          // 시장 소음 - 복합 노이즈 + 팅 소리
          const bufSize = ctx.sampleRate;
          const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            d[i] = (Math.random() * 2 - 1) * 0.15;
          }
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const lpf = ctx.createBiquadFilter();
          lpf.type = 'lowpass';
          lpf.frequency.value = 2000;
          const g = ctx.createGain();
          src.connect(lpf);
          lpf.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.04, now + 0.3);
          g.gain.setValueAtTime(0.04, now + 1);
          g.gain.linearRampToValueAtTime(0, now + 1.5);
          src.start(now);
          src.stop(now + 1.5);
          // 가판대 방울
          [0.2, 0.6, 1.0].forEach(delay => {
            const o = ctx.createOscillator();
            const gg = ctx.createGain();
            o.connect(gg);
            gg.connect(ctx.destination);
            o.frequency.value = 1500 + Math.random() * 500;
            o.type = 'sine';
            gg.gain.setValueAtTime(0.05, now + delay);
            gg.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
            o.start(now + delay);
            o.stop(now + delay + 0.15);
          });
          break;
        }

        case 'thunder': {
          // 폭풍 천둥소리
          const tBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const tData = tBuf.getChannelData(0);
          for (let i = 0; i < tBuf.length; i++) {
            tData[i] = (Math.random() * 2 - 1);
          }
          const tSrc = ctx.createBufferSource();
          tSrc.buffer = tBuf;
          const tFilt = ctx.createBiquadFilter();
          tFilt.type = 'lowpass';
          tFilt.frequency.value = 400;
          const tGain = ctx.createGain();
          tSrc.connect(tFilt);
          tFilt.connect(tGain);
          tGain.connect(ctx.destination);
          tGain.gain.setValueAtTime(0, now);
          tGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
          tGain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
          tGain.gain.setValueAtTime(0.08, now + 0.5);
          tGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
          tSrc.start(now);
          tSrc.stop(now + 2);
          break;
        }

        case 'festival_fanfare': {
          // 축제 팡파레 - 밝은 트럼펫 느낌
          const fanfareNotes = [523, 659, 784, 1047, 784, 1047];
          fanfareNotes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sawtooth';
            const startTime = now + i * 0.12;
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
            osc.start(startTime);
            osc.stop(startTime + 0.25);
          });
          break;
        }

        case 'farewell_chime': {
          // 따뜻한 작별 차임 - 감성적 하행 멜로디
          [784, 698, 659, 587, 523].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const startTime = now + i * 0.2;
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            osc.start(startTime);
            osc.stop(startTime + 0.6);
          });
          break;
        }

        case 'wind_gentle': {
          // 부드러운 바람
          const wBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const wData = wBuf.getChannelData(0);
          for (let i = 0; i < wBuf.length; i++) {
            wData[i] = (Math.random() * 2 - 1) * 0.3;
          }
          const wSrc = ctx.createBufferSource();
          wSrc.buffer = wBuf;
          const wFilt = ctx.createBiquadFilter();
          wFilt.type = 'bandpass';
          wFilt.frequency.value = 600;
          wFilt.Q.value = 0.5;
          const wGain = ctx.createGain();
          wSrc.connect(wFilt);
          wFilt.connect(wGain);
          wGain.connect(ctx.destination);
          wGain.gain.setValueAtTime(0, now);
          wGain.gain.linearRampToValueAtTime(0.04, now + 0.5);
          wGain.gain.setValueAtTime(0.04, now + 1.5);
          wGain.gain.linearRampToValueAtTime(0, now + 2);
          wSrc.start(now);
          wSrc.stop(now + 2);
          break;
        }
      }
    } catch (err) {
      console.warn('SFX error:', err);
    }
  }, [getCtx]);

  // 씬 기반 효과음 (마법의숲 + 해바라기마을 통합)
  const playSceneSFX = useCallback((sceneId: string) => {
    // 해바라기 마을 전용 매핑
    switch (sceneId) {
      case 'village_square':
        playSFX('village_bell');
        break;
      case 'playground_conflict':
        playSFX('kids_playing');
        break;
      case 'bakery_help':
        playSFX('bakery_ding');
        break;
      case 'crying_child':
        playSFX('crying');
        break;
      case 'market_delivery':
        playSFX('market_bustle');
        break;
      case 'storm_coming':
        playSFX('thunder');
        setTimeout(() => playSFX('rain'), 500);
        break;
      case 'village_festival':
        playSFX('festival_fanfare');
        break;
      case 'farewell':
        playSFX('farewell_chime');
        break;
      case 'village_ending':
        playSFX('success');
        setTimeout(() => playSFX('sparkle'), 300);
        break;
      default:
        // 마법의 숲 기본 매핑
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
    }
  }, [playSFX]);

  // BGM 재생 (씬에 맞는 자동 생성 배경음)
  const startBGM = useCallback((sceneId: string) => {
    try {
      stopBGM();
      const ctx = getCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.03; // 매우 조용하게
      masterGain.connect(ctx.destination);
      bgmGainRef.current = masterGain;

      // 씬별 BGM 톤
      let baseFreq = 262; // C4
      let scale = [0, 4, 7, 12, 16]; // C major pentatonic intervals
      let tempo = 0.4;
      let waveType: OscillatorType = 'sine';

      if (sceneId.includes('storm')) {
        baseFreq = 147; // D3
        scale = [0, 3, 7, 10, 12]; // D minor
        tempo = 0.6;
        waveType = 'triangle';
      } else if (sceneId.includes('festival') || sceneId.includes('farewell')) {
        baseFreq = 330; // E4
        scale = [0, 4, 7, 11, 12]; // E major
        tempo = 0.3;
      } else if (sceneId.includes('playground')) {
        baseFreq = 392; // G4
        scale = [0, 2, 4, 7, 9]; // G pentatonic
        tempo = 0.25;
      } else if (sceneId.includes('crying')) {
        baseFreq = 220; // A3
        scale = [0, 3, 5, 7, 10]; // A minor
        tempo = 0.5;
        waveType = 'triangle';
      }

      // 8마디 패턴 생성
      const now = ctx.currentTime;
      const noteDuration = tempo;
      const totalNotes = 16;

      for (let i = 0; i < totalNotes; i++) {
        const interval = scale[Math.floor(Math.random() * scale.length)];
        const freq = baseFreq * Math.pow(2, interval / 12);
        
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        
        osc.frequency.value = freq;
        osc.type = waveType;
        
        const startTime = now + i * noteDuration;
        noteGain.gain.setValueAtTime(0.5, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration * 0.9);
        
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      }
    } catch (err) {
      console.warn('BGM error:', err);
    }
  }, [getCtx]);

  const stopBGM = useCallback(() => {
    try {
      if (bgmSourceRef.current) {
        bgmSourceRef.current.stop();
        bgmSourceRef.current = null;
      }
      if (bgmGainRef.current) {
        bgmGainRef.current.gain.setValueAtTime(0, getCtx().currentTime);
        bgmGainRef.current = null;
      }
    } catch {
      // ignore
    }
  }, [getCtx]);

  return { playSFX, playSceneSFX, startBGM, stopBGM };
}
