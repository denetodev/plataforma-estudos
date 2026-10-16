import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme/theme.service';

interface ItemMenu {
  rotulo: string;
  icone: string;
  rota: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tema = inject(ThemeService);

  protected readonly perfil = this.auth.perfil;
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly menuAberto = signal(false);

  protected readonly itens: ItemMenu[] = [
    { rotulo: 'Hoje', icone: 'today', rota: '/hoje' },
    { rotulo: 'Concursos', icone: 'workspace_premium', rota: '/concursos' },
  ];

  protected readonly itensAdmin: ItemMenu[] = [
    { rotulo: 'Usuários', icone: 'group', rota: '/admin/usuarios' },
    { rotulo: 'Todos os concursos', icone: 'folder_shared', rota: '/admin/concursos' },
  ];

  constructor() {
    // Fecha o menu (mobile) ao navegar.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuAberto.set(false));
  }

  protected inicial(): string {
    return (this.perfil()?.nome ?? '?').trim().charAt(0).toUpperCase();
  }

  protected readonly escuro = computed(() => {
    this.tema.preferencia(); // dependência reativa: recalcula quando a preferência muda
    return this.tema.estaEscuro();
  });

  protected alternarTema(): void {
    this.tema.alternar();
  }

  protected alternarMenu(): void {
    this.menuAberto.update((v) => !v);
  }

  protected async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
