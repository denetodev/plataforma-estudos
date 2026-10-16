// Edge Function: redefinir-senha-usuario
//
// Permite que um ADMIN defina uma nova senha para um usuário, sem depender de e-mail/SMTP.
// Fluxo: valida o JWT de quem chamou, confere perfis.role = 'admin' e troca a senha pela API admin
// (chave de serviço só no servidor).
//
// Deploy: supabase functions deploy redefinir-senha-usuario --project-ref <ref>

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(status: number, corpo: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta(405, { erro: 'Método não permitido.' });

  const autorizacao = req.headers.get('Authorization');
  if (!autorizacao) return resposta(401, { erro: 'Não autenticado.' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const chaveAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const chaveServico = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const comoUsuario = createClient(url, chaveAnon, { global: { headers: { Authorization: autorizacao } } });
  const { data: sessao } = await comoUsuario.auth.getUser();
  if (!sessao.user) return resposta(401, { erro: 'Sessão inválida. Entre novamente.' });

  const { data: perfil } = await comoUsuario
    .from('perfis')
    .select('role')
    .eq('id', sessao.user.id)
    .maybeSingle();
  if (perfil?.role !== 'admin') return resposta(403, { erro: 'Apenas administradores podem redefinir senhas.' });

  let corpo: { usuarioId?: unknown; novaSenha?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return resposta(400, { erro: 'Requisição inválida.' });
  }

  const usuarioId = typeof corpo.usuarioId === 'string' ? corpo.usuarioId : '';
  const novaSenha = typeof corpo.novaSenha === 'string' ? corpo.novaSenha : '';
  if (!UUID.test(usuarioId)) return resposta(400, { erro: 'Usuário inválido.' });
  if (novaSenha.length < 8) return resposta(400, { erro: 'A senha deve ter pelo menos 8 caracteres.' });

  const admin = createClient(url, chaveServico, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.updateUserById(usuarioId, { password: novaSenha });
  if (error) {
    const naoEncontrado = /not found/i.test(error.message);
    return resposta(naoEncontrado ? 404 : 400, {
      erro: naoEncontrado ? 'Usuário não encontrado.' : 'Não foi possível redefinir a senha.',
    });
  }

  return resposta(200, { ok: true });
});
