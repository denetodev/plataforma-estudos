import { ComponentType } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Bloco } from '../../../shared/models/bloco.model';
import { Dia, DiaDados } from '../../../shared/models/dia.model';
import { Item, ItemDados, TIPOS_ITEM } from '../../../shared/models/item.model';
import { Semana, SemanaCompleta, SemanaDados } from '../../../shared/models/semana.model';
import { isoParaData } from '../../../shared/utils/data';
import { DiaSemanaPipe } from '../../../shared/pipes/dia-semana.pipe';
import { MinutosParaTempoPipe } from '../../../shared/pipes/minutos-para-tempo.pipe';
import { BlocosService } from '../blocos.service';
import { DiaFormDialogComponent } from '../dia-form/dia-form-dialog.component';
import { FormDialogData } from '../form-dialog';
import { ItemFormDialogComponent } from '../item-form/item-form-dialog.component';
import { PlanoService } from '../plano.service';
import { SemanaFormDialogComponent } from '../semana-form/semana-form-dialog.component';

@Component({
  selector: 'app-plano-bloco',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    EmptyStateComponent,
    DiaSemanaPipe,
    MinutosParaTempoPipe,
  ],
  templateUrl: './plano-bloco.component.html',
  styleUrl: './plano-bloco.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanoBlocoComponent implements OnInit {
  /** `:id` da rota — concurso. */
  readonly id = input.required<string>();
  /** `:blocoId` da rota. */
  readonly blocoId = input.required<string>();

  private readonly blocosService = inject(BlocosService);
  private readonly planoService = inject(PlanoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly bloco = signal<Bloco | null>(null);
  protected readonly semanas = signal<SemanaCompleta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly cor = computed(() => this.bloco()?.cor ?? 'var(--app-primaria)');

  protected readonly totalItens = computed(() =>
    this.semanas().reduce((s, sem) => s + sem.dias.reduce((d, dia) => d + dia.itens.length, 0), 0),
  );

  ngOnInit(): void {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const [bloco, semanas] = await Promise.all([
        this.blocosService.obter(this.blocoId()),
        this.planoService.carregar(this.blocoId()),
      ]);
      this.bloco.set(bloco);
      this.semanas.set(semanas);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar o bloco.');
    } finally {
      this.carregando.set(false);
    }
  }

  // ---- helpers de exibição ----

  protected totalItensSemana(semana: SemanaCompleta): number {
    return semana.dias.reduce((s, d) => s + d.itens.length, 0);
  }

  protected plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }

  protected paraData = isoParaData;

  /** Limites do calendário das semanas: período do bloco, quando definido. */
  private limitesBloco(): { minData: Date | null; maxData: Date | null } {
    const b = this.bloco();
    return { minData: isoParaData(b?.data_inicio), maxData: isoParaData(b?.data_fim) };
  }

  protected tipo(valor: Item['tipo']) {
    return TIPOS_ITEM.find((t) => t.valor === valor) ?? null;
  }

  // ---- semanas ----

  protected novaSemana(): void {
    void this.formulario<Semana, SemanaDados>(
      SemanaFormDialogComponent,
      undefined,
      (d) => this.planoService.criarSemana(this.blocoId(), d),
      'Semana criada.',
      { ...this.limitesBloco(), proximoNumero: this.semanas().length + 1 },
    );
  }

  protected editarSemana(semana: Semana): void {
    void this.formulario<Semana, SemanaDados>(
      SemanaFormDialogComponent,
      semana,
      (d) => this.planoService.atualizarSemana(semana.id, d),
      'Semana atualizada.',
      this.limitesBloco(),
    );
  }

  protected excluirSemana(semana: SemanaCompleta): void {
    void this.excluir(
      'Excluir semana?',
      `"${semana.label}" e todos os seus dias, itens e progresso serão apagados.`,
      () => this.planoService.excluirSemana(semana.id),
      'Semana excluída.',
    );
  }

  // ---- dias ----

  protected novoDia(semana: Semana): void {
    void this.formulario<Dia, DiaDados>(
      DiaFormDialogComponent,
      undefined,
      (d) => this.planoService.criarDia(semana.id, d),
      'Dia criado.',
    );
  }

  protected editarDia(dia: Dia): void {
    void this.formulario<Dia, DiaDados>(
      DiaFormDialogComponent,
      dia,
      (d) => this.planoService.atualizarDia(dia.id, d),
      'Dia atualizado.',
    );
  }

  protected excluirDia(dia: Dia): void {
    void this.excluir(
      'Excluir dia?',
      `"${dia.label}" e todos os seus itens e progresso serão apagados.`,
      () => this.planoService.excluirDia(dia.id),
      'Dia excluído.',
    );
  }

  // ---- itens ----

  protected novoItem(dia: Dia): void {
    void this.formulario<Item, ItemDados>(
      ItemFormDialogComponent,
      undefined,
      (d) => this.planoService.criarItem(dia.id, d),
      'Item criado.',
    );
  }

  protected editarItem(item: Item): void {
    void this.formulario<Item, ItemDados>(
      ItemFormDialogComponent,
      item,
      (d) => this.planoService.atualizarItem(item.id, d),
      'Item atualizado.',
    );
  }

  protected excluirItem(item: Item): void {
    void this.excluir(
      'Excluir item?',
      `"${item.descricao}" e o progresso registrado nele serão apagados.`,
      () => this.planoService.excluirItem(item.id),
      'Item excluído.',
    );
  }

  // ---- infraestrutura de dialogs ----

  private async formulario<V, D>(
    componente: ComponentType<unknown>,
    valor: V | undefined,
    salvar: (dados: D) => Promise<void>,
    mensagemSucesso: string,
    extra: object = {},
  ): Promise<void> {
    const dados: FormDialogData<V, D> = { valor, salvar, ...extra };
    const salvou = await firstValueFrom(
      this.dialog
        .open<unknown, FormDialogData<V, D>, boolean>(componente, {
          data: dados,
          maxWidth: '94vw',
          autoFocus: 'first-tabbable',
        })
        .afterClosed(),
    );
    if (!salvou) return;
    this.snackBar.open(mensagemSucesso, 'Fechar', { duration: 3500 });
    await this.recarregar();
  }

  private async excluir(
    titulo: string,
    mensagem: string,
    acao: () => Promise<void>,
    mensagemSucesso: string,
  ): Promise<void> {
    const dados: ConfirmDialogData = {
      titulo,
      mensagem: `${mensagem} Essa ação não pode ser desfeita.`,
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
      await acao();
      this.snackBar.open(mensagemSucesso, 'Fechar', { duration: 3500 });
      await this.recarregar();
    } catch (e) {
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível excluir.', 'Fechar', {
        duration: 6000,
      });
    }
  }

  /** Recarrega a árvore sem trocar a tela por um spinner (preserva painéis abertos). */
  private async recarregar(): Promise<void> {
    try {
      this.semanas.set(await this.planoService.carregar(this.blocoId()));
    } catch (e) {
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível atualizar.', 'Fechar', {
        duration: 6000,
      });
    }
  }
}
