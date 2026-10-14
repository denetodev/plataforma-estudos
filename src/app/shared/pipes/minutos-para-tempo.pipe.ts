import { Pipe, PipeTransform } from '@angular/core';

/** 90 → "1h30", 60 → "1h", 45 → "45min". */
@Pipe({ name: 'minutosParaTempo' })
export class MinutosParaTempoPipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if (!minutos || minutos <= 0) return '';
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    if (horas === 0) return `${resto}min`;
    return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
  }
}
