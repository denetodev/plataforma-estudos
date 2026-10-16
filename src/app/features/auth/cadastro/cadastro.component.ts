import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { senhasIguais, TAMANHO_MIN_SENHA } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-cadastro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: '../login/login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly minSenha = TAMANHO_MIN_SENHA;
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly confirmarEmail = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      novaSenha: ['', [Validators.required, Validators.minLength(TAMANHO_MIN_SENHA)]],
      confirmacao: ['', [Validators.required]],
    },
    { validators: senhasIguais },
  );

  protected async criarConta(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);

    const v = this.form.getRawValue();
    const { erro, precisaConfirmar } = await this.auth.cadastrar(v.nome.trim(), v.email.trim(), v.novaSenha);
    this.enviando.set(false);

    if (erro) {
      this.erro.set(erro);
      return;
    }
    if (precisaConfirmar) {
      this.confirmarEmail.set(true);
      return;
    }
    await this.router.navigateByUrl('/concursos');
  }
}
