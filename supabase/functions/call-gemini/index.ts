// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Interface para mensagens do histórico
interface HistoryMessage {
  role: string;
  content: string;
}

serve(async (req: Request) => {
  // Responde imediatamente a requisições OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extrai e valida o corpo da requisição
    const body = await req.json();
    const { message, history, userId } = body;

    // Validação OWASP: verifica se message é string e limita tamanho
    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Mensagem inválida ou muito longa." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!userId || typeof userId !== "string") {
      return new Response(
        JSON.stringify({ error: "ID do usuário é obrigatório." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obtém a chave da API Gemini das variáveis de ambiente
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GEMINI_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração da IA não encontrada." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cria cliente Supabase com service_role (bypass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variáveis do Supabase não configuradas");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Busca perfil do usuário para personalizar o prompt
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("diagnosis_level, goals, full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError.message);
    }

    // Monta o prompt do sistema com contexto do usuário
    const userName = profile?.full_name || "Usuário";
    const userLevel = profile?.diagnosis_level || "iniciante";
    const userGoals = profile?.goals?.length
      ? profile.goals.join(", ")
      : "definir metas de produtividade";

    const systemPrompt = `Você é o assistente OrganizAI, especialista em produtividade pessoal e gestão financeira.

CONTEXTO DO USUÁRIO:
- Nome: ${userName}
- Nível de experiência: ${userLevel}
- Metas atuais: ${userGoals}

SUAS FUNÇÕES:
1. Responder dúvidas sobre produtividade e finanças de forma clara e motivadora
2. Sugerir técnicas como Pomodoro, Matriz de Eisenhower, Eat That Frog, GTD
3. Ajudar a priorizar tarefas e organizar a agenda
4. Oferecer dicas financeiras práticas (orçamento, economia, investimentos)
5. Adaptar o vocabulário ao nível do usuário (iniciante: mais explicativo; avançado: mais técnico)

REGRAS:
- Respostas em português do Brasil
- Seja encorajador e positivo
- Máximo 3 parágrafos por resposta
- Se o usuário pedir ajuda com tarefas específicas, peça detalhes sobre prazos e prioridades`;

    // Prepara o array de conteúdos para a API Gemini
    const contents: any[] = [];

    // Adiciona o prompt do sistema como primeira mensagem
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    // Adiciona o histórico recente (últimas 10 mensagens)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10) as HistoryMessage[];
      for (const msg of recentHistory) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Adiciona a mensagem atual do usuário
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    console.log(`Enviando requisição para Gemini com ${contents.length} mensagens`);

    // Chamada à API Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Erro na API Gemini:", geminiResponse.status, errorData);
      return new Response(
        JSON.stringify({
          error: "Erro ao comunicar com a IA. Tente novamente.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    
    // Extrai a resposta do Gemini
    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, não consegui processar sua pergunta no momento. Pode reformular?";

    // Salva a resposta no banco de dados
    const { error: insertError } = await supabaseAdmin.from("ai_logs").insert({
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    if (insertError) {
      console.error("Erro ao salvar resposta no banco:", insertError.message);
      // Mesmo com erro no banco, retornamos a resposta para o usuário
    }

    // Retorna a resposta
    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Erro não tratado:", err);
    return new Response(
      JSON.stringify({
        error: "Erro interno do servidor. Por favor, tente novamente.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});