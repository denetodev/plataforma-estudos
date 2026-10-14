import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { BlocoDados, CORES_BLOCO } from '../../../shared/models/bloco.model';
import { BlocosService } from '../blocos.service';

/** `data_fim` não pode ser anterior a `data_inicio` (ISO compara como texto). */
function periodoValido(grupo: AbstractControl): ValidationErrors | null {
  const inicio = grupo.get('data_inicio')?.value as string;
  const fim = grupo.get('data_fim')?.value as string;
  return inicio && fim && fim < inicio ? { periodoInvalido: true } : null;
}

@Component({
  selector: 'app-form-bloco',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './form-bloco.component.html',
  styleUrl: './form-bloco.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBlocoComponent implements OnInit {
  /** `:id` da rota — id do concurso. */
  readonly id = input.required<string>();
  /** `:blocoId` da rota — presente apenas na edição. */
  readonly blocoId = input<string>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly blocosService = inject(BlocosService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly cores = CORES_BLOCO;
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      cor: [CORES_BLOCO[0] as string],
      data_inicio: [''],
      data_fim: [''],
    },
    { validators: periodoValido },
  );

  protected get editando(): boolean {
    return !!this.blocoId();
  }

  async ngOnInit(): Promise<void> {
    const blocoId = this.blocoId();
    if (!blocoId) return;

    this.carregando.set(true);
    try {
      const bloco = await this.blocosService.obter(blocoId);
      this.form.patchValue({
        titulo: bloco.titulo,
        cor: bloco.cor ?? CORES_BLOCO[0],
        data_inicio: bloco.data_inicio ?? '',
        data_fim: bloco.data_fim ?? '',
      });
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível carregar o bloco.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected escolherCor(cor: string): void {
    this.form.controls.cor.setValue(cor);
    this.form.controls.cor.markAsDirty();
  }

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);

    const dados = this.paraDados();
    try {
      const blocoId = this.blocoId();
      if (blocoId) {
        await this.blocosService.atualizar(blocoId, dados);
      } else {
        await this.blocosService.criar(this.id(), dados);
      }
      this.snackBar.open(this.editando ? 'Bloco atualizado.' : 'Bloco criado.', 'Fechar', {
        duration: 4000,
      });
      await this.router.navigate(['/concursos', this.id()]);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar o bloco.');
    } finally {
      this.salvando.set(false);
    }
  }

  private paraDados(): BlocoDados {
    const v = this.form.getRawValue();
    return {
      titulo: v.titulo.trim(),
      cor: v.cor || null,
      data_inicio: v.data_inicio || null,
      data_fim: v.data_fim || null,
    };
  }
}
