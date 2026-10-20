import { Injectable, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { DiaComItens, DiaDados } from '../../shared/models/dia.model';
import { Item, ItemDados } from '../../shared/models/item.model';
import { SemanaCompleta, SemanaDados } from '../../shared/models/semana.model';
import { dataParaIso } from '../../shared/utils/data';
import { PlanoGerado } from './ia/ia.service';

type Tabela = 'semanas' | 'dias' | 'itens';

export interface Ordenavel {
  id: string;
  ordem: number;
}

/** Formato bruto da consulta: itens trazem a linha de progresso embutida. */
type SemanaComProgresso = Omit<SemanaCompleta, 'dias'> & {
  dias: (Omit<DiaComItens, 'itens'> & {
    itens: (Omit<Item, 'concluido'> & { progresso: { concluido: boolean }[] | null })[];
  })[];
};

/** Semanas → dias → itens de um bloco. */
@Injectable({ providedIn: 'root' })
export class PlanoService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  /**
   * Árvore completa do bloco em uma única consulta, ordenada em todos os níveis,
   * com o progresso do usuário logado em cada item.
   */
  async carregar(blocoId: string): Promise<SemanaCompleta[]> {
    const usuarioId = this.usuarioId();
    const { data, error } = await this.supabase.client
      .from('semanas')
      .select('*, dias(*, itens(*, progresso(concluido)))')
      .eq('bloco_id', blocoId)
      // Filtra só as linhas embutidas de progresso (sem !inner, não remove itens).
      .eq('dias.itens.progresso.user_id', usuarioId)
      .order('ordem', { ascending: true })
      .order('ordem', { referencedTable: 'dias', ascending: true })
      .order('ordem', { referencedTable: 'dias.itens', ascending: true })
      .returns<SemanaComProgresso[]>();
    if (error) throw this.erro('Não foi possível carregar o plano de estudos.', error);

    return (data ?? []).map((semana) => ({
      ...semana,
      dias: semana.dias.map((dia) => ({
        ...dia,
        itens: dia.itens.map(({ progresso, ...item }) => ({
          ...item,
          concluido: progresso?.[0]?.concluido ?? false,
        })),
      })),
    }));
  }

  /** Marca/desmarca um item para o usuário logado (um registro por usuário × item). */
  async marcarItem(itemId: string, concluido: boolean): Promise<void> {
    const { error } = await this.supabase.client.from('progresso').upsert(
      {
        user_id: this.usuarioId(),
        item_id: itemId,
        concluido,
        concluido_em: concluido ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,item_id' },
    );
    if (error) throw this.erro('Não foi possível salvar o progresso.', error);
  }

  // Semanas
  async criarSemana(blocoId: string, dados: SemanaDados): Promise<void> {
    const ordem = await this.proximaOrdem('semanas', 'bloco_id', blocoId);
    await this.inserir('semanas', { ...dados, bloco_id: blocoId, ordem }, 'criar a semana');
  }

  atualizarSemana(id: string, dados: SemanaDados): Promise<void> {
    return this.atualizar('semanas', id, dados, 'salvar a semana');
  }

  excluirSemana(id: string): Promise<void> {
    return this.excluir('semanas', id, 'excluir a semana');
  }

  // Dias
  async criarDia(semanaId: string, dados: DiaDados): Promise<void> {
    const ordem = await this.proximaOrdem('dias', 'semana_id', semanaId);
    await this.inserir('dias', { ...dados, semana_id: semanaId, ordem }, 'criar o dia');
  }

  atualizarDia(id: string, dados: DiaDados): Promise<void> {
    return this.atualizar('dias', id, dados, 'salvar o dia');
  }

  excluirDia(id: string): Promise<void> {
    return this.excluir('dias', id, 'excluir o dia');
  }

  // Itens
  async criarItem(diaId: string, dados: ItemDados): Promise<void> {
    const ordem = await this.proximaOrdem('itens', 'dia_id', diaId);
    await this.inserir('itens', { ...dados, dia_id: diaId, ordem }, 'criar o item');
  }

  atualizarItem(id: string, dados: ItemDados): Promise<void> {
    return this.atualizar('itens', id, dados, 'salvar o item');
  }

  excluirItem(id: string): Promise<void> {
    return this.excluir('itens', id, 'excluir o item');
  }

  /**
   * Grava o plano gerado pela IA (semanas → dias → itens) no bloco, ao final das semanas existentes.
   * Não há transação no cliente: se algo falhar no meio, as semanas já criadas são removidas
   * (dias e itens saem junto, por cascata) para não deixar um plano pela metade.
   */
  async criarPlanoGerado(blocoId: string, plano: PlanoGerado, inicio: Date | null): Promise<void> {
    const primeiraOrdem = await this.proximaOrdem('semanas', 'bloco_id', blocoId);
    const semanasCriadas: string[] = [];

    try {
      const periodo = (indice: number): { data_inicio: string | null; data_fim: string | null } => {
        if (!inicio) return { data_inicio: null, data_fim: null };
        const dia = (extra: number) =>
          dataParaIso(new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice * 7 + extra));
        return { data_inicio: dia(0), data_fim: dia(6) };
      };

      const { data: semanas, error: erroSemanas } = await this.supabase.client
        .from('semanas')
        .insert(
          plano.semanas.map((s, i) => ({
            bloco_id: blocoId,
            ordem: primeiraOrdem + i,
            label: s.label,
            ...periodo(i),
          })),
        )
        .select('id, ordem')
        .returns<{ id: string; ordem: number }[]>();
      if (erroSemanas || !semanas) throw this.erro('Não foi possível criar as semanas do plano.', erroSemanas);
      semanasCriadas.push(...semanas.map((s) => s.id));
      const semanaPorOrdem = new Map(semanas.map((s) => [s.ordem, s.id]));

      const { data: dias, error: erroDias } = await this.supabase.client
        .from('dias')
        .insert(
          plano.semanas.flatMap((s, i) =>
            s.dias.map((d, j) => ({
              semana_id: semanaPorOrdem.get(primeiraOrdem + i),
              ordem: j + 1,
              label: d.label,
              dia_semana: d.dia_semana,
            })),
          ),
        )
        .select('id, semana_id, ordem')
        .returns<{ id: string; semana_id: string; ordem: number }[]>();
      if (erroDias || !dias) throw this.erro('Não foi possível criar os dias do plano.', erroDias);
      const diaPorChave = new Map(dias.map((d) => [`${d.semana_id}:${d.ordem}`, d.id]));

      const { error: erroItens } = await this.supabase.client.from('itens').insert(
        plano.semanas.flatMap((s, i) =>
          s.dias.flatMap((d, j) =>
            d.itens.map((item, k) => ({
              dia_id: diaPorChave.get(`${semanaPorOrdem.get(primeiraOrdem + i)}:${j + 1}`),
              ordem: k + 1,
              ...item,
            })),
          ),
        ),
      );
      if (erroItens) throw this.erro('Não foi possível criar os itens do plano.', erroItens);
    } catch (e) {
      if (semanasCriadas.length > 0) {
        await this.supabase.client.from('semanas').delete().in('id', semanasCriadas);
      }
      throw e;
    }
  }

  /**
   * Troca a posição de dois irmãos. São duas gravações; se a segunda falhar, tenta desfazer a
   * primeira para não deixar duas linhas com a mesma ordem.
   */
  async trocarOrdem(tabela: Tabela, a: Ordenavel, b: Ordenavel): Promise<void> {
    await this.atualizar(tabela, a.id, { ordem: b.ordem }, 'reordenar');
    try {
      await this.atualizar(tabela, b.id, { ordem: a.ordem }, 'reordenar');
    } catch (e) {
      await this.atualizar(tabela, a.id, { ordem: a.ordem }, 'reordenar').catch(() => undefined);
      throw e;
    }
  }

  private usuarioId(): string {
    const id = this.auth.user()?.id;
    if (!id) throw new Error('Sua sessão expirou. Entre novamente.');
    return id;
  }

  private async proximaOrdem(tabela: Tabela, colunaPai: string, paiId: string): Promise<number> {
    const { data, error } = await this.supabase.client
      .from(tabela)
      .select('ordem')
      .eq(colunaPai, paiId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle<{ ordem: number }>();
    if (error) throw this.erro('Não foi possível calcular a ordem do novo registro.', error);
    return (data?.ordem ?? 0) + 1;
  }

  private async inserir(tabela: Tabela, linha: object, acao: string): Promise<void> {
    const { error } = await this.supabase.client.from(tabela).insert(linha);
    if (error) throw this.erro(`Não foi possível ${acao}.`, error);
  }

  private async atualizar(tabela: Tabela, id: string, dados: object, acao: string): Promise<void> {
    const { error } = await this.supabase.client.from(tabela).update(dados).eq('id', id);
    if (error) throw this.erro(`Não foi possível ${acao}.`, error);
  }

  private async excluir(tabela: Tabela, id: string, acao: string): Promise<void> {
    const { error } = await this.supabase.client.from(tabela).delete().eq('id', id);
    if (error) throw this.erro(`Não foi possível ${acao}.`, error);
  }

  private erro(mensagem: string, causa: unknown): Error {
    console.error(mensagem, causa);
    return new Error(mensagem);
  }
}
