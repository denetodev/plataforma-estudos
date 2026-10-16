-- ============================================================
-- Segurança dos perfis: impede escalada de privilégio
--
-- Problema na 001: a policy "perfil_proprio" era FOR ALL sem restrição de colunas,
-- então qualquer usuário logado podia fazer, pela API pública:
--   PATCH /rest/v1/perfis?id=eq.<seu-id>   { "role": "admin" }
-- e virar administrador (vendo/editando dados de todos).
--
-- Correção:
--   1. O usuário comum só pode LER e ATUALIZAR o próprio perfil (não inserir/excluir).
--   2. Um trigger bloqueia a troca de `role` por quem não é admin.
--      Chamadas sem usuário (SQL Editor, Edge Function com service role) continuam livres,
--      então `UPDATE perfis SET role = 'admin' ...` no SQL Editor segue funcionando.
-- ============================================================

DROP POLICY IF EXISTS "perfil_proprio" ON perfis;
DROP POLICY IF EXISTS "perfil_ler_proprio" ON perfis;
DROP POLICY IF EXISTS "perfil_atualizar_proprio" ON perfis;

CREATE POLICY "perfil_ler_proprio" ON perfis
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "perfil_atualizar_proprio" ON perfis
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.proteger_role_perfil()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar o papel de um usuário.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proteger_role_perfil ON perfis;
CREATE TRIGGER proteger_role_perfil
  BEFORE UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION public.proteger_role_perfil();
