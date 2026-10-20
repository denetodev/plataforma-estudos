/**
 * Recuperação de senha por e-mail ("Esqueci minha senha") exige SMTP configurado no Supabase.
 * Enquanto estiver desligada, o login orienta o usuário a pedir a redefinição ao administrador
 * (Administração → Usuários → Redefinir senha, que não depende de e-mail).
 */
export const RECUPERACAO_POR_EMAIL = false;

/**
 * Nome (slug) da Edge Function de geração de plano no Supabase. O editor do painel pode ter
 * publicado o código com um nome automático (como "smart-worker"); como o slug não pode ser
 * renomeado, o app chama pelo nome configurado aqui. Se publicar de novo como "gerar-plano"
 * (por exemplo pela CLI), basta trocar o valor.
 */
export const FUNCAO_GERAR_PLANO = 'smart-worker';
