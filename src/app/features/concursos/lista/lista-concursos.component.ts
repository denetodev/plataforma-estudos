import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConcursoResumo } from '../../../shared/models/concurso.model';
import { ConcursoCardComponent } from '../concurso-card/concurso-card.component';
import { ConcursosService } from '../concursos.service';

@Component({
  selector: 'app-lista-concursos',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ConcursoCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './lista-concursos.component.html',
  styleUrl: './lista-concursos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaConcursosComponent {
  private readonly concursosService = inject(ConcursosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly concursos = signal<ConcursoResumo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  constructor() {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.concursos.set(await this.concursosService.listar());
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar os concursos.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected editar(concurso: ConcursoResumo): void {
    void this.router.navigate(['/concursos', concurso.id, 'editar']);
  }

  protected async excluir(concurso: ConcursoResumo): Promise<void> {
    const dados: ConfirmDialogData = {
      titulo: 'Excluir concurso?',
      mensagem: `"${concurso.nome}" e todos os seus blocos, semanas, dias, itens e progresso serão apagados. Essa ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
    };
    const confirmado = await firstValueFrom(
      this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        data: dados,
        width: '440px',
        maxWidth: '92vw',
      }).afterClosed(),
    );
    if (!confirmado) return;

    try {
      await this.concursosService.excluir(concurso.id);
      this.concursos.update((lista) => lista.filter((c) => c.id !== concurso.id));
      this.snackBar.open('Concurso excluído.', 'Fechar', { duration: 4000 });
    } catch (e) {
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível excluir.', 'Fechar', {
        duration: 6000,
      });
    }
  }
}
