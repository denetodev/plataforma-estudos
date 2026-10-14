import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Exige usuário autenticado; caso contrário redireciona para /login. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.aguardarPronto();

  return auth.autenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Rotas públicas (login): usuário já autenticado vai direto para /concursos. */
export const visitanteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.aguardarPronto();

  return auth.autenticado() ? router.createUrlTree(['/concursos']) : true;
};
