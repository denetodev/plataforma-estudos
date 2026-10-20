/**
 * Cor estável para uma matéria (mesmo nome → mesma cor, sem cadastro prévio).
 * Ignora maiúsculas, acentos e espaços extras para "Português" e "portugues " coincidirem.
 */
export function corDaMateria(materia: string): string {
  const chave = materia
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

  let hash = 0;
  for (let i = 0; i < chave.length; i++) {
    hash = (hash * 31 + chave.charCodeAt(i)) >>> 0;
  }
  return `hsl(${hash % 360} 62% 48%)`;
}
