import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth/auth.service';
import { PreferenciaTema, ThemeService } from '../../core/theme/theme.service';
import { senhasIguais, TAMANHO_MIN_SENHA } from '../../shared/utils/validadores';

@Component({
  selector: 'app-conta',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './conta.component.html',
  styleUrl: './conta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContaComponent {
  private readonly auth = inject(AuthService);
  private readonly tema = inject(ThemeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly email = this.auth.user()?.email ?? '';
  protected readonly preferenciaTema = this.tema.preferencia;
  protected readonly minSenha = TAMANHO_MIN_SENHA;

  protected readonly salvandoNome = signal(false);
  protected readonly erroNome = signal<string | null>(null);
  protected readonly salvandoSenha = signal(false);
  protected readonly erroSenha = signal<string | null>(null);

  protected readonly formNome = this.fb.group({
    nome: [this.auth.perfil()?.nome ?? '', [Validators.required, Validators.maxLength(100)]],
  });

  protected readonly formSenha = this.fb.group(
    {
      novaSenha: ['', [Validators.required, Validators.minLength(TAMANHO_MIN_SENHA)]],
      confirmacao: ['', [Validators.required]],
    },
    { validators: senhasIguais },
  );

  protected definirTema(valor: PreferenciaTema): void {
    this.tema.definir(valor);
  }

  protected async salvarNome(): Promise<void> {
    if (this.formNome.invalid) {
      this.formNome.markAllAsTouched();
      return;
    }
    this.salvandoNome.set(true);
    this.erroNome.set(null);
    const erro = await this.auth.atualizarNome(this.formNome.controls.nome.value.trim());
    this.salvandoNome.set(false);

    if (erro) {
      this.erroNome.set(erro);
      return;
    }
    this.formNome.markAsPristine();
    this.snackBar.open('Nome atualizado.', 'Fechar', { duration: 3500 });
  }

  protected async salvarSenha(): Promise<void> {
    if (this.formSenha.invalid) {
      this.formSenha.markAllAsTouched();
      return;
    }
    this.salvandoSenha.set(true);
    this.erroSenha.set(null);
    const erro = await this.auth.alterarSenha(this.formSenha.controls.novaSenha.value);
    this.salvandoSenha.set(false);

    if (erro) {
      this.erroSenha.set(erro);
      return;
    }
    this.formSenha.reset();
    this.snackBar.open('Senha alterada.', 'Fechar', { duration: 3500 });
  }
}
