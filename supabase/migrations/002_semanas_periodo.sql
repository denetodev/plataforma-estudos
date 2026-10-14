-- ============================================================
-- Período (início/fim) das semanas, escolhido no calendário
-- ============================================================
ALTER TABLE semanas
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_fim    date;

ALTER TABLE semanas
  DROP CONSTRAINT IF EXISTS semanas_periodo_valido;
ALTER TABLE semanas
  ADD CONSTRAINT semanas_periodo_valido
  CHECK (data_inicio IS NULL OR data_fim IS NULL OR data_fim >= data_inicio);
