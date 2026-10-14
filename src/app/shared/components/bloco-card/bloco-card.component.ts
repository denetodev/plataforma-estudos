import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

import { BlocoResumo } from '../../models/bloco.model';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-bloco-card',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, ProgressBarComponent],
  templateUrl: './bloco-card.component.html',
  styleUrl: './bloco-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlocoCardComponent {
  readonly bloco = input.required<BlocoResumo>();
  readonly editar = output<BlocoResumo>();
  readonly excluir = output<BlocoResumo>();

  protected readonly cor = computed(() => this.bloco().cor ?? 'var(--app-primaria)');
  protected readonly inicio = computed(() => this.paraData(this.bloco().data_inicio));
  protected readonly fim = computed(() => this.paraData(this.bloco().data_fim));

  /** `YYYY-MM-DD` no fuso local (new Date(iso) usaria UTC e deslocaria o dia). */
  private paraData(iso: string | null): Date | null {
    if (!iso) return null;
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }
}
