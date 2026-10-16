import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { DIAS_SEMANA, Dia, DiaDados } from '../../../shared/models/dia.model';
import { FormDialogData } from '../form-dialog';

@Component({
  selector: 'app-dia-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dados.valor ? 'Editar dia' : 'Novo dia' }}</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        @if (erro(); as mensagem) {
          <p class="erro" role="alert">{{ mensagem }}</p>
        }
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Nome do dia</mat-label>
          <input matInput formControlName="label" placeholder="Ex.: Segunda · 10/nov" cdkFocusInitial />
          @if (form.controls.label.hasError('required')) {
            <mat-error>Informe o nome do dia.</mat-error>
          } @else if (form.controls.label.hasError('maxlength')) {
            <mat-error>Use no máximo 100 caracteres.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Dia da semana</mat-label>
          <mat-select formControlName="dia_semana">
            <mat-option value="">Não informado</mat-option>
            @for (dia of diasSemana; track dia.valor) {
              <mat-option [value]="dia.valor">{{ dia.rotulo }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="salvando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="salvando()">
          @if (salvando()) {
            <mat-spinner diameter="20" />
          } @else {
            Salvar
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .campo {
      width: 100%;
      min-width: min(420px, 78vw);
    }
    .erro {
      margin: 0 0 12px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      color: var(--app-erro-texto);
      background: var(--app-erro-bg);
      border: 1px solid var(--app-erro-borda);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiaFormDialogComponent {
  protected readonly dados = inject<FormDialogData<Dia, DiaDados>>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DiaFormDialogComponent, boolean>);

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    label: [this.dados.valor?.label ?? '', [Validators.required, Validators.maxLength(100)]],
    dia_semana: [this.dados.valor?.dia_semana ?? ''],
  });

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);
    const v = this.form.getRawValue();
    try {
      await this.dados.salvar({
        label: v.label.trim(),
        dia_semana: (v.dia_semana || null) as DiaDados['dia_semana'],
      });
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar.');
      this.salvando.set(false);
    }
  }
}
