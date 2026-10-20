import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';

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
  // O navegador não conseguiu completar a chamada. O caso típico é a função não existir no projeto:
  // o gateway responde 404 ao preflight (OPTIONS) e o navegador bloqueia a requisição (CORS).
  if (erro instanceof FunctionsFetchError) {
    console.error(`Falha de rede/CORS ao chamar ${funcao}`, erro);
    return `Não foi possível chamar a função "${funcao}". Verifique a conexão e se ela está publicada no Supabase.`;
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
