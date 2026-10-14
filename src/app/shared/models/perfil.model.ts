export type PerfilRole = 'admin' | 'user';

export interface Perfil {
  id: string;
  nome: string;
  role: PerfilRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
