import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-esqueci-senha',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: '../login/login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EsqueciSenhaComponent {
  private readonly auth = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set(null);
    const erro = await this.auth.enviarRecuperacaoSenha(this.form.controls.email.value.trim());
    this.enviando.set(false);

    if (erro) {
      this.erro.set(erro);
      return;
    }
    // Resposta igual exista ou não a conta, para não revelar quais e-mails estão cadastrados.
    this.enviado.set(true);
  }
}
