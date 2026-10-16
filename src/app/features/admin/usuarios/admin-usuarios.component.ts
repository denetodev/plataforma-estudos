import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PerfilRole } from '../../../shared/models/perfil.model';
import { AdminService, UsuarioResumo } from '../admin.service';
import { NovoUsuarioDialogComponent } from './novo-usuario-dialog.component';
import { RedefinirSenhaUsuarioDialogComponent } from './redefinir-senha-usuario-dialog.component';

@Component({
  selector: 'app-admin-usuarios',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule, EmptyStateComponent],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsuariosComponent {
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly usuarios = signal<UsuarioResumo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    void this.carregar();
  }

  protected ehEuMesmo(usuario: UsuarioResumo): boolean {
    return usuario.id === this.auth.user()?.id;
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.usuarios.set(await this.adminService.listarUsuarios());
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar os usuários.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected async novoUsuario(): Promise<void> {
    const resultado = await firstValueFrom(
      this.dialog
        .open<NovoUsuarioDialogComponent, void, { aviso?: string }>(NovoUsuarioDialogComponent, {
          maxWidth: '94vw',
          autoFocus: 'first-tabbable',
        })
        .afterClosed(),
    );
    if (!resultado) return;

    this.snackBar.open(resultado.aviso ?? 'Usuário criado. Repasse a senha inicial a ele.', 'Fechar', {
      duration: resultado.aviso ? 8000 : 5000,
    });
    await this.carregar();
  }

  protected async redefinirSenha(usuario: UsuarioResumo): Promise<void> {
    const redefinida = await firstValueFrom(
      this.dialog
        .open<RedefinirSenhaUsuarioDialogComponent, UsuarioResumo, boolean>(RedefinirSenhaUsuarioDialogComponent, {
          data: usuario,
          maxWidth: '94vw',
          autoFocus: 'first-tabbable',
        })
        .afterClosed(),
    );
    if (redefinida) {
      this.snackBar.open(`Senha de ${usuario.nome} redefinida. Repasse a nova senha a ele.`, 'Fechar', {
        duration: 6000,
      });
    }
  }

  protected async alterarRole(usuario: UsuarioResumo): Promise<void> {
    const novoRole: PerfilRole = usuario.role === 'admin' ? 'user' : 'admin';
    const promover = novoRole === 'admin';
    const dados: ConfirmDialogData = {
      titulo: promover ? 'Tornar administrador?' : 'Remover acesso de administrador?',
      mensagem: promover
        ? `"${usuario.nome}" passará a ver e editar os dados de todos os usuários.`
        : `"${usuario.nome}" voltará a ver apenas os próprios dados.`,
      confirmar: promover ? 'Tornar admin' : 'Remover acesso',
      perigo: promover,
    };
    const confirmado = await firstValueFrom(
      this.dialog
        .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
          data: dados,
          width: '440px',
          maxWidth: '92vw',
        })
        .afterClosed(),
    );
    if (!confirmado) return;

    try {
      await this.adminService.alterarRole(usuario.id, novoRole);
      this.usuarios.update((lista) => lista.map((u) => (u.id === usuario.id ? { ...u, role: novoRole } : u)));
      this.snackBar.open('Papel atualizado.', 'Fechar', { duration: 3500 });
    } catch (e) {
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível alterar o papel.', 'Fechar', {
        duration: 6000,
      });
    }
  }
}
