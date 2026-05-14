import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cabeçalhos CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Responde a requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history, userId } = await req.json()

    // Validação OWASP: limite de tamanho e sanitização básica
    if (!message || typeof message !== 'string' || message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Mensagem inválida.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chave da API não configurada.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Obtém perfil do usuário para personalizar o prompt
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('diagnosis_level, goals')
      .eq('id', userId)
      .single()

    // Monta o prompt com contexto do usuário e histórico recente
    const systemPrompt = `Você é um assistente de produtividade e finanças do OrganizAI.
O usuário tem nível de experiência: ${profile?.diagnosis_level || 'iniciante'}.
Metas atuais: ${profile?.goals?.join(', ') || 'nenhuma definida'}.
Forneça respostas curtas, práticas e amigáveis, com dicas de técnicas como Pomodoro, Eisenhower, Eat That Frog, etc.
Quando relevante, sugira ajustes na agenda ou prioridades.`

    const recentHistory = (history || []).slice(-10) // últimas 10 mensagens
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      // Adiciona histórico como contexto (a API Gemini aceita múltiplas mensagens)
      ...recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    // Chamada à API Gemini (modelo gemini-1.5-flash para maior velocidade)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    )

    const geminiData = await geminiRes.json()
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Desculpe, não consegui processar sua pergunta no momento.'

    // Insere a resposta do assistente no banco (com service_role para bypass RLS)
    const { error: insertError } = await supabaseAdmin.from('ai_logs').insert({
      user_id: userId,
      role: 'assistant',
      content: reply,
    })

    if (insertError) {
      console.error('Erro ao salvar resposta:', insertError)
      return new Response(JSON.stringify({ error: 'Erro ao salvar no histórico.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Retorna a resposta também diretamente (o frontend pode usar, mas o realtime já notificará)
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro geral:', err)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})