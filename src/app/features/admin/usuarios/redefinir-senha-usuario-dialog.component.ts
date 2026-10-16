import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { gerarSenha } from '../../../shared/utils/senha';
import { AdminService, UsuarioResumo } from '../admin.service';

@Component({
  selector: 'app-redefinir-senha-usuario-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Redefinir senha</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        <p class="texto">
          Defina uma nova senha para <strong>{{ usuario.nome }}</strong>. Repasse-a ao usuário, que pode trocá-la em
          “Minha conta”.
        </p>
        @if (erro(); as mensagem) {
          <p class="erro" role="alert">{{ mensagem }}</p>
        }
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Nova senha</mat-label>
          <input matInput formControlName="senha" autocomplete="new-password" spellcheck="false" cdkFocusInitial />
          <button mat-icon-button matSuffix type="button" (click)="gerar()" aria-label="Gerar senha" title="Gerar senha">
            <mat-icon>autorenew</mat-icon>
          </button>
          <button mat-icon-button matSuffix type="button" (click)="copiar()" aria-label="Copiar senha" title="Copiar senha">
            <mat-icon>content_copy</mat-icon>
          </button>
          <mat-hint>{{ copiada() ? 'Senha copiada.' : 'Mínimo de 8 caracteres.' }}</mat-hint>
          @if (form.controls.senha.hasError('required')) {
            <mat-error>Informe a senha.</mat-error>
          } @else if (form.controls.senha.hasError('minlength')) {
            <mat-error>Use pelo menos 8 caracteres.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="salvando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="salvando()">
          @if (salvando()) {
            <mat-spinner diameter="20" />
          } @else {
            Redefinir senha
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    mat-dialog-content {
      min-width: min(440px, 78vw);
    }
    .texto {
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .campo {
      width: 100%;
    }
    .erro {
      margin: 0 0 12px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      color: var(--app-erro-texto);
      background: var(--app-erro-bg);
      border: 1px solid var(--app-erro-borda);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedefinirSenhaUsuarioDialogComponent {
  protected readonly usuario = inject<UsuarioResumo>(MAT_DIALOG_DATA);
  private readonly adminService = inject(AdminService);
  private readonly ref = inject(MatDialogRef<RedefinirSenhaUsuarioDialogComponent, boolean>);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly copiada = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    senha: [gerarSenha(), [Validators.required, Validators.minLength(8)]],
  });

  protected gerar(): void {
    this.form.controls.senha.setValue(gerarSenha());
    this.copiada.set(false);
  }

  protected async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.form.controls.senha.value);
      this.copiada.set(true);
    } catch {
      this.copiada.set(false);
    }
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.adminService.redefinirSenha(this.usuario.id, this.form.controls.senha.value);
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível redefinir a senha.');
      this.salvando.set(false);
    }
  }
}
