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
          autoGainControl: true
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
  private mode: 'free' | 'structured';
  private ageGroup: string;
  private character: string;

  constructor(
    private onMessage: (message: any) => void,
    options?: {
      mode?: 'free' | 'structured';
      ageGroup?: string;
      character?: string;
    }
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    this.mode = options?.mode || 'free';
    this.ageGroup = options?.ageGroup || 'adult';
    this.character = options?.character || 'bear';
  }

  async init() {
    try {
      console.log(`🎬 mode: ${this.mode}, age: ${this.ageGroup}, char: ${this.character}`);

      const { data, error } = await supabase.functions.invoke("get-realtime-token");
      if (error) throw error;
      if (!data.client_secret?.value) throw new Error("No token");

      const EPHEMERAL_KEY = data.client_secret.value;
      this.pc = new RTCPeerConnection();
      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        this.onMessage(event);
      });

      this.dc.onopen = () => {
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: { 
              model: "whisper-1",
              language: "ko"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.6,
              prefix_padding_ms: 500,
              silence_duration_ms: 1500
            },
            temperature: 0.8
          }
        };
        
        this.dc?.send(JSON.stringify(sessionUpdate));
        this.dc?.send(JSON.stringify({ type: "response.create" }));
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
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
  }
}
