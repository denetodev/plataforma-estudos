import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { PerfilRole } from '../../../shared/models/perfil.model';
import { AdminService } from '../admin.service';

/** Sem caracteres ambíguos (0/O, 1/l/I) para a senha ser fácil de repassar. */
const ALFABETO_SENHA = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

@Component({
  selector: 'app-novo-usuario-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Novo usuário</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        @if (erro(); as mensagem) {
          <p class="erro" role="alert">{{ mensagem }}</p>
        }

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" autocomplete="off" cdkFocusInitial />
          @if (form.controls.nome.hasError('required')) {
            <mat-error>Informe o nome.</mat-error>
          } @else if (form.controls.nome.hasError('maxlength')) {
            <mat-error>Use no máximo 100 caracteres.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="off" />
          @if (form.controls.email.hasError('required')) {
            <mat-error>Informe o e-mail.</mat-error>
          } @else if (form.controls.email.hasError('email')) {
            <mat-error>Informe um e-mail válido.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Senha inicial</mat-label>
          <input matInput formControlName="senha" autocomplete="new-password" spellcheck="false" />
          <button mat-icon-button matSuffix type="button" (click)="gerarSenha()" aria-label="Gerar senha" title="Gerar senha">
            <mat-icon>autorenew</mat-icon>
          </button>
          <button mat-icon-button matSuffix type="button" (click)="copiarSenha()" aria-label="Copiar senha" title="Copiar senha">
            <mat-icon>content_copy</mat-icon>
          </button>
          <mat-hint>{{ copiada() ? 'Senha copiada.' : 'Mínimo de 8 caracteres. Repasse ao usuário.' }}</mat-hint>
          @if (form.controls.senha.hasError('required')) {
            <mat-error>Informe a senha.</mat-error>
          } @else if (form.controls.senha.hasError('minlength')) {
            <mat-error>Use pelo menos 8 caracteres.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Papel</mat-label>
          <mat-select formControlName="role">
            <mat-option value="user">Estudante</mat-option>
            <mat-option value="admin">Administrador</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="salvando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="salvando()">
          @if (salvando()) {
            <mat-spinner diameter="20" />
          } @else {
            Criar usuário
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    mat-dialog-content {
      min-width: min(440px, 78vw);
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
export class NovoUsuarioDialogComponent {
  private readonly adminService = inject(AdminService);
  private readonly ref = inject(MatDialogRef<NovoUsuarioDialogComponent, { aviso?: string }>);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly copiada = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    senha: [this.senhaAleatoria(), [Validators.required, Validators.minLength(8)]],
    role: ['user' as PerfilRole],
  });

  protected gerarSenha(): void {
    this.form.controls.senha.setValue(this.senhaAleatoria());
    this.copiada.set(false);
  }

  protected async copiarSenha(): Promise<void> {
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

    const v = this.form.getRawValue();
    try {
      const resultado = await this.adminService.criarUsuario({
        nome: v.nome.trim(),
        email: v.email.trim(),
        senha: v.senha,
        role: v.role,
      });
      this.ref.close(resultado);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível criar o usuário.');
      this.salvando.set(false);
    }
  }

  private senhaAleatoria(tamanho = 12): string {
    const sorteio = crypto.getRandomValues(new Uint32Array(tamanho));
    return Array.from(sorteio, (n) => ALFABETO_SENHA[n % ALFABETO_SENHA.length]).join('');
  }
}
