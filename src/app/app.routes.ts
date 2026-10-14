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
