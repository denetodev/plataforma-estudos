/**
 * Recuperação de senha por e-mail ("Esqueci minha senha") exige SMTP configurado no Supabase.
 * Enquanto estiver desligada, o login orienta o usuário a pedir a redefinição ao administrador
 * (Administração → Usuários → Redefinir senha, que não depende de e-mail).
 */
export const RECUPERACAO_POR_EMAIL = false;
