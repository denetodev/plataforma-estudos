import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  confirmar?: string;
  cancelar?: string;
  /** Destaca a ação em vermelho (exclusões). */
  perigo?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ dados.titulo }}</h2>
    <mat-dialog-content>{{ dados.mensagem }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">
        {{ dados.cancelar ?? 'Cancelar' }}
      </button>
      <button
        mat-flat-button
        type="button"
        [class.perigo]="dados.perigo"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        {{ dados.confirmar ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .perigo {
      --mat-button-filled-container-color: #d92d20;
      --mat-button-filled-label-text-color: #fff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly dados = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
