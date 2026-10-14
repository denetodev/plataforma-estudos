import { Routes } from '@angular/router';

import { authGuard, visitanteGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'concursos' },
  {
    path: 'login',
    title: 'Entrar · Plataforma de Estudos',
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'concursos',
    title: 'Concursos · Plataforma de Estudos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/concursos/lista/lista-concursos.component').then(
        (m) => m.ListaConcursosComponent,
      ),
  },
  { path: '**', redirectTo: 'concursos' },
];
