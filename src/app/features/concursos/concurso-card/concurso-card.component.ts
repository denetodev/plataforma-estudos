import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { ConcursoResumo } from '../../../shared/models/concurso.model';

const MS_POR_DIA = 86_400_000;

@Component({
  selector: 'app-concurso-card',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, ProgressBarComponent],
  templateUrl: './concurso-card.component.html',
  styleUrl: './concurso-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcursoCardComponent {
  readonly concurso = input.required<ConcursoResumo>();
  readonly editar = output<ConcursoResumo>();
  readonly excluir = output<ConcursoResumo>();

  protected readonly subtitulo = computed(() =>
    [this.concurso().orgao, this.concurso().cargo].filter(Boolean).join(' · '),
  );

  /** `YYYY-MM-DD` interpretado no fuso local (new Date(iso) usaria UTC). */
  protected readonly dataProva = computed(() => {
    const iso = this.concurso().data_prova;
    if (!iso) return null;
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  });

  protected readonly contagem = computed(() => {
    const prova = this.dataProva();
    if (!prova) return null;
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dias = Math.round((prova.getTime() - inicioHoje.getTime()) / MS_POR_DIA);
    if (dias < 0) return 'Prova realizada';
    if (dias === 0) return 'A prova é hoje';
    if (dias === 1) return 'Falta 1 dia';
    return `Faltam ${dias} dias`;
  });

  protected plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }
}
