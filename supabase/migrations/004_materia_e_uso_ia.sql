-- ============================================================
-- 004 · Matéria nos itens + controle de uso da IA
-- ============================================================

-- Matéria (disciplina) de cada item de estudo: permite um bloco com várias matérias,
-- com filtro e cor por matéria na tela do plano.
ALTER TABLE itens ADD COLUMN IF NOT EXISTS materia text;

ALTER TABLE itens DROP CONSTRAINT IF EXISTS itens_materia_tamanho;
ALTER TABLE itens
  ADD CONSTRAINT itens_materia_tamanho CHECK (materia IS NULL OR char_length(materia) <= 60);

-- Cada chamada à IA (Edge Function gerar-plano) registra uma linha aqui; a função usa a
-- contagem das últimas 24h para aplicar o limite diário por usuário.
CREATE TABLE IF NOT EXISTS uso_ia (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES perfis ON DELETE CASCADE,
  provedor   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uso_ia_user_data_idx ON uso_ia (user_id, created_at DESC);

ALTER TABLE uso_ia ENABLE ROW LEVEL SECURITY;

-- O usuário só consegue LER o próprio uso. Não há policy de INSERT/UPDATE/DELETE:
-- só a Edge Function (chave de serviço, que ignora o RLS) grava, então o limite não é burlável.
DROP POLICY IF EXISTS "uso_ia_proprio" ON uso_ia;
CREATE POLICY "uso_ia_proprio" ON uso_ia FOR SELECT USING (user_id = auth.uid());
