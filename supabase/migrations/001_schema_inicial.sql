-- ============================================================
-- PLATAFORMA DE ESTUDOS — Schema Inicial
-- Aplicar no SQL Editor do Supabase (projeto: plataforma-estudos)
-- ============================================================

-- ------------------------------------------------------------
-- PERFIS (extensão do auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfis (
  id         uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome       text NOT NULL,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helper de RLS: SECURITY DEFINER evita recursão infinita nas policies de 'perfis'
-- (uma policy de perfis que consulta perfis dispara "infinite recursion detected in policy").
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin');
$$;

-- Trigger: cria perfil automaticamente após cadastro no Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO perfis (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------
-- CONCURSOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS concursos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES perfis ON DELETE CASCADE,
  nome       text NOT NULL,   -- ex: "INSS 2026 - Técnico do Seguro Social"
  orgao      text,            -- ex: "INSS"
  cargo      text,            -- ex: "Técnico do Seguro Social"
  nivel      text,            -- ex: "Médio" | "Superior"
  data_prova date,            -- null enquanto não divulgada
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- BLOCOS (agrupamento temático por concurso)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concurso_id uuid NOT NULL REFERENCES concursos ON DELETE CASCADE,
  ordem       int NOT NULL,
  titulo      text NOT NULL,        -- ex: "Bloco 1 · Língua Portuguesa"
  cor         text DEFAULT '#6366f1', -- cor hex para identificação visual
  data_inicio date,
  data_fim    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- SEMANAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semanas (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloco_id uuid NOT NULL REFERENCES blocos ON DELETE CASCADE,
  ordem    int NOT NULL,
  label    text NOT NULL,   -- ex: "Semana 1 · 10–14 nov"
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- DIAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dias (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_id  uuid NOT NULL REFERENCES semanas ON DELETE CASCADE,
  ordem      int NOT NULL,
  label      text NOT NULL,      -- ex: "Segunda · 10/nov"
  dia_semana text CHECK (dia_semana IN ('seg','ter','qua','qui','sex','sab','dom')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ITENS DE ESTUDO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_id      uuid NOT NULL REFERENCES dias ON DELETE CASCADE,
  ordem       int NOT NULL,
  descricao   text NOT NULL,
  tipo        text CHECK (tipo IN ('revisao','leitura','questoes','lei','video','redacao','exercicio')),
  duracao_min int,
  fonte       text,     -- ex: "APCON p.3-15" | "NAP p.20"
  paginas     text,     -- range legível: "3-15"
  tags        text[],   -- ['apcon','nap','questoes','pomodoro']
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PROGRESSO (user × item)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progresso (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES perfis ON DELETE CASCADE,
  item_id      uuid NOT NULL REFERENCES itens ON DELETE CASCADE,
  concluido    boolean NOT NULL DEFAULT false,
  concluido_em timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

-- Perfis: cada user vê apenas o próprio
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfil_proprio" ON perfis
  FOR ALL USING (id = auth.uid());
CREATE POLICY "admin_perfis" ON perfis
  FOR ALL USING (
    public.is_admin()
  );

-- Concursos: user vê os próprios; admin vê todos
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "concurso_proprio" ON concursos
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_concursos" ON concursos
  FOR ALL USING (
    public.is_admin()
  );

-- Blocos, semanas, dias, itens: herdado via concurso
ALTER TABLE blocos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocos_via_concurso" ON blocos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM concursos c
      WHERE c.id = blocos.concurso_id
        AND (c.user_id = auth.uid() OR
             public.is_admin())
    )
  );

ALTER TABLE semanas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "semanas_via_bloco" ON semanas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blocos b
      JOIN concursos c ON c.id = b.concurso_id
      WHERE b.id = semanas.bloco_id
        AND (c.user_id = auth.uid() OR
             public.is_admin())
    )
  );

ALTER TABLE dias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dias_via_semana" ON dias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM semanas s
      JOIN blocos b ON b.id = s.bloco_id
      JOIN concursos c ON c.id = b.concurso_id
      WHERE s.id = dias.semana_id
        AND (c.user_id = auth.uid() OR
             public.is_admin())
    )
  );

ALTER TABLE itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itens_via_dia" ON itens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dias d
      JOIN semanas s ON s.id = d.semana_id
      JOIN blocos b ON b.id = s.bloco_id
      JOIN concursos c ON c.id = b.concurso_id
      WHERE d.id = itens.dia_id
        AND (c.user_id = auth.uid() OR
             public.is_admin())
    )
  );

-- Progresso: user vê o próprio; admin vê todos
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progresso_proprio" ON progresso
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "admin_progresso" ON progresso
  FOR ALL USING (
    public.is_admin()
  );

-- ------------------------------------------------------------
-- VIEW ÚTIL: progresso agregado por bloco
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW view_progresso_blocos WITH (security_invoker = true) AS
SELECT
  b.id AS bloco_id,
  b.titulo AS bloco_titulo,
  b.concurso_id,
  COUNT(i.id) AS total_itens,
  COUNT(pr.id) FILTER (WHERE pr.concluido = true) AS itens_concluidos,
  ROUND(
    COUNT(pr.id) FILTER (WHERE pr.concluido = true)::numeric
    / NULLIF(COUNT(i.id), 0) * 100, 1
  ) AS percentual
FROM blocos b
JOIN semanas s ON s.bloco_id = b.id
JOIN dias d ON d.semana_id = s.id
JOIN itens i ON i.dia_id = d.id
LEFT JOIN progresso pr ON pr.item_id = i.id
GROUP BY b.id, b.titulo, b.concurso_id;
