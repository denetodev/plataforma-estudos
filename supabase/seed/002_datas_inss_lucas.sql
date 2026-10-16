-- ============================================================
-- Datas das semanas do cronograma INSS (Lucas)
--
-- Rode DEPOIS de 001_inss_lucas.sql (e da migration 002_semanas_periodo.sql).
--
-- O seed cria as semanas sem período; sem datas elas não aparecem em "Hoje" nem no
-- cronograma semanal. Este script distribui as semanas em sequência (uma por semana
-- corrida, de segunda a domingo), na ordem dos blocos, a partir de `inicio`.
--
-- Por padrão começa na próxima segunda-feira. Para outra data, troque o valor de `inicio`
-- (use sempre uma segunda-feira). Depois, ajuste semanas específicas pelo app (editar semana).
-- Pode ser executado de novo: ele apenas recalcula as datas.
-- ============================================================

DO $$
DECLARE
  lucas_id uuid := '4a0cdf13-789c-43c9-9fae-6d425dceac0f';          -- Lucas Corsino
  inicio   date := (date_trunc('week', current_date) + interval '7 days')::date; -- próxima segunda
  total    int;
BEGIN
  WITH ordenadas AS (
    SELECT s.id, row_number() OVER (ORDER BY b.ordem, s.ordem) - 1 AS n
    FROM semanas s
    JOIN blocos b ON b.id = s.bloco_id
    JOIN concursos c ON c.id = b.concurso_id
    WHERE c.user_id = lucas_id
      AND c.nome = 'INSS 2026 — Técnico do Seguro Social'
  )
  UPDATE semanas s
  SET data_inicio = inicio + (o.n * 7)::int,
      data_fim    = inicio + (o.n * 7 + 6)::int
  FROM ordenadas o
  WHERE s.id = o.id;

  GET DIAGNOSTICS total = ROW_COUNT;
  IF total = 0 THEN
    RAISE EXCEPTION 'Nenhuma semana encontrada. Rode 001_inss_lucas.sql antes.';
  END IF;
  RAISE NOTICE '% semanas datadas a partir de %', total, inicio;
END $$;
