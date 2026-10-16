import { DiaSemanaPipe } from './dia-semana.pipe';
import { MinutosParaTempoPipe } from './minutos-para-tempo.pipe';

describe('MinutosParaTempoPipe', () => {
  const pipe = new MinutosParaTempoPipe();

  it('formata horas e minutos', () => {
    expect(pipe.transform(90)).toBe('1h30');
    expect(pipe.transform(125)).toBe('2h05');
  });

  it('omite os minutos quando a hora é exata', () => {
    expect(pipe.transform(60)).toBe('1h');
    expect(pipe.transform(180)).toBe('3h');
  });

  it('mostra só minutos abaixo de uma hora', () => {
    expect(pipe.transform(45)).toBe('45min');
  });

  it('retorna vazio para valores ausentes ou não positivos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(0)).toBe('');
    expect(pipe.transform(-5)).toBe('');
  });
});

describe('DiaSemanaPipe', () => {
  const pipe = new DiaSemanaPipe();

  it('traduz a abreviação para o nome do dia', () => {
    expect(pipe.transform('seg')).toBe('Segunda');
    expect(pipe.transform('sab')).toBe('Sábado');
    expect(pipe.transform('dom')).toBe('Domingo');
  });

  it('retorna vazio para valores desconhecidos', () => {
    expect(pipe.transform('xyz')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});
