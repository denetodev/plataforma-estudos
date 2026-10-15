// Edge Function: criar-usuario
//
// Permite que um ADMIN crie usuários (e-mail + senha inicial) sem cadastro aberto.
// A chave de serviço (SUPABASE_SERVICE_ROLE_KEY) só existe aqui, no servidor — nunca no Angular.
//
// Fluxo:
//   1. Valida o JWT de quem chamou (getUser) e confere se perfis.role = 'admin'.
//   2. Cria o usuário em auth.users via API admin (e-mail já confirmado).
//   3. O trigger handle_new_user cria a linha em `perfis`; se pedido, promove a admin.
//
// Deploy: supabase functions deploy criar-usuario --project-ref <ref>

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

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta(405, { erro: 'Método não permitido.' });

  const autorizacao = req.headers.get('Authorization');
  if (!autorizacao) return resposta(401, { erro: 'Não autenticado.' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const chaveAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const chaveServico = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Cliente "como o usuário que chamou": respeita o RLS e identifica quem é.
  const comoUsuario = createClient(url, chaveAnon, { global: { headers: { Authorization: autorizacao } } });
  const { data: sessao } = await comoUsuario.auth.getUser();
  if (!sessao.user) return resposta(401, { erro: 'Sessão inválida. Entre novamente.' });

  const { data: perfil } = await comoUsuario
    .from('perfis')
    .select('role')
    .eq('id', sessao.user.id)
    .maybeSingle();
  if (perfil?.role !== 'admin') return resposta(403, { erro: 'Apenas administradores podem criar usuários.' });

  let corpo: { nome?: unknown; email?: unknown; senha?: unknown; role?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return resposta(400, { erro: 'Requisição inválida.' });
  }

  const nome = typeof corpo.nome === 'string' ? corpo.nome.trim() : '';
  const email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : '';
  const senha = typeof corpo.senha === 'string' ? corpo.senha : '';
  const role = corpo.role === 'admin' ? 'admin' : 'user';

  if (nome.length < 1 || nome.length > 100) return resposta(400, { erro: 'Informe o nome (até 100 caracteres).' });
  if (!EMAIL_VALIDO.test(email)) return resposta(400, { erro: 'Informe um e-mail válido.' });
  if (senha.length < 8) return resposta(400, { erro: 'A senha deve ter pelo menos 8 caracteres.' });

  const admin = createClient(url, chaveServico, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: criado, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error || !criado.user) {
    const jaExiste = /already|registered|exists/i.test(error?.message ?? '');
    return resposta(jaExiste ? 409 : 400, {
      erro: jaExiste ? 'Já existe um usuário com esse e-mail.' : 'Não foi possível criar o usuário.',
    });
  }

  if (role === 'admin') {
    const { error: erroRole } = await admin.from('perfis').update({ role }).eq('id', criado.user.id);
    if (erroRole) {
      return resposta(200, {
        id: criado.user.id,
        aviso: 'Usuário criado, mas não foi possível torná-lo administrador. Ajuste na tela de usuários.',
      });
    }
  }

  return resposta(200, { id: criado.user.id });
});
