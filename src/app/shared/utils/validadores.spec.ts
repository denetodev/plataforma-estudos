import { FormControl, FormGroup } from '@angular/forms';

import { senhasIguais } from './validadores';

describe('senhasIguais', () => {
  const grupo = (nova: string, confirmacao: string) =>
    new FormGroup({ novaSenha: new FormControl(nova), confirmacao: new FormControl(confirmacao) });

  it('aceita senhas iguais', () => {
    expect(senhasIguais(grupo('abc12345', 'abc12345'))).toBeNull();
  });

  it('rejeita senhas diferentes', () => {
    expect(senhasIguais(grupo('abc12345', 'abc12346'))).toEqual({ senhasDiferentes: true });
  });

  it('não acusa erro enquanto a confirmação está vazia', () => {
    expect(senhasIguais(grupo('abc12345', ''))).toBeNull();
  });
});
