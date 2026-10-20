import { FunctionsHttpError } from '@supabase/supabase-js';

/**
 * Mensagem em português para um erro de `functions.invoke`. As Edge Functions do projeto devolvem
 * `{ erro: "..." }` com o status HTTP adequado; um 404 sem esse corpo significa função não publicada.
 */
export async function mensagemDaFuncao(erro: unknown, funcao: string): Promise<string> {
  if (erro instanceof FunctionsHttpError) {
    const mensagem = await corpoComErro(erro);
    if (mensagem) return mensagem;
    if (erro.context.status === 404) {
      return `A função "${funcao}" ainda não foi publicada no Supabase.`;
    }
  }
  console.error(`Erro ao chamar ${funcao}`, erro);
  return 'Não foi possível concluir a operação. Tente novamente.';
}

async function corpoComErro(erro: FunctionsHttpError): Promise<string | null> {
  try {
    const corpo = (await erro.context.clone().json()) as { erro?: string };
    return corpo.erro ?? null;
  } catch {
    return null;
  }
}
