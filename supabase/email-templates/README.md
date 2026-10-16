# Templates de e-mail (Supabase Auth)

O Supabase não lê estes arquivos sozinho: cole o conteúdo no painel.

**Authentication → Email Templates**

| Template no painel | Arquivo | Assunto sugerido |
|---|---|---|
| Confirm signup | `confirmar-cadastro.html` | Confirme seu cadastro na Plataforma de Estudos |
| Reset password | `recuperar-senha.html` | Recupere sua senha da Plataforma de Estudos |

Variáveis usadas: `{{ .ConfirmationURL }}` (link do botão) e `{{ .Email }}`.

## Remetente e entrega

Para o e-mail sair com o nome "Plataforma de Estudos" e chegar a qualquer pessoa, configure um SMTP próprio em
**Project Settings → Authentication → SMTP Settings** (Resend, Brevo, Gmail etc.). O SMTP padrão do Supabase é só para testes.

## URLs

Em **Authentication → URL Configuration**: *Site URL* = URL da Vercel e, em *Redirect URLs*,
`<url-da-vercel>/redefinir-senha` e `<url-da-vercel>/login`.
