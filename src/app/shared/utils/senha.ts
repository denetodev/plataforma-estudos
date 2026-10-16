/** Sem caracteres ambíguos (0/O, 1/l/I) para a senha ser fácil de repassar. */
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Senha aleatória criptograficamente segura. */
export function gerarSenha(tamanho = 12): string {
  const sorteio = crypto.getRandomValues(new Uint32Array(tamanho));
  return Array.from(sorteio, (n) => ALFABETO[n % ALFABETO.length]).join('');
}
