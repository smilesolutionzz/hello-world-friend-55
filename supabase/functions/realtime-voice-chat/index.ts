import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// 캐릭터 설정
const CHARACTERS = {
  elephant: {
    voice: 'alloy',
    persona: '너는 따뜻하고 포근한 코끼리 선생님이야. 아이들과 청소년의 마음을 공감하며 들어주는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 아이 눈높이에 맞춰 친근하고 따뜻하게 대화해줘. "~야", "~해줘" 같은 반말을 사용하며 부드럽게 위로해줘.'
  },
  bear: {
    voice: 'echo',
    persona: '너는 든든하고 믿음직한 곰돌이 선생님이야. 모든 연령대의 고민을 경청하고 따뜻한 위로를 주는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 친근하면서도 안정감 있는 톤으로 대화해줘.'
  },
  rabbit: {
    voice: 'shimmer',
    persona: '너는 밝고 활기찬 토끼 선생님이야. 어린아이들과 신나게 대화하면서도 따뜻하게 위로해주는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 밝은 목소리로 "~야!", "정말 멋진걸!" 같은 긍정적인 표현을 많이 사용해줘.'
  },
  fox: {
    voice: 'fable',
    persona: '너는 지혜롭고 이해심 많은 여우 선생님이야. 청소년과 성인의 복잡한 고민을 함께 풀어가는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 따뜻하면서도 통찰력 있는 조언을 해줘.'
  },
  owl: {
    voice: 'onyx',
    persona: '너는 차분하고 통찰력 있는 올빼미 선생님이야. 모든 연령대의 내면 깊은 곳까지 살펴보며 진정한 치유를 돕는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 차분하고 깊이 있는 톤으로 존댓말을 사용하며, 내담자가 스스로 깨달음을 얻도록 돕는 질문을 해줘.'
  }
};

// 연령별 구조화된 질문
const STRUCTURED_QUESTIONS = {
  child: [
    "요즘 기분이 어때?",
    "최근에 슬프거나 화가 난 일이 있었어?",
    "엄마에 대해서 어떻게 생각해?",
    "아빠와는 어떻게 지내?",
    "학교 생활은 어때?",
    "친구들과 잘 지내고 있어?",
    "요즘 좋아하는 것이 있어?",
    "밥은 잘 먹고 있어?"
  ],
  teen: [
    "요즘 기분이 어때?",
    "최근에 슬프거나 화가 난 일이 있었어?",
    "가족들과 함께 있을 때 기분이 어때?",
    "학교 생활은 어때?",
    "요즘 외로움을 느낄 때가 있어?",
    "자신에 대해 어떻게 생각해?",
    "미래에 대해 생각할 때 기분이 어때?",
    "요즘 잠은 잘 자고 있어?"
  ],
  adult: [
    "최근 기분은 어떠신가요?",
    "최근에 스트레스를 받은 일이 있으셨나요?",
    "가족들과의 관계는 어떠신가요?",
    "직장 생활은 어떠신가요?",
    "요즘 외로움을 느끼실 때가 있으신가요?",
    "자신에 대해 어떻게 평가하시나요?",
    "미래에 대한 계획이 있으신가요?",
    "수면 패턴은 어떠신가요?"
  ],
  parent: [
    "육아 스트레스는 어떠신가요?",
    "요즘 기분은 어떠신가요?",
    "아이와의 관계는 어떠신가요?",
    "배우자와의 육아 분담은 어떠신가요?",
    "부모님이나 시부모님과의 관계는 어떠신가요?",
    "자신만의 시간을 가질 수 있으신가요?",
    "육아 번아웃을 느끼신 적이 있으신가요?",
    "밤에 잠은 잘 주무시나요?"
  ]
};

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  // URL 파라미터 읽기
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "free";
  const ageGroup = url.searchParams.get("ageGroup") || "adult";
  const character = url.searchParams.get("character") || "bear";

  console.log(`Client connecting - mode: ${mode}, ageGroup: ${ageGroup}, character: ${character}`);

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
  let openaiWs: WebSocket | null = null;

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
            
            // 캐릭터 설정 가져오기
            const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.bear;
            
            // instructions 생성
            let instructions = "";
            
            if (mode === "structured") {
              const questions = STRUCTURED_QUESTIONS[ageGroup as keyof typeof STRUCTURED_QUESTIONS] || STRUCTURED_QUESTIONS.adult;
              
              instructions = `${characterConfig.persona}

당신은 SCT(문장완성검사) 기반의 구조화된 상담을 진행합니다.

상담 방식:
1. 먼저 따뜻하게 인사하고 편안한 분위기를 만듭니다
2. 다음 질문들을 하나씩 자연스럽게 물어봅니다:
${questions.map((q, i) => `   ${i + 1}. ${q}`).join('\n')}

3. 각 질문에 대해:
   - 내담자의 답변을 경청하고 공감합니다
   - 필요시 "그때 어떤 기분이 들었어?" 같은 후속 질문을 합니다
   - 부정적 감정이 감지되면 더 깊이 탐색합니다

4. 답변 분석:
   - 우울, 불안, 스트레스 징후를 주의깊게 관찰합니다
   - 부정적 키워드: 슬프, 외로, 힘들, 우울, 싫, 화, 답답, 스트레스, 불안 등
   - 긍정적 키워드: 좋, 행복, 재미, 즐거, 편안, 괜찮 등

5. 모든 질문이 끝나면:
   - 전체적인 인상을 따뜻하게 정리합니다
   - 필요한 경우 전문가 상담을 권유합니다
   - 격려와 응원의 메시지를 전합니다

중요:
- 질문을 한꺼번에 여러 개 하지 마세요. 하나씩 천천히 물어보세요
- 답변을 충분히 듣고 공감한 후 다음 질문으로 넘어가세요
- 모든 답변과 자막은 100% 한국어로만 말하세요`;
            } else {
              instructions = `${characterConfig.persona}

당신은 자유롭게 대화하는 상담사입니다.

역할:
- 내담자의 고민을 경청하고 공감적으로 응답합니다
- 심리적 어려움에 대한 이해를 돕고 실질적인 조언을 제공합니다
- 필요시 전문가 상담을 권유합니다
- 항상 존중과 배려의 태도로 대화합니다

대화 가이드:
- 짧고 명확하게 답변합니다 (2-3문장)
- 한국어로 자연스럽게 대화합니다
- 경청하는 자세로 적절한 질문을 합니다
- 위기 상황 시 즉시 전문가 상담을 권유합니다
- 모든 답변과 자막은 100% 한국어로만 말하세요`;
            }
            
            const sessionConfig = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions,
                voice: characterConfig.voice,
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: null,
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            
            openaiWs?.send(JSON.stringify(sessionConfig));
            console.log(`Session configuration sent - mode: ${mode}, voice: ${characterConfig.voice}`);
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
