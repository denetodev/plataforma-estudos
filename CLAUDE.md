# Plataforma de Estudos — CLAUDE.md

Contexto completo para o Claude Code. Leia antes de qualquer ação.

---

## Visão Geral

SPA de gestão de cronogramas de estudos para concursos públicos.
O usuário cria concursos, monta planos (blocos → semanas → dias → itens) e marca progresso.
Inspirado no estudaqui.com. UI 100% em português.

**Criado por:** Neto (deneto.dev)
**Stack:** Angular 18+ (standalone + signals) · Supabase (Auth + Postgres + RLS) · Vercel
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
'/login'                          → LoginComponent
'/cadastro'                       → CadastroComponent (só admin cria usuários, ou aberto?)
'/concursos'                      → ListaConcursosComponent (guard: autenticado)
'/concursos/novo'                 → FormConcursoComponent
'/concursos/:id'                  → DetalheConcursoComponent (blocos do concurso)
'/concursos/:id/bloco/novo'       → FormBlocoComponent
'/concursos/:id/cronograma'       → CronogramaComponent (visualização semanal)
'/concursos/:id/progresso'        → DashboardProgressoComponent
'/admin/usuarios'                 → AdminUsuariosComponent (guard: admin)
```

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
# Depois cole supabase/seed/001_inss_lucas.sql
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

1. Conectar repo `denetodev/plataforma-estudos` na Vercel
2. Framework: Angular
3. Build command: `ng build --configuration production`
4. Output dir: `dist/plataforma-estudos/browser`
5. Adicionar env vars: `SUPABASE_URL` e `SUPABASE_ANON_KEY`
6. Cada push em `main` faz auto-deploy

---

## Próximos Passos (Ordem de Desenvolvimento)

1. `ng new plataforma-estudos` com routing + scss
2. Instalar `@supabase/supabase-js`
3. Criar `SupabaseService` + `AuthService`
4. Aplicar migration SQL no Supabase
5. Tela de login funcional
6. CRUD de concursos
7. CRUD de blocos → semanas → dias → itens
8. Marcar progresso (checkbox por item)
9. Dashboard de progresso
10. Aplicar seed do INSS pra Lucas
11. Área admin
12. Deploy na Vercel
