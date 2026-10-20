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
- **Criar com IA**: descreva o que quer estudar e a IA monta semanas, dias e itens (com prévia antes de salvar)
- Matéria em cada item (um bloco pode ter várias), com cor e filtro
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
| `supabase/migrations/004_materia_e_uso_ia.sql` | Coluna `materia` nos itens e tabela `uso_ia` (limite diário da IA) |
| `supabase/seed/001_inss_lucas.sql` | Cronograma INSS 2026 (troque o e-mail do usuário dentro do arquivo) |

### Primeiro administrador

Crie o usuário em **Authentication → Users** e rode:

```sql
UPDATE perfis SET role = 'admin' WHERE id = '<uuid-do-usuario>';
```

Os demais usuários são criados pelo próprio app (menu **Administração → Usuários → Novo usuário**).

### Edge Functions

Guardam a chave de serviço no servidor, nunca no Angular. Só administradores conseguem chamá-las.

| Função | Usada por |
|---|---|
| `criar-usuario` | Botão "Novo usuário" |
| `redefinir-senha-usuario` | Botão "Redefinir senha" (substitui a recuperação por e-mail, sem SMTP) |
| `gerar-plano` | Botão "Criar com IA" no plano do bloco (qualquer usuário logado, com limite diário) |

```bash
supabase functions deploy criar-usuario --project-ref <project-ref>
supabase functions deploy redefinir-senha-usuario --project-ref <project-ref>
supabase functions deploy gerar-plano --project-ref <project-ref>
```

### IA (função `gerar-plano`)

A IA roda só no servidor: a chave nunca vai para o Angular. O provedor é escolhido por secret, então dá para começar
no plano gratuito do Gemini e trocar para a Anthropic depois sem mexer no código.

```bash
# Gemini (gratuito para testes) — chave em https://aistudio.google.com/apikey
supabase secrets set GEMINI_API_KEY=... --project-ref <project-ref>

# Opcionais
supabase secrets set GEMINI_MODEL=gemini-3.8-flash IA_LIMITE_DIARIO=5 --project-ref <project-ref>

# Para trocar para a Anthropic (Claude) depois:
supabase secrets set IA_PROVEDOR=anthropic ANTHROPIC_API_KEY=... --project-ref <project-ref>
# (modelo padrão claude-opus-5-5; use ANTHROPIC_MODEL para escolher outro)
```

- **Limite:** `IA_LIMITE_DIARIO` planos por usuário a cada 24h (padrão 5; admins sem limite). O uso fica em `uso_ia`,
  que só a função grava.
- **Privacidade:** em planos gratuitos de IA o provedor pode usar o conteúdo enviado para melhorar seus produtos. O
  diálogo avisa o usuário. Ao migrar para um plano pago, confirme a política de dados do provedor.
- **Nada é gravado pela IA:** a função só devolve o plano; o app mostra uma prévia e grava depois que o usuário confirma.

### Configurações no painel do Supabase

- **Authentication → Providers → Email:** o cadastro público está **ligado** (tela `/cadastro`). Se *Confirm email* estiver
  ligado, os e-mails de confirmação e de recuperação precisam de um **SMTP próprio** (o SMTP padrão do Supabase só entrega
  para membros da organização). Alternativa: desligar *Confirm email*.
- **Sem SMTP próprio:** desligue *Confirm email* para o cadastro público funcionar sem e-mail. A recuperação de senha
  por e-mail fica desativada (`RECUPERACAO_POR_EMAIL = false` em `src/app/shared/config/recursos.ts`); quem esquecer a senha
  pede ao admin (Administração → Usuários → Redefinir senha). Ao configurar SMTP, ligue a flag e adicione
  `<url>/redefinir-senha` em *Authentication → URL Configuration → Redirect URLs*.

---

## Deploy (Vercel)

O `vercel.json` já define build (`npm run build`), pasta de saída e o redirecionamento de SPA.
Configure as env vars `SUPABASE_URL` e `SUPABASE_ANON_KEY`. Cada push em `main` faz deploy automático.

---

## Desenvolvimento com Claude Code

O arquivo `CLAUDE.md` na raiz contém o contexto do projeto (arquitetura, convenções, estado atual).
