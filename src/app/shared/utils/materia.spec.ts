import { corDaMateria } from './materia';

describe('corDaMateria', () => {
  it('é estável: o mesmo nome sempre gera a mesma cor', () => {
    expect(corDaMateria('Língua Portuguesa')).toBe(corDaMateria('Língua Portuguesa'));
  });

  it('ignora maiúsculas, acentos e espaços nas pontas', () => {
    expect(corDaMateria('  LINGUA portuguesa ')).toBe(corDaMateria('Língua Portuguesa'));
  });

  it('gera cores diferentes para matérias diferentes', () => {
    const cores = new Set(['Português', 'Matemática', 'Informática', 'Direito Constitucional'].map(corDaMateria));
    expect(cores.size).toBeGreaterThan(1);
  });

  it('devolve uma cor hsl válida', () => {
    expect(corDaMateria('Qualquer')).toMatch(/^hsl\(\d{1,3} 62% 48%\)$/);
  });
});
