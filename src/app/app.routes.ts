import { Routes } from '@angular/router';

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
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'concursos' },
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
    ],
  },
  { path: '**', redirectTo: 'concursos' },
];
