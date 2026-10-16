# Plataforma de Estudos — CLAUDE.md

Contexto completo para o Claude Code. Leia antes de qualquer ação.

---

## Visão Geral

SPA de gestão de cronogramas de estudos para concursos públicos.
O usuário cria concursos, monta planos (blocos → semanas → dias → itens) e marca progresso.
Inspirado no estudaqui.com. UI 100% em português.

**Criado por:** Neto (deneto.dev)
**Stack:** Angular 20 (standalone + signals) · Supabase (Auth + Postgres + RLS) · Vercel
**Sem backend próprio.** Toda lógica server-side via Supabase (RLS + functions se necessário).

---

## Roles de Usuário

| Role | Quem | Permissões |
|------|------|------------|
| `admin` | Neto (deneto.dev@gmail.com) | Vê e edita tudo de todos os usuários |
| `user` | Lucas e outros | Vê e edita apenas os próprios dados |

O role é definido na tabela `perfis`. O Supabase Auth gerencia autenticação.

---

## Stack Técnica

```
Angular 18+       → standalone components, signals, router
@supabase/supabase-js → cliente único via injeção de dependência
Angular Material  → componentes UI (ou TailwindCSS — definir no início)
Vercel            → hosting, auto-deploy via GitHub
```

**Variáveis de ambiente (`.env` local / Vercel env vars):**
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-public-key>
```
Em Angular, expor via `environment.ts`:
```ts
export const environment = {
  supabaseUrl: 'https://...',
  supabaseKey: '...'
};
```

---

## Estrutura de Pastas Angular

```
src/
  app/
    core/
      auth/
        auth.service.ts         ← login, logout, getCurrentUser, role
        auth.guard.ts           ← protege rotas autenticadas
        admin.guard.ts          ← protege rotas de admin
      supabase/
        supabase.service.ts     ← cliente Supabase singleton
    features/
      auth/
        login/                  ← página de login
        cadastro/               ← registro de novo usuário
      concursos/
        lista/                  ← cards de todos os concursos do usuário
        form/                   ← criar / editar concurso
        detalhe/                ← visão de blocos do concurso
      plano/
        bloco-form/             ← criar / editar bloco
        semana-form/            ← criar / editar semana
        dia-form/               ← criar / editar dia
        item-form/              ← criar / editar item de estudo
      cronograma/
        semana-view/            ← visualização tipo agenda semanal
        dia-view/               ← detalhe de um dia com itens
      progresso/
        dashboard/              ← % geral, por bloco, horas estudadas
      admin/
        usuarios/               ← (só admin) lista de usuários
        concursos-todos/        ← (só admin) todos os concursos
    shared/
      components/
        progress-bar/           ← barra de progresso reutilizável
        item-card/              ← card de item de estudo com checkbox
        bloco-card/             ← card de bloco com progresso
        confirm-dialog/         ← modal de confirmação pra deletes
        empty-state/            ← estado vazio genérico
      pipes/
        minutos-para-tempo.pipe.ts   ← 90 → "1h30"
        dia-semana.pipe.ts           ← "seg" → "Segunda"
      models/
        concurso.model.ts
        bloco.model.ts
        semana.model.ts
        dia.model.ts
        item.model.ts
        progresso.model.ts
        perfil.model.ts
    app.config.ts               ← providers globais
    app.routes.ts               ← rotas principais
```

---

## Schema do Banco (Supabase / Postgres)

Ver `supabase/migrations/001_schema_inicial.sql` e `supabase/seed/001_inss_lucas.sql`.

**Tabelas principais:**
- `perfis` → dados do usuário (nome, role, avatar)
- `concursos` → um concurso por usuário (INSS, SEDES, etc.)
- `blocos` → agrupamento temático dentro de um concurso
- `semanas` → semanas dentro de um bloco
- `dias` → dias dentro de uma semana
- `itens` → itens de estudo individuais dentro de um dia
- `progresso` → relação user × item (concluido boolean + timestamp)

---

## Convenções de Código

- **Componentes:** standalone, `ChangeDetectionStrategy.OnPush`
- **Estado:** Angular Signals (`signal()`, `computed()`, `effect()`)
- **HTTP/DB:** sempre via `SupabaseService`, nunca cliente direto no componente
- **Nomenclatura:** kebab-case pra arquivos, PascalCase pra classes, camelCase pra variáveis
- **Idioma:** toda UI em português (labels, mensagens de erro, tooltips)
- **Sem backend:** zero Spring Boot, zero Node server. Apenas Supabase.

---

## Fluxo de Autenticação

1. Usuário acessa `/login` → email + senha via Supabase Auth
2. Após login: busca `perfis` pela `id` do `auth.user`
3. Se role = `admin` → vê menu admin
4. Redirect para `/concursos` (lista dos concursos do usuário)
5. Logout limpa session Supabase + redirect `/login`

---

## Rotas Principais

```ts
'/login'                                  → LoginComponent (público)
'/cadastro'                               → CadastroComponent (cadastro público, papel 'user')
'/esqueci-senha'                          → EsqueciSenhaComponent (público)
'/redefinir-senha'                        → RedefinirSenhaComponent (sessão de recuperação)
'/hoje'                                   → HojeComponent (o que estudar hoje, todos os concursos)
'/concursos'                              → ListaConcursosComponent
'/concursos/novo' · '/concursos/:id/editar' → FormConcursoComponent
'/concursos/:id'                          → DetalheConcursoComponent (blocos + progresso geral)
'/concursos/:id/bloco/novo' · '.../bloco/:blocoId/editar' → FormBlocoComponent
'/concursos/:id/bloco/:blocoId'           → PlanoBlocoComponent (semanas → dias → itens, CRUD + reordenar)
'/concursos/:id/cronograma'               → CronogramaSemanalComponent (navega por semanas com período)
'/concursos/:id/progresso'                → DashboardProgressoComponent
'/conta'                                  → ContaComponent (nome, senha, tema)
'/admin/usuarios'                         → AdminUsuariosComponent (guard: admin; cria usuários)
'/admin/concursos'                        → AdminConcursosTodosComponent (guard: admin)
```

Todas as rotas exceto login/esqueci-senha ficam atrás de `authGuard` (dentro do `ShellComponent`, com sidebar).

---

## Como Rodar Localmente

```bash
# 1. Clone o repo
git clone https://github.com/denetodev/plataforma-estudos.git
cd plataforma-estudos

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp src/environments/environment.example.ts src/environments/environment.ts
# edite com suas credenciais Supabase

