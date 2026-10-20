import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { DIAS_SEMANA, DiaSemana } from '../../../shared/models/dia.model';
import { MinutosParaTempoPipe } from '../../../shared/pipes/minutos-para-tempo.pipe';
import { corDaMateria } from '../../../shared/utils/materia';
import { PlanoService } from '../plano.service';
import { IaService, PlanoGerado } from './ia.service';

export interface GerarPlanoDialogData {
  blocoId: string;
}

type Etapa = 'form' | 'gerando' | 'previa' | 'salvando';

const DIAS_UTEIS: DiaSemana[] = ['seg', 'ter', 'qua', 'qui', 'sex'];
const MAX_MATERIAL = 12000;

function aoMenosUmDia(controle: AbstractControl): ValidationErrors | null {
  return Array.isArray(controle.value) && controle.value.length > 0 ? null : { semDias: true };
}

@Component({
  selector: 'app-gerar-plano-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MinutosParaTempoPipe,
  ],
  templateUrl: './gerar-plano-dialog.component.html',
  styleUrl: './gerar-plano-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GerarPlanoDialogComponent {
  private readonly dados = inject<GerarPlanoDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<GerarPlanoDialogComponent, boolean>);
  private readonly iaService = inject(IaService);
  private readonly planoService = inject(PlanoService);

  protected readonly diasSemana = DIAS_SEMANA;
  protected readonly opcoesSemanas = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly maxMaterial = MAX_MATERIAL;
  protected readonly corMateria = corDaMateria;

  protected readonly etapa = signal<Etapa>('form');
  protected readonly erro = signal<string | null>(null);
  protected readonly plano = signal<PlanoGerado | null>(null);
  protected readonly restantes = signal<number | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    pedido: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    semanas: [4, [Validators.required, Validators.min(1), Validators.max(8)]],
    horasPorDia: [2, [Validators.required, Validators.min(0.5), Validators.max(12)]],
    diasEstudo: [DIAS_UTEIS as DiaSemana[], [aoMenosUmDia]],
    inicio: [null as Date | null],
    material: ['', [Validators.maxLength(MAX_MATERIAL)]],
  });

  protected readonly totalItens = computed(() =>
    (this.plano()?.semanas ?? []).reduce(
      (s, sem) => s + sem.dias.reduce((d, dia) => d + dia.itens.length, 0),
      0,
    ),
  );

  protected readonly totalMinutos = computed(() =>
    (this.plano()?.semanas ?? []).reduce(
      (s, sem) =>
        s + sem.dias.reduce((d, dia) => d + dia.itens.reduce((i, item) => i + (item.duracao_min ?? 0), 0), 0),
      0,
    ),
  );

  protected readonly materiasDoPlano = computed(() => {
    const nomes = (this.plano()?.semanas ?? []).flatMap((s) =>
      s.dias.flatMap((d) => d.itens.map((i) => i.materia)),
    );
    return [...new Set(nomes.filter((m): m is string => !!m))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  });

  protected get ocupado(): boolean {
    return this.etapa() === 'gerando' || this.etapa() === 'salvando';
  }

  protected async gerar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.etapa.set('gerando');
    this.erro.set(null);

    const v = this.form.getRawValue();
    try {
      const resultado = await this.iaService.gerarPlano({
        pedido: v.pedido.trim(),
        material: v.material.trim(),
        semanas: v.semanas,
        horasPorDia: v.horasPorDia,
        diasEstudo: v.diasEstudo,
      });
      this.plano.set(resultado.plano);
      this.restantes.set(resultado.restantes);
      this.etapa.set('previa');
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível gerar o plano.');
      this.etapa.set('form');
    }
  }

  protected voltar(): void {
    this.erro.set(null);
    this.etapa.set('form');
  }

  protected removerSemana(i: number): void {
    this.plano.update((p) => p && { semanas: p.semanas.filter((_, idx) => idx !== i) });
  }

  protected removerDia(i: number, j: number): void {
    this.plano.update(
      (p) =>
        p && {
          semanas: p.semanas
            .map((s, idx) => (idx === i ? { ...s, dias: s.dias.filter((_, jdx) => jdx !== j) } : s))
            .filter((s) => s.dias.length > 0),
        },
    );
  }

  protected removerItem(i: number, j: number, k: number): void {
    this.plano.update(
      (p) =>
        p && {
          semanas: p.semanas
            .map((s, idx) =>
              idx === i
                ? {
                    ...s,
                    dias: s.dias
                      .map((d, jdx) => (jdx === j ? { ...d, itens: d.itens.filter((_, kdx) => kdx !== k) } : d))
                      .filter((d) => d.itens.length > 0),
                  }
                : s,
            )
            .filter((s) => s.dias.length > 0),
        },
    );
  }

  protected async adicionar(): Promise<void> {
    const plano = this.plano();
    if (!plano || this.totalItens() === 0) return;

    this.etapa.set('salvando');
    this.erro.set(null);
    try {
      await this.planoService.criarPlanoGerado(this.dados.blocoId, plano, this.form.controls.inicio.value);
      this.ref.close(true);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível adicionar o plano ao bloco.');
      this.etapa.set('previa');
    }
  }
}
