import { dataParaIso, isoParaData } from './data';

describe('utilitários de data', () => {
  it('isoParaData cria a data no dia local (sem deslocar por UTC)', () => {
    const data = isoParaData('2026-11-10')!;
    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(10);
    expect(data.getDate()).toBe(10);
  });

  it('dataParaIso usa o dia local', () => {
    expect(dataParaIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('faz o caminho de ida e volta sem alterar o dia', () => {
    for (const iso of ['2026-01-01', '2026-03-29', '2026-12-31']) {
      expect(dataParaIso(isoParaData(iso))).toBe(iso);
    }
  });

  it('trata valores vazios ou inválidos', () => {
    expect(isoParaData(null)).toBeNull();
    expect(isoParaData('')).toBeNull();
    expect(dataParaIso(null)).toBeNull();
    expect(dataParaIso(new Date('inválida'))).toBeNull();
  });
});
