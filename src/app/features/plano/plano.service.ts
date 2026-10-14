import { Injectable, inject } from '@angular/core';

import { SupabaseService } from '../../core/supabase/supabase.service';
import { DiaDados } from '../../shared/models/dia.model';
import { ItemDados } from '../../shared/models/item.model';
import { SemanaCompleta, SemanaDados } from '../../shared/models/semana.model';

type Tabela = 'semanas' | 'dias' | 'itens';

/** Semanas → dias → itens de um bloco. */
@Injectable({ providedIn: 'root' })
export class PlanoService {
  private readonly supabase = inject(SupabaseService);

  /** Árvore completa do bloco em uma única consulta, ordenada em todos os níveis. */
  async carregar(blocoId: string): Promise<SemanaCompleta[]> {
    const { data, error } = await this.supabase.client
      .from('semanas')
      .select('*, dias(*, itens(*))')
      .eq('bloco_id', blocoId)
      .order('ordem', { ascending: true })
      .order('ordem', { referencedTable: 'dias', ascending: true })
      .order('ordem', { referencedTable: 'dias.itens', ascending: true })
      .returns<SemanaCompleta[]>();
    if (error) throw this.erro('Não foi possível carregar o plano de estudos.', error);
    return data ?? [];
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
