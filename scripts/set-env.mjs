// Gera src/environments/environment.ts a partir das variáveis de ambiente
// SUPABASE_URL e SUPABASE_ANON_KEY (usado no build da Vercel).
// Sem as variáveis, mantém o environment.ts local existente.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const destino = resolve(dirname(fileURLToPath(import.meta.url)), '../src/environments/environment.ts');
const url = process.env.SUPABASE_URL;
const chave = process.env.SUPABASE_ANON_KEY;

if (!url || !chave) {
  if (existsSync(destino)) {
    console.log('[set-env] SUPABASE_URL/SUPABASE_ANON_KEY ausentes — mantendo environment.ts local.');
    process.exit(0);
  }
  console.error('[set-env] Defina SUPABASE_URL e SUPABASE_ANON_KEY ou crie src/environments/environment.ts.');
  process.exit(1);
}

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(
  destino,
  `export const environment = {\n  production: true,\n  supabaseUrl: ${JSON.stringify(url)},\n  supabaseKey: ${JSON.stringify(chave)}\n};\n`,
);
console.log('[set-env] environment.ts gerado a partir das variáveis de ambiente.');
