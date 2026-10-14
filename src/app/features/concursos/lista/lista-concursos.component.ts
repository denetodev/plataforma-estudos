import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-lista-concursos',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './lista-concursos.component.html',
  styleUrl: './lista-concursos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaConcursosComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly perfil = this.auth.perfil;
  protected readonly isAdmin = this.auth.isAdmin;

  protected async sair(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
