# Plataforma de Estudos

SPA de gestão de cronogramas de estudos para concursos públicos.

**Stack:** Angular 18+ · Supabase · Vercel  
**Autor:** Neto (deneto.dev)

---

## Setup rápido

### 1. Clone e instale

```bash
git clone https://github.com/denetodev/plataforma-estudos.git
cd plataforma-estudos
npm install
```

### 2. Configure o ambiente local

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
# edite com suas credenciais Supabase
```

### 3. Rode localmente

```bash
ng serve
# acesse http://localhost:4200
```

---

## Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute `supabase/migrations/001_schema_inicial.sql`
3. Crie o usuário do Lucas no **Authentication → Users**
4. Copie o UUID gerado e substitua `'00000000-0000-0000-0000-000000000001'` em `supabase/seed/001_inss_lucas.sql`
5. Execute o seed no SQL Editor

---

## Deploy (Vercel)

1. Conecte o repositório `denetodev/plataforma-estudos` na Vercel
2. Framework: **Angular**
3. Build command: `ng build --configuration production`
4. Output dir: `dist/plataforma-estudos/browser`
5. Env vars: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

Cada push em `main` faz deploy automático.

---

## Desenvolvimento com Claude Code

Abra este repositório no Claude Code. O arquivo `CLAUDE.md` na raiz contém o contexto completo do projeto — o Claude Code o lê automaticamente e entende toda a arquitetura, convenções e próximos passos.

```bash
# dentro da pasta do projeto
claude
```
