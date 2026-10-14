import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Semana, SemanaDados } from '../../../shared/models/semana.model';
import { FormDialogData } from '../form-dialog';

@Component({
  selector: 'app-semana-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
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
    .campo {
      width: 100%;
      min-width: min(420px, 78vw);
    }
    .erro {
      margin: 0 0 12px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #b42318;
      background: #fef3f2;
      border: 1px solid #fecdca;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemanaFormDialogComponent {
  protected readonly dados = inject<FormDialogData<Semana, SemanaDados>>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<SemanaFormDialogComponent, boolean>);

  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    label: [this.dados.valor?.label ?? '', [Validators.required, Validators.maxLength(100)]],
  });

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.dados.salvar({ label: this.form.controls.label.value.trim() });
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar.');
      this.salvando.set(false);
    }
  }
}
