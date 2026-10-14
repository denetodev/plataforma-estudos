import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BlocoCardComponent } from '../../../shared/components/bloco-card/bloco-card.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { BlocoResumo } from '../../../shared/models/bloco.model';
import { Concurso } from '../../../shared/models/concurso.model';
import { BlocosService } from '../../plano/blocos.service';
import { ConcursosService } from '../concursos.service';

@Component({
  selector: 'app-detalhe-concurso',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BlocoCardComponent,
    EmptyStateComponent,
    ProgressBarComponent,
  ],
  templateUrl: './detalhe-concurso.component.html',
  styleUrl: './detalhe-concurso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalheConcursoComponent implements OnInit {
  /** Parâmetro de rota `:id` (via withComponentInputBinding). */
  readonly id = input.required<string>();

  private readonly concursosService = inject(ConcursosService);
  private readonly blocosService = inject(BlocosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly concurso = signal<Concurso | null>(null);
  protected readonly blocos = signal<BlocoResumo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly subtitulo = computed(() =>
    [this.concurso()?.orgao, this.concurso()?.cargo].filter(Boolean).join(' · '),
  );

  protected readonly totais = computed(() => {
    const lista = this.blocos();
    const total = lista.reduce((s, b) => s + b.total_itens, 0);
    const concluidos = lista.reduce((s, b) => s + b.itens_concluidos, 0);
    return { total, concluidos, percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0 };
  });

  protected readonly dataProva = computed(() => {
    const iso = this.concurso()?.data_prova;
    if (!iso) return null;
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  });

  ngOnInit(): void {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const [concurso, blocos] = await Promise.all([
        this.concursosService.obter(this.id()),
        this.blocosService.listar(this.id()),
      ]);
      this.concurso.set(concurso);
      this.blocos.set(blocos);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar o concurso.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected editarBloco(bloco: BlocoResumo): void {
    void this.router.navigate(['/concursos', this.id(), 'bloco', bloco.id, 'editar']);
  }

  protected async excluirBloco(bloco: BlocoResumo): Promise<void> {
    const dados: ConfirmDialogData = {
      titulo: 'Excluir bloco?',
      mensagem: `"${bloco.titulo}" e todas as suas semanas, dias, itens e progresso serão apagados. Essa ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
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
      await this.blocosService.excluir(bloco.id);
      this.blocos.update((lista) => lista.filter((b) => b.id !== bloco.id));
      this.snackBar.open('Bloco excluído.', 'Fechar', { duration: 4000 });
    } catch (e) {
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível excluir.', 'Fechar', {
        duration: 6000,
      });
    }
  }
}
