import { Pipe, PipeTransform } from '@angular/core';

import { DIAS_SEMANA } from '../models/dia.model';

/** "seg" → "Segunda". */
@Pipe({ name: 'diaSemana' })
export class DiaSemanaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return DIAS_SEMANA.find((d) => d.valor === valor)?.rotulo ?? '';
  }
}
