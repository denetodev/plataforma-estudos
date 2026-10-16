# Plataforma de Estudos

SPA de gestão de cronogramas de estudos para concursos públicas: o usuário cria concursos, monta o plano
(blocos → semanas → dias → itens), acompanha o cronograma semanal e marca o progresso.

**Stack:** Angular 20 (standalone, signals, OnPush) · Angular Material · Supabase (Auth + Postgres + RLS + Edge Functions) · Vercel  
**Autor:** Neto (deneto.dev)

## Funcionalidades

- Cadastro público (`/cadastro`), login, recuperação e troca de senha; admins também criam usuários
- **Hoje**: o que estudar hoje somando todos os concursos ativos
- Concursos em cards (progresso, contagem para a prova), criar/editar/excluir
- Blocos coloridos, semanas com período no calendário, dias e itens (reordenáveis)
- Marcar progresso por item, cronograma semanal e dashboard (donut, horas, últimos 14 dias, por bloco)
- Área admin: usuários (criar, trocar papel) e todos os concursos
- Tema claro/escuro/automático

---

## Setup rápido

```bash
git clone https://github.com/denetodev/plataforma-estudos.git
cd plataforma-estudos
npm install
cp src/environments/environment.example.ts src/environments/environment.ts   # preencha com as credenciais
npm start            # http://localhost:4200
npm test             # testes unitários (Karma + Chrome)
npm run build        # build de produção
```

`src/environments/environment.ts` é ignorado pelo git. Em produção ele é gerado no build por
`scripts/set-env.mjs` a partir de `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

---

## Banco de dados (Supabase)

Execute no **SQL Editor**, nesta ordem:

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/001_schema_inicial.sql` | Tabelas, RLS, `is_admin()`, view de progresso |
| `supabase/migrations/002_semanas_periodo.sql` | `data_inicio`/`data_fim` nas semanas |
| `supabase/migrations/003_seguranca_perfis.sql` | **Segurança:** impede que um usuário vire admin sozinho |
| `supabase/seed/001_inss_lucas.sql` | Cronograma INSS 2026 (troque o e-mail do usuário dentro do arquivo) |

### Primeiro administrador

Crie o usuário em **Authentication → Users** e rode:

```sql
UPDATE perfis SET role = 'admin' WHERE id = '<uuid-do-usuario>';
```

Os demais usuários são criados pelo próprio app (menu **Administração → Usuários → Novo usuário**).

### Edge Function `criar-usuario`

Usada pelo botão "Novo usuário". Guarda a chave de serviço no servidor, nunca no Angular.

```bash
supabase functions deploy criar-usuario --project-ref <project-ref>
```

### Configurações no painel do Supabase

- **Authentication → Providers → Email:** o cadastro público está **ligado** (tela `/cadastro`). Se *Confirm email* estiver
  ligado, os e-mails de confirmação e de recuperação precisam de um **SMTP próprio** (o SMTP padrão do Supabase só entrega
  para membros da organização). Alternativa: desligar *Confirm email*.
- **Authentication → URL Configuration:** *Site URL* = URL da Vercel; adicione `<url>/redefinir-senha` em *Redirect URLs*
  (necessário para o e-mail de recuperação de senha).

---

## Deploy (Vercel)

O `vercel.json` já define build (`npm run build`), pasta de saída e o redirecionamento de SPA.
Configure as env vars `SUPABASE_URL` e `SUPABASE_ANON_KEY`. Cada push em `main` faz deploy automático.

---

## Desenvolvimento com Claude Code

O arquivo `CLAUDE.md` na raiz contém o contexto do projeto (arquitetura, convenções, estado atual).
