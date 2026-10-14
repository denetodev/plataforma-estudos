import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { Item, ItemDados, TIPOS_ITEM } from '../../../shared/models/item.model';
import { FormDialogData } from '../form-dialog';

@Component({
  selector: 'app-item-form-dialog',
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
    <h2 mat-dialog-title>{{ dados.valor ? 'Editar item de estudo' : 'Novo item de estudo' }}</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        @if (erro(); as mensagem) {
          <p class="erro" role="alert">{{ mensagem }}</p>
        }
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Descrição</mat-label>
          <textarea
            matInput
            rows="2"
            formControlName="descricao"
            placeholder="Ex.: Leitura da apostila — Língua Portuguesa, cap. 1"
            cdkFocusInitial
          ></textarea>
          @if (form.controls.descricao.hasError('required')) {
            <mat-error>Informe a descrição do item.</mat-error>
          } @else if (form.controls.descricao.hasError('maxlength')) {
            <mat-error>Use no máximo 500 caracteres.</mat-error>
          }
        </mat-form-field>

        <div class="linha">
          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo">
              <mat-option value="">Não informado</mat-option>
              @for (tipo of tipos; track tipo.valor) {
                <mat-option [value]="tipo.valor">{{ tipo.rotulo }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Duração (minutos)</mat-label>
            <input matInput type="number" inputmode="numeric" min="1" max="1440" formControlName="duracao_min" />
            @if (form.controls.duracao_min.invalid) {
              <mat-error>Use um número inteiro entre 1 e 1440.</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="linha">
          <mat-form-field appearance="outline">
            <mat-label>Fonte</mat-label>
            <input matInput formControlName="fonte" placeholder="Ex.: APCON" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Páginas</mat-label>
            <input matInput formControlName="paginas" placeholder="Ex.: 3-15" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Tags</mat-label>
          <input matInput formControlName="tags" placeholder="apcon, questoes, pomodoro" />
          <mat-hint>Separe por vírgula.</mat-hint>
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
    }
    .linha {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    mat-dialog-content {
      min-width: min(560px, 78vw);
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
    @media (max-width: 560px) {
      .linha {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormDialogComponent {
  protected readonly dados = inject<FormDialogData<Item, ItemDados>>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ItemFormDialogComponent, boolean>);

  protected readonly tipos = TIPOS_ITEM;
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    descricao: [this.dados.valor?.descricao ?? '', [Validators.required, Validators.maxLength(500)]],
    tipo: [this.dados.valor?.tipo ?? ''],
    duracao_min: [
      this.dados.valor?.duracao_min ?? (null as number | null),
      [Validators.min(1), Validators.max(1440), Validators.pattern(/^\d+$/)],
    ],
    fonte: [this.dados.valor?.fonte ?? '', [Validators.maxLength(100)]],
    paginas: [this.dados.valor?.paginas ?? '', [Validators.maxLength(50)]],
    tags: [(this.dados.valor?.tags ?? []).join(', ')],
  });

  protected async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);

    const v = this.form.getRawValue();
    const tags = [...new Set(v.tags.split(',').map((t) => t.trim()).filter(Boolean))];
    try {
      await this.dados.salvar({
        descricao: v.descricao.trim(),
        tipo: (v.tipo || null) as ItemDados['tipo'],
        duracao_min: v.duracao_min ? Number(v.duracao_min) : null,
        fonte: v.fonte.trim() || null,
        paginas: v.paginas.trim() || null,
        tags: tags.length > 0 ? tags : null,
      });
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível salvar.');
      this.salvando.set(false);
    }
  }
}
