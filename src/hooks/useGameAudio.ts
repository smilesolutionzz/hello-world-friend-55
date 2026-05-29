/**
 * useGameAudio — 게임 검사 통합 오디오 엔진
 *
 * 두 레이어 하이브리드:
 *   1) WebAudio 합성 — 챕터별 고유 BGM 패드 + 인터랙션 SFX (즉시·무비용)
 *   2) ElevenLabs Music — 챕터 테마에 맞춘 고품질 트랙을 백그라운드 생성/캐시,
 *      준비되면 합성 BGM과 크로스페이드하여 교체
 *
 * 각 게임 검사가 "다른 게임"으로 느껴지도록 챕터마다 음역대/노이즈/리듬/SFX 색상을 분리합니다.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/* ------------------------------------------------------------------ */
/* 챕터 테마 정의 — 각 게임검사가 고유 음색을 갖도록 분리                 */
/* ------------------------------------------------------------------ */

export type GameThemeKey =
  | 'shadow_escape'    // 도주·긴장·도시 밤
  | 'midnight_office'  // 번아웃·형광등·새벽
  | 'parent_night'     // 자장가·온기·새벽 4시
  | 'city_bird'        // 자유비행·하늘·도시 위
  | 'classic_quiet'    // 보통 게임검사 (디폴트, 따뜻한 회의실)
  | 'classic_warm';    // 아동용 따뜻한 톤

interface ThemeProfile {
  /** 패드 코드 (Hz). 화음 분위기 결정 */
  chord: number[];
  /** LFO 호흡 속도 (Hz) */
  breath: number;
  /** 노이즈 베드 강도 (0~1) */
  noise: number;
  /** 노이즈 필터 컷오프 (Hz) */
  noiseCutoff: number;
  /** 마스터 음량 */
  gain: number;
  /** SFX 색상 (click 톤 기준 Hz) */
  sfxColor: number;
  /** ElevenLabs 음악 프롬프트 */
  musicPrompt: string;
}

const THEMES: Record<GameThemeKey, ThemeProfile> = {
  shadow_escape: {
    chord: [55, 82.4, 110, 138.6],
    breath: 0.18,
    noise: 0.32,
    noiseCutoff: 380,
    gain: 0.16,
    sfxColor: 720,
    musicPrompt:
      'Cinematic nocturnal underscore, deep sub bass, distant city sirens, sparse piano notes in minor key, tense breathing rhythm, runaway atmosphere, no drums, ambient',
  },
  midnight_office: {
    chord: [98, 146.8, 196, 220],
    breath: 0.22,
    noise: 0.18,
    noiseCutoff: 620,
    gain: 0.15,
    sfxColor: 880,
    musicPrompt:
      'Late night office ambient, soft fluorescent hum, slow electric piano, melancholic synth pad, distant rain on window, modern corporate burnout mood, 60 bpm, no drums',
  },
  parent_night: {
    chord: [130.8, 196, 261.6, 329.6],
    breath: 0.12,
    noise: 0.10,
    noiseCutoff: 240,
    gain: 0.13,
    sfxColor: 540,
    musicPrompt:
      'Gentle warm nursery lullaby, soft music box, tender felt piano, low cello drone, warm wooden room tone, 3am parent vigil, hopeful but exhausted, 50 bpm',
  },
  city_bird: {
    chord: [174.6, 261.6, 349.2, 440],
    breath: 0.16,
    noise: 0.08,
    noiseCutoff: 1400,
    gain: 0.13,
    sfxColor: 1320,
    musicPrompt:
      'Cinematic uplifting flying score, soaring strings, airy flute, soft chimes, warm orchestral pad, sense of wide open sky and freedom over a city at dawn, 70 bpm, no drums',
  },
  classic_quiet: {
    chord: [110, 164.8, 220, 277.2],
    breath: 0.16,
    noise: 0.06,
    noiseCutoff: 800,
    gain: 0.12,
    sfxColor: 660,
    musicPrompt:
      'Quiet contemplative ambient pad, soft warm room tone, gentle piano clusters, neutral therapy session mood, 55 bpm, no drums',
  },
  classic_warm: {
    chord: [146.8, 220, 293.7, 370],
    breath: 0.20,
    noise: 0.08,
    noiseCutoff: 1100,
    gain: 0.14,
    sfxColor: 880,
    musicPrompt:
      'Warm playful children counseling room, soft xylophone, marimba twinkles, fuzzy synth pad, hopeful and gentle, no drums',
  },
};

/* ------------------------------------------------------------------ */
/* SFX 종류                                                            */
/* ------------------------------------------------------------------ */

export type SfxKind =
  | 'click'      // 카드/버튼 클릭
  | 'select'    // 선택 확정 (낮은 톤 다운)
  | 'transition' // 장면 전환 스윕
  | 'arrive'     // 다음 장면 도착 (밝은 차임)
  | 'tension'    // 긴장 강조 (낮은 펄스)
  | 'soft'       // 미세 토글/호버
  | 'success';   // 결과 완료

/* ------------------------------------------------------------------ */
/* 메인 훅                                                              */
/* ------------------------------------------------------------------ */

