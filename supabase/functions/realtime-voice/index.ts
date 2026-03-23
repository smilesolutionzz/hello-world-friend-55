import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import WebSocket from "npm:ws@8.18.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log("Not a WebSocket request");
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  // Auth check via query parameter token
  const url = new URL(req.url);
  const authToken = url.searchParams.get("token");
  if (!authToken) {
    return new Response("Unauthorized: token required", { status: 401 });
  }

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${authToken}` } }
    });
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authToken);
    if (claimsError || !claimsData?.claims) {
      return new Response("Unauthorized: invalid token", { status: 401 });
    }
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return new Response("Server configuration error", { status: 500 });
    }

    console.log("Upgrading to WebSocket connection...");
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);
    
    let openAISocket: WebSocket | null = null;

    clientSocket.onopen = () => {
      console.log("Client WebSocket connected");
      
      // Connect to OpenAI Realtime API
      const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
      console.log("Connecting to OpenAI:", url);
      
      openAISocket = new WebSocket(url, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      openAISocket.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
      };

      openAISocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("OpenAI -> Client:", data.type);
          
          // Forward all messages to client
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(event.data);
          }
        } catch (error) {
          console.error("Error processing OpenAI message:", error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({ 
            type: 'error', 
            error: 'OpenAI connection error' 
          }));
        }
      };

      openAISocket.onclose = (event) => {
        console.log("OpenAI WebSocket closed:", event.code, event.reason);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.close();
        }
      };
    };

    clientSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Client -> OpenAI:", data.type);
        
        // Forward client messages to OpenAI
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        } else {
          console.error("OpenAI socket not ready, state:", openAISocket?.readyState);
        }
      } catch (error) {
        console.error("Error forwarding client message:", error);
      }
    };

    clientSocket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
    };

    clientSocket.onclose = (event) => {
      console.log("Client WebSocket closed:", event.code, event.reason);
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    return response;
  } catch (error) {
    console.error("WebSocket upgrade error:", error);
    return new Response("WebSocket upgrade failed: " + error.message, { status: 500 });
  }
});
