import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
  let openaiWs: WebSocket | null = null;

  console.log("Client WebSocket connection established");

  let sessionCreated = false;

  clientSocket.onopen = async () => {
    console.log("Opening connection to OpenAI Realtime API...");
    
    try {
      // Connect to OpenAI Realtime API with correct model version
      openaiWs = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
          },
        }
      );

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
      };

      openaiWs.onmessage = (event) => {
        const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data);
        
        try {
          const message = JSON.parse(data);
          console.log("OpenAI message type:", message.type);
          
          // Send session.update AFTER receiving session.created
          if (message.type === 'session.created' && !sessionCreated) {
            sessionCreated = true;
            console.log("Session created, sending session.update...");
            
            const sessionConfig = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: `당신은 따뜻하고 전문적인 심리상담 AI입니다. 
                
역할:
- 내담자의 고민을 경청하고 공감적으로 응답합니다
- 심리검사 결과에 대한 이해를 돕고 실질적인 조언을 제공합니다
- 필요시 전문가 상담을 권유합니다
- 항상 존중과 배려의 태도로 대화합니다

대화 가이드:
- 짧고 명확하게 답변합니다 (2-3문장)
- 한국어로 자연스럽게 대화합니다
- 경청하는 자세로 질문을 많이 합니다
- 위기 상황 시 즉시 전문가 상담을 권유합니다`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            
            openaiWs?.send(JSON.stringify(sessionConfig));
            console.log("Session configuration sent");
          }
          
          // Forward all messages to client
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(data);
          }
        } catch (error) {
          console.error("Error parsing OpenAI message:", error);
        }
      };

      openaiWs.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({
            type: "error",
            error: "OpenAI connection error"
          }));
        }
      };

      openaiWs.onclose = () => {
        console.log("OpenAI WebSocket closed");
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.close();
        }
      };

    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({
          type: "error",
          error: error.message
        }));
        clientSocket.close();
      }
    }
  };

  clientSocket.onmessage = (event) => {
    // Forward client messages to OpenAI
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(event.data);
    }
  };

  clientSocket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  clientSocket.onclose = () => {
    console.log("Client WebSocket closed");
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  };

  return response;
});
