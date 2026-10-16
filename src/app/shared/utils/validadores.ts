import { AbstractControl, ValidationErrors } from '@angular/forms';

export const TAMANHO_MIN_SENHA = 8;

/** Valida que `novaSenha` e `confirmacao` do grupo são iguais. */
export function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const nova = grupo.get('novaSenha')?.value as string;
  const confirmacao = grupo.get('confirmacao')?.value as string;
  return confirmacao && nova !== confirmacao ? { senhasDiferentes: true } : null;
}
