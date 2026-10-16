import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Semana, SemanaDados } from '../../../shared/models/semana.model';
import { dataParaIso, isoParaData } from '../../../shared/utils/data';
import { FormDialogData } from '../form-dialog';

export interface SemanaFormDialogData extends FormDialogData<Semana, SemanaDados> {
  /** Limites do calendário (período do bloco). */
  minData?: Date | null;
  maxData?: Date | null;
  /** Número sugerido para o nome ("Semana N") na criação. */
  proximoNumero?: number;
}

@Component({
  selector: 'app-semana-form-dialog',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dados.valor ? 'Editar semana' : 'Nova semana' }}</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        @if (erro(); as mensagem) {
          <p class="erro" role="alert">{{ mensagem }}</p>
        }

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Período da semana</mat-label>
          <mat-date-range-input [rangePicker]="seletor" [min]="dados.minData ?? null" [max]="dados.maxData ?? null">
            <input matStartDate formControlName="data_inicio" placeholder="Início" />
            <input matEndDate formControlName="data_fim" placeholder="Fim" (dateChange)="sugerirNome()" />
          </mat-date-range-input>
          <mat-datepicker-toggle matIconSuffix [for]="seletor" />
          <mat-date-range-picker #seletor [startAt]="dados.minData ?? null" />
          <mat-hint>Clique no primeiro e no último dia da semana.</mat-hint>
          @if (form.controls.data_inicio.hasError('matStartDateInvalid')) {
            <mat-error>A data inicial é inválida.</mat-error>
          } @else if (form.controls.data_fim.hasError('matEndDateInvalid')) {
            <mat-error>A data final é inválida.</mat-error>
          } @else if (
            form.controls.data_inicio.hasError('matDatepickerMin') || form.controls.data_fim.hasError('matDatepickerMin')
          ) {
            <mat-error>Escolha datas dentro do período do bloco.</mat-error>
          } @else if (
            form.controls.data_inicio.hasError('matDatepickerMax') || form.controls.data_fim.hasError('matDatepickerMax')
          ) {
            <mat-error>Escolha datas dentro do período do bloco.</mat-error>
          }
        </mat-form-field>

        @if (dados.minData || dados.maxData) {
          <p class="dica">
            Período do bloco:
            {{ dados.minData ? (dados.minData | date: 'dd/MM/yyyy') : '…' }} a
            {{ dados.maxData ? (dados.maxData | date: 'dd/MM/yyyy') : '…' }}
          </p>
        }

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Nome da semana</mat-label>
          <input matInput formControlName="label" placeholder="Ex.: Semana 1 · 10–14 nov" cdkFocusInitial />
          @if (form.controls.label.hasError('required')) {
            <mat-error>Informe o nome da semana.</mat-error>
          } @else if (form.controls.label.hasError('maxlength')) {
            <mat-error>Use no máximo 100 caracteres.</mat-error>
          }
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
    mat-dialog-content {
      min-width: min(440px, 78vw);
    }
    .campo {
      width: 100%;
    }
    .dica {
      margin: -8px 0 16px;
      font-size: 0.8rem;
      color: var(--app-texto-suave);
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
export class SemanaFormDialogComponent {
  protected readonly dados = inject<SemanaFormDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<SemanaFormDialogComponent, boolean>);
  private readonly datePipe = new DatePipe('pt-BR');

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    label: [this.dados.valor?.label ?? '', [Validators.required, Validators.maxLength(100)]],
    data_inicio: [isoParaData(this.dados.valor?.data_inicio)],
    data_fim: [isoParaData(this.dados.valor?.data_fim)],
  });

  /** Ao fechar o intervalo, sugere o nome se o usuário ainda não digitou um. */
  protected sugerirNome(): void {
    const { data_inicio: inicio, data_fim: fim, label } = this.form.getRawValue();
    if (!inicio || !fim || label.trim()) return;

    const n = this.dados.proximoNumero;
    const de = this.datePipe.transform(inicio, 'd MMM');
    const ate = this.datePipe.transform(fim, 'd MMM');
    this.form.controls.label.setValue(`${n ? `Semana ${n} · ` : ''}${de} – ${ate}`.replace(/\./g, ''));
  }

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
        data_inicio: dataParaIso(v.data_inicio),
        data_fim: dataParaIso(v.data_fim),
      });
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar.');
      this.salvando.set(false);
    }
  }
}