# 4. Rode o Angular
ng serve

# 5. (Opcional) Aplique migrations e seed no Supabase
# Cole o conteúdo de supabase/migrations/001_schema_inicial.sql no SQL Editor do Supabase
# Depois as migrations 002 e 003 e, por fim, supabase/seed/001_inss_lucas.sql (veja README)
```

---

## Dados Pré-populados (Seed)

O arquivo `supabase/seed/001_inss_lucas.sql` contém o cronograma completo de Lucas
para o **INSS 2026 (Técnico do Seguro Social)**, baseado na apostila APCON.

**Matérias do edital:**
- Língua Portuguesa (12 tópicos)
- Ética no Serviço Público (Decretos 1.171/94 e 6.029/07)
- Noções de Direito Constitucional (Direitos fundamentais + arts. 37–41 CF)
- Noções de Direito Administrativo (~77 subtópicos)
- Raciocínio Lógico-Matemático (4 blocos)
- Noções de Informática (6 blocos)
- Redação e Correspondências Oficiais
- Conhecimentos Específicos: Seguridade Social (23 capítulos — maior matéria)

---

## Deploy (Vercel)

1. Repo `denetodev/plataforma-estudos` conectado na Vercel; `vercel.json` define build (`npm run build`),
   saída (`dist/plataforma-estudos/browser`) e rewrite de SPA
2. Env vars: `SUPABASE_URL` e `SUPABASE_ANON_KEY` (`scripts/set-env.mjs` gera o `environment.ts` no build)
3. Cada push em `main` faz auto-deploy

---

## Migrations, seed e Edge Function

Ordem no SQL Editor: `001_schema_inicial` → `002_semanas_periodo` → `003_seguranca_perfis` → seed.
**A 003 é obrigatória:** sem ela, qualquer usuário logado consegue se promover a admin via API.

`supabase/functions/criar-usuario` (Edge Function, Deno): só admin chama; cria usuários com a chave de serviço.
Deploy: `supabase functions deploy criar-usuario --project-ref <ref>`. O cadastro público (`/cadastro`) está ligado; novos
cadastros entram sempre como `user` (a migration 003 impede a auto-promoção).

---

## Decisões de arquitetura

- **Progresso é por usuário × item** (`progresso`). Um admin que marca itens no plano de outra pessoa grava o
  progresso na própria conta.
- **Árvore do plano em uma consulta** (`semanas(*, dias(*, itens(*, progresso)))`) com filtro de progresso por
  `user_id` nas linhas embutidas (sem `!inner`, para não remover itens).
- **Datas** são `YYYY-MM-DD`; use `isoParaData`/`dataParaIso` (`shared/utils/data.ts`) — `new Date(iso)` interpreta em UTC.
- **Reordenação** troca o valor de `ordem` entre dois irmãos (duas gravações, com rollback da primeira se a segunda falhar).
- **Tema**: tokens CSS `--app-*` com `light-dark()` em `styles.scss`; nunca use hex fixo de cor neutra nos componentes.
- **Chamadas ao Supabase dentro de `onAuthStateChange`** vão em `setTimeout` (evita deadlock do lock do auth-js).

---

## Estado atual e ideias futuras

Implementado: autenticação completa, concursos, blocos, plano (CRUD + reordenar), progresso, cronograma,
dashboard, Hoje, conta, área admin, tema claro/escuro, deploy na Vercel, testes unitários de utilitários.

Ideias futuras: ver o progresso de outro usuário na área admin; excluir/desativar usuários (Edge Function);
mover itens entre dias; duplicar um bloco/semana; testes de componentes e e2e; PWA/offline.
