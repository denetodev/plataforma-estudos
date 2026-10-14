import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { ConcursoDados, NIVEIS_CONCURSO } from '../../../shared/models/concurso.model';
import { ConcursosService } from '../concursos.service';

@Component({
  selector: 'app-form-concurso',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './form-concurso.component.html',
  styleUrl: './form-concurso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormConcursoComponent implements OnInit {
  /** Parâmetro de rota `:id` (via withComponentInputBinding); ausente na criação. */
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly concursosService = inject(ConcursosService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly niveis = NIVEIS_CONCURSO;
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    orgao: ['', [Validators.maxLength(100)]],
    cargo: ['', [Validators.maxLength(150)]],
    nivel: [''],
    data_prova: [''],
    ativo: [true],
  });

  protected get editando(): boolean {
    return !!this.id();
  }

  async ngOnInit(): Promise<void> {
    const id = this.id();
    if (!id) return;

    this.carregando.set(true);
    try {
      const concurso = await this.concursosService.obter(id);
      this.form.patchValue({
        nome: concurso.nome,
        orgao: concurso.orgao ?? '',
        cargo: concurso.cargo ?? '',
        nivel: concurso.nivel ?? '',
        data_prova: concurso.data_prova ?? '',
        ativo: concurso.ativo,
      });
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível carregar o concurso.');
    } finally {
      this.carregando.set(false);
    }
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
      const id = this.id();
      if (id) {
        await this.concursosService.atualizar(id, dados);
      } else {
        await this.concursosService.criar(dados);
      }
      this.snackBar.open(this.editando ? 'Concurso atualizado.' : 'Concurso criado.', 'Fechar', {
        duration: 4000,
      });
      await this.router.navigateByUrl('/concursos');
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar o concurso.');
    } finally {
      this.salvando.set(false);
    }
  }

  private paraDados(): ConcursoDados {
    const v = this.form.getRawValue();
    return {
      nome: v.nome.trim(),
      orgao: v.orgao.trim() || null,
      cargo: v.cargo.trim() || null,
      nivel: v.nivel || null,
      data_prova: v.data_prova || null,
      ativo: v.ativo,
    };
  }
}
