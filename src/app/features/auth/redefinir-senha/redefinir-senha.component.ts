import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { senhasIguais, TAMANHO_MIN_SENHA } from '../../../shared/utils/validadores';

/** Destino do link de recuperação: o Supabase já abre uma sessão temporária ao chegar aqui. */
@Component({
  selector: 'app-redefinir-senha',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: '../login/login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedefinirSenhaComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly minSenha = TAMANHO_MIN_SENHA;
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      novaSenha: ['', [Validators.required, Validators.minLength(TAMANHO_MIN_SENHA)]],
      confirmacao: ['', [Validators.required]],
    },
    { validators: senhasIguais },
  );

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);
    const erro = await this.auth.alterarSenha(this.form.controls.novaSenha.value);
    this.enviando.set(false);

    if (erro) {
      this.erro.set(erro);
      return;
    }
    await this.router.navigateByUrl('/concursos');
  }
}
