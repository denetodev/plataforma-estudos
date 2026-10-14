/**
 * Dados de um dialog de formulário. O dialog chama `salvar` e só fecha em caso de sucesso,
 * mantendo o que o usuário digitou se a gravação falhar.
 */
export interface FormDialogData<TValor, TDados> {
  /** Registro existente (edição); ausente na criação. */
  valor?: TValor;
  salvar: (dados: TDados) => Promise<void>;
}
