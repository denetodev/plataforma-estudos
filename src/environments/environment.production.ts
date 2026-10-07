// Variáveis de produção — valores reais injetados pelo Vercel em build time.
// Configure as env vars SUPABASE_URL e SUPABASE_ANON_KEY no painel da Vercel:
//   Project → Settings → Environment Variables

export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseKey: process.env['SUPABASE_ANON_KEY'] ?? ''
};
