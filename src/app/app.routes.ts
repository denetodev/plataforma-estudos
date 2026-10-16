import { Routes } from '@angular/router';

import { adminGuard } from './core/auth/admin.guard';
import { authGuard, visitanteGuard } from './core/auth/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

const TITULO = 'Plataforma de Estudos';

export const routes: Routes = [
  {
    path: 'login',
    title: `Entrar · ${TITULO}`,
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'esqueci-senha',
    title: `Recuperar senha · ${TITULO}`,
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./features/auth/esqueci-senha/esqueci-senha.component').then((m) => m.EsqueciSenhaComponent),
  },
  {
    path: 'redefinir-senha',
    title: `Nova senha · ${TITULO}`,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/redefinir-senha/redefinir-senha.component').then(
        (m) => m.RedefinirSenhaComponent,
      ),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'concursos' },
      {
        path: 'hoje',
        title: `Hoje · ${TITULO}`,
        loadComponent: () => import('./features/hoje/hoje.component').then((m) => m.HojeComponent),
      },
      {
        path: 'conta',
        title: `Minha conta · ${TITULO}`,
        loadComponent: () => import('./features/conta/conta.component').then((m) => m.ContaComponent),
      },
      {
        path: 'concursos',
        title: `Concursos · ${TITULO}`,
        loadComponent: () =>
          import('./features/concursos/lista/lista-concursos.component').then(
            (m) => m.ListaConcursosComponent,
          ),
      },
      {
        path: 'concursos/novo',
        title: `Novo concurso · ${TITULO}`,
        loadComponent: () =>
          import('./features/concursos/form/form-concurso.component').then(
            (m) => m.FormConcursoComponent,
          ),
      },
      {
        path: 'concursos/:id',
        title: `Concurso · ${TITULO}`,
        loadComponent: () =>
          import('./features/concursos/detalhe/detalhe-concurso.component').then(
            (m) => m.DetalheConcursoComponent,
          ),
      },
      {
        path: 'concursos/:id/bloco/novo',
        title: `Novo bloco · ${TITULO}`,
        loadComponent: () =>
          import('./features/plano/bloco-form/form-bloco.component').then((m) => m.FormBlocoComponent),
      },
      {
        path: 'concursos/:id/bloco/:blocoId',
        title: `Plano do bloco · ${TITULO}`,
        loadComponent: () =>
          import('./features/plano/bloco-plano/plano-bloco.component').then(
            (m) => m.PlanoBlocoComponent,
          ),
      },
      {
        path: 'concursos/:id/bloco/:blocoId/editar',
        title: `Editar bloco · ${TITULO}`,
        loadComponent: () =>
          import('./features/plano/bloco-form/form-bloco.component').then((m) => m.FormBlocoComponent),
      },
      {
        path: 'concursos/:id/cronograma',
        title: `Cronograma · ${TITULO}`,
        loadComponent: () =>
          import('./features/cronograma/semana-view/cronograma-semanal.component').then(
            (m) => m.CronogramaSemanalComponent,
          ),
      },
      {
        path: 'concursos/:id/progresso',
        title: `Progresso · ${TITULO}`,
        loadComponent: () =>
          import('./features/progresso/dashboard/dashboard-progresso.component').then(
            (m) => m.DashboardProgressoComponent,
          ),
      },
      {
        path: 'concursos/:id/editar',
        title: `Editar concurso · ${TITULO}`,
        loadComponent: () =>
          import('./features/concursos/form/form-concurso.component').then(
            (m) => m.FormConcursoComponent,
          ),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
          {
            path: 'usuarios',
            title: `Usuários · ${TITULO}`,
            loadComponent: () =>
              import('./features/admin/usuarios/admin-usuarios.component').then(
                (m) => m.AdminUsuariosComponent,
              ),
          },
          {
            path: 'concursos',
            title: `Todos os concursos · ${TITULO}`,
            loadComponent: () =>
              import('./features/admin/concursos-todos/admin-concursos-todos.component').then(
                (m) => m.AdminConcursosTodosComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'concursos' },
];