interface UseGameAudioOpts {
  theme: GameThemeKey;
  /** 강도 0~1: 장면 긴장도에 따라 BGM 음량/노이즈 변조 */
  intensity?: number;
  /** 모션 감소 모드 — 노이즈/LFO 축소 */
  reduceMotion?: boolean;
  /** 초기 음소거 (사용자 토글) */
  muted?: boolean;
  /** ElevenLabs 음악도 함께 로드 시도 (기본 true) */
  enableHighFi?: boolean;
}

interface GameAudioApi {
  muted: boolean;
  toggleMute: () => void;
  setMuted: (m: boolean) => void;
  playSfx: (kind: SfxKind) => void;
  /** 외부에서 강도 즉시 갱신 */
  setIntensity: (v: number) => void;
  /** 고음질 BGM 로드 상태 */
  hiFiStatus: 'idle' | 'loading' | 'ready' | 'error' | 'unavailable';
}

const HIFI_CACHE_PREFIX = 'aihpro_game_bgm_v1:';

export function useGameAudio(opts: UseGameAudioOpts): GameAudioApi {
  const { theme, intensity = 0.6, reduceMotion = false, enableHighFi = true } = opts;
  const profile = THEMES[theme] || THEMES.classic_quiet;

  const [muted, setMuted] = useState(!!opts.muted);
  const [hiFiStatus, setHiFiStatus] =
    useState<'idle' | 'loading' | 'ready' | 'error' | 'unavailable'>('idle');

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const hifiGainRef = useRef<GainNode | null>(null);
  const hifiElRef = useRef<HTMLAudioElement | null>(null);
  const intensityRef = useRef(intensity);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const breathLfoRef = useRef<OscillatorNode | null>(null);
  const startedRef = useRef(false);

  /* ---- 초기화 ---- */
  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    const ctx: AudioContext = new Ctx();
    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    return ctx;
  }, [muted]);

  /* ---- 합성 BGM 시작 ---- */
  const startSynthBgm = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx || !masterRef.current) return;
    if (startedRef.current) return;
    startedRef.current = true;

    // 패드 게인
    const synthGain = ctx.createGain();
    synthGain.gain.value = profile.gain;
    synthGain.connect(masterRef.current);
    synthGainRef.current = synthGain;

    // 호흡 LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = reduceMotion ? profile.breath * 0.5 : profile.breath;
    lfoGain.gain.value = reduceMotion ? 0.02 : 0.06;
    lfo.connect(lfoGain).connect(synthGain.gain);
    lfo.start();
    breathLfoRef.current = lfo;

    // 패드 오실레이터
    profile.chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      g.gain.value = 0.18 / (i + 1);
      osc.connect(g).connect(synthGain);
      // 미세 디튠
      osc.detune.value = (Math.random() - 0.5) * 6;
      osc.start();
      nodesRef.current.push({ osc, gain: g });
    });

    // 노이즈 베드
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = profile.noiseCutoff;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = reduceMotion ? profile.noise * 0.4 : profile.noise;
    noise.connect(filter).connect(noiseGain).connect(masterRef.current);
    noise.start();
    noiseRef.current = noise;
    noiseGainRef.current = noiseGain;
  }, [ensureContext, profile, reduceMotion]);

  /* ---- 음소거 ---- */
  const applyMuteState = useCallback(
    (m: boolean) => {
      if (!masterRef.current || !ctxRef.current) return;
      const target = m ? 0 : 0.8;
      const now = ctxRef.current.currentTime;
      masterRef.current.gain.cancelScheduledValues(now);
      masterRef.current.gain.linearRampToValueAtTime(target, now + 0.25);
    },
    []
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      applyMuteState(next);
      return next;
    });
  }, [applyMuteState]);

  /* ---- 강도 변경 (외부에서 setIntensity 호출) ---- */
  const setIntensity = useCallback(
    (v: number) => {
      intensityRef.current = v;
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (synthGainRef.current) {
        const target = profile.gain * (0.55 + v * 0.7);
        synthGainRef.current.gain.linearRampToValueAtTime(
          target,
          ctx.currentTime + 0.6
        );
      }
      if (noiseGainRef.current) {
        const target =
          profile.noise * (reduceMotion ? 0.4 : 1) * (0.5 + v * 0.9);
        noiseGainRef.current.gain.linearRampToValueAtTime(
          target,
          ctx.currentTime + 0.6
        );
      }
      if (hifiGainRef.current) {
        const target = muted ? 0 : 0.7 * (0.6 + v * 0.6);
        hifiGainRef.current.gain.linearRampToValueAtTime(
          target,
          ctx.currentTime + 0.6
        );
      }
    },
    [profile, reduceMotion, muted]
  );

  // intensity prop 변화 반영
  useEffect(() => {
    setIntensity(intensity);
  }, [intensity, setIntensity]);

  /* ---- SFX ---- */
  const playSfx = useCallback(
    (kind: SfxKind) => {
      if (muted) return;
      const ctx = ensureContext();
      if (!ctx || !masterRef.current) return;
      const t = ctx.currentTime;
      const baseColor = profile.sfxColor;

      const play = (
        freq: number,
        dur: number,
        type: OscillatorType,
        vol: number,
        sweepTo?: number
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (sweepTo !== undefined) {
          osc.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
        }
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(masterRef.current!);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      };

      switch (kind) {
        case 'click':
          play(baseColor, 0.09, 'triangle', 0.18);
          break;
        case 'soft':
          play(baseColor * 0.6, 0.06, 'sine', 0.10);
          break;
        case 'select':
          play(baseColor, 0.12, 'triangle', 0.20, baseColor * 0.55);
          play(baseColor * 0.5, 0.18, 'sine', 0.10);
          break;
        case 'transition':
          play(baseColor * 1.6, 0.45, 'sawtooth', 0.10, baseColor * 0.4);
          play(baseColor * 0.4, 0.55, 'sine', 0.16, baseColor * 0.18);
          break;
        case 'arrive':
          play(baseColor * 1.5, 0.22, 'triangle', 0.18);
          play(baseColor * 2.0, 0.32, 'sine', 0.12);
          setTimeout(() => play(baseColor * 2.5, 0.25, 'sine', 0.10), 80);
          break;
        case 'tension':
          play(baseColor * 0.35, 0.6, 'sawtooth', 0.13, baseColor * 0.25);
          break;
        case 'success':
          [1, 1.25, 1.5].forEach((m, i) =>
            setTimeout(() => play(baseColor * m, 0.35, 'triangle', 0.18), i * 90)
          );
          break;
      }
    },
    [ensureContext, muted, profile.sfxColor]
  );

  /* ---- ElevenLabs HiFi 로드 (Storage 영구 캐시 우선) ---- */
  const loadHiFiMusic = useCallback(async () => {
    if (!enableHighFi) return;
    if (hiFiStatus !== 'idle') return;

    const cacheKey = HIFI_CACHE_PREFIX + theme;
    // 1) localStorage: 이전에 저장된 Storage public URL 또는 data URI
    let src: string | null = null;
    try {
      src = localStorage.getItem(cacheKey);
    } catch {
      /* localStorage 미가용 */
    }

    // 2) 엣지 함수: Storage 캐시 hit이면 URL, 아니면 새로 생성 후 URL
    if (!src) {
      setHiFiStatus('loading');
      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-game-bgm',
          { body: { theme, prompt: profile.musicPrompt } }
        );
        if (error || !data) {
          setHiFiStatus('unavailable');
          return;
        }
        if (typeof data.url === 'string' && data.url.length > 0) {
          src = data.url;
        } else if (typeof data.audioContent === 'string' && data.audioContent.length > 0) {
          // 레거시/폴백
          src = `data:audio/mpeg;base64,${data.audioContent}`;
        } else {
          setHiFiStatus('unavailable');
          return;
        }
        try {
          localStorage.setItem(cacheKey, src);
        } catch {
          /* 용량 초과 — 캐시 실패해도 재생은 가능 */
        }
      } catch (e) {
        console.warn('[useGameAudio] hi-fi music load failed', e);
        setHiFiStatus('error');
        return;
      }
    }

    const ctx = ensureContext();
    if (!ctx || !masterRef.current || !src) {
      setHiFiStatus('error');
      return;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    hifiElRef.current = audio;

    try {
      const mediaSrc = ctx.createMediaElementSource(audio);
      const g = ctx.createGain();
      g.gain.value = 0;
      src.connect(g).connect(masterRef.current);
      hifiGainRef.current = g;

      await audio.play();
      // 합성 → 고음질 크로스페이드 (3초)
      const now = ctx.currentTime;
      g.gain.linearRampToValueAtTime(muted ? 0 : 0.7, now + 3);
      if (synthGainRef.current) {
        synthGainRef.current.gain.linearRampToValueAtTime(
          profile.gain * 0.3,
          now + 3
        );
      }
      setHiFiStatus('ready');
    } catch (e) {
      console.warn('[useGameAudio] hi-fi playback failed', e);
      setHiFiStatus('error');
    }
  }, [enableHighFi, hiFiStatus, theme, profile, ensureContext, muted]);

  /* ---- 라이프사이클 ---- */
  useEffect(() => {
    // 첫 사용자 인터랙션 후에 AudioContext가 resume 되도록
    const onFirstGesture = () => {
      const ctx = ensureContext();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      startSynthBgm();
      // 합성 시작 직후 ElevenLabs 백그라운드 로드 시도
      loadHiFiMusic();
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      try {
        nodesRef.current.forEach(({ osc }) => osc.stop());
        nodesRef.current = [];
        noiseRef.current?.stop();
        breathLfoRef.current?.stop();
        hifiElRef.current?.pause();
        hifiElRef.current = null;
        ctxRef.current?.close();
      } catch {
        /* cleanup best-effort */
      }
      ctxRef.current = null;
      masterRef.current = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return useMemo(
    () => ({
      muted,
      toggleMute,
      setMuted: (m: boolean) => {
        setMuted(m);
        applyMuteState(m);
      },
      playSfx,
      setIntensity,
      hiFiStatus,
    }),
    [muted, toggleMute, applyMuteState, playSfx, setIntensity, hiFiStatus]
  );
}
