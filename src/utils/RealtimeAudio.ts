import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private mode: 'free' | 'structured' | 'roleplay' | 'therapy';
  private ageGroup: string;
  private character: string;
  private roleplayPersona?: string;
  private roleplayVoice?: string;
  private firstMessage?: string;
  private sessionCreated: boolean = false;
  private therapistType?: string;
  private therapistVoice?: string;
  private therapistPrompt?: string;
  private userName?: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private onDisconnect?: () => void;
  private onReconnecting?: () => void;
  private initOptions?: any;

  constructor(
    private onMessage: (message: any) => void,
    options?: {
      mode?: 'free' | 'structured' | 'roleplay' | 'therapy';
      ageGroup?: string;
      character?: string;
      roleplayPersona?: string;
      roleplayVoice?: string;
      firstMessage?: string;
      therapistType?: string;
      therapistVoice?: string;
      therapistPrompt?: string;
      userName?: string;
      onDisconnect?: () => void;
      onReconnecting?: () => void;
    }
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    (this.audioEl as any).playsInline = true;
    this.audioEl.style.display = 'none';
    document.body.appendChild(this.audioEl);
    this.mode = options?.mode || 'free';
    this.ageGroup = options?.ageGroup || 'adult';
    this.character = options?.character || 'bear';
    this.roleplayPersona = options?.roleplayPersona;
    this.roleplayVoice = options?.roleplayVoice;
    this.firstMessage = options?.firstMessage;
    this.therapistType = options?.therapistType;
    this.therapistVoice = options?.therapistVoice;
    this.therapistPrompt = options?.therapistPrompt;
    this.userName = options?.userName;
    this.onDisconnect = options?.onDisconnect;
    this.onReconnecting = options?.onReconnecting;
    this.initOptions = options;
  }

  async init() {
    try {
      console.log(`🎬 mode: ${this.mode}, age: ${this.ageGroup}, char: ${this.character}, therapist: ${this.therapistType}`);

      const { data, error } = await supabase.functions.invoke("get-realtime-token", {
        body: {
          mode: this.mode,
          ageGroup: this.ageGroup,
          character: this.character,
          roleplayPersona: this.roleplayPersona,
          roleplayVoice: this.roleplayVoice,
          firstMessage: this.firstMessage,
          therapistType: this.therapistType,
          therapistVoice: this.therapistVoice,
          therapistPrompt: this.therapistPrompt
        }
      });
      if (error) throw error;
      if (!data.client_secret?.value) throw new Error("No token");

      const EPHEMERAL_KEY = data.client_secret.value;
      this.pc = new RTCPeerConnection();
      
      // 연결 상태 모니터링
      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState;
        console.log(`🔌 WebRTC connection state: ${state}`);
        
        if (state === 'disconnected' || state === 'failed') {
          console.warn('⚠️ Connection lost, attempting reconnect...');
          this.handleConnectionLost();
        }
      };

      this.pc.oniceconnectionstatechange = () => {
        const state = this.pc?.iceConnectionState;
        console.log(`🧊 ICE connection state: ${state}`);
        
        if (state === 'disconnected') {
          // ICE disconnected - 일시적일 수 있으므로 잠시 대기
          setTimeout(() => {
            if (this.pc?.iceConnectionState === 'disconnected') {
              console.warn('⚠️ ICE still disconnected, handling...');
              this.handleConnectionLost();
            }
          }, 3000);
        }
      };
      
      this.pc.ontrack = e => {
        this.audioEl.srcObject = e.streams[0];
        this.audioEl.play().catch(err => console.warn('Audio autoplay blocked:', err));
      };

      const ms = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        
        // session.created 이벤트 처리
        if (event.type === 'session.created') {
          console.log("✅ Session created");
          this.sessionCreated = true;
          this.reconnectAttempts = 0; // 성공적 연결 시 카운터 리셋
          
          // AI가 먼저 인사하도록 트리거
          console.log(`🎭 Triggering AI first message for ${this.mode} mode...`);
          setTimeout(() => {
            if (this.dc?.readyState === 'open') {
              this.dc.send(JSON.stringify({ type: 'response.create' }));
            }
          }, 500);
        }

        // 에러 이벤트 로깅
        if (event.type === 'error') {
          console.error('❌ OpenAI Realtime error:', event.error);
        }
        
        this.onMessage(event);
      });

      this.dc.onopen = () => {
        console.log("📡 Data channel opened");
      };

      this.dc.onclose = () => {
        console.log("📡 Data channel closed");
      };

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Authorization": `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) throw new Error(`API error: ${sdpResponse.status}`);

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  private async handleConnectionLost() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.onDisconnect?.();
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    this.onReconnecting?.();

    // 기존 연결 정리
    this.cleanupConnection();

    // 잠시 대기 후 재연결
    await new Promise(resolve => setTimeout(resolve, 1000 * this.reconnectAttempts));

    try {
      await this.init();
      console.log('✅ Reconnected successfully');
    } catch (error) {
      console.error('❌ Reconnect failed:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleConnectionLost();
      } else {
        this.onDisconnect?.();
      }
    }
  }

  private cleanupConnection() {
    try {
      this.dc?.close();
    } catch {}
    try {
      // 모든 미디어 트랙 중지 (마이크 + 오디오)
      this.pc?.getSenders().forEach(sender => {
        try { sender.track?.stop(); } catch {}
      });
      this.pc?.getReceivers().forEach(receiver => {
        try { receiver.track?.stop(); } catch {}
      });
      this.pc?.close();
    } catch {}
    // 오디오 재생 완전 중지
    this.audioEl.pause();
    this.audioEl.srcObject = null;
    this.audioEl.src = '';
    // DOM에서 제거
    if (this.audioEl.parentNode) {
      this.audioEl.parentNode.removeChild(this.audioEl);
    }
    this.dc = null;
    this.pc = null;
    this.sessionCreated = false;
  }

  async sendMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // 수동 종료 시 재연결 방지
    this.cleanupConnection();
  }
}
