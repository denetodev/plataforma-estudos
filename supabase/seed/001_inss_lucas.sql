-- ============================================================
-- SEED — Cronograma INSS 2026 (Lucas)
-- INSS · Técnico do Seguro Social · Nível Médio · Apostila APCON
--
-- INSTRUÇÕES:
-- 1. Aplique primeiro o schema (001_schema_inicial.sql)
-- 2. Crie o usuário do Lucas no Supabase Auth (Authentication > Users)
-- 3. O UUID do Lucas já está preenchido abaixo (confira em perfis / Authentication > Users)
-- 4. Execute este script no SQL Editor do Supabase (uma única vez)
-- ============================================================

DO $$
DECLARE
  lucas_id    uuid := '4a0cdf13-789c-43c9-9fae-6d425dceac0f'; -- Lucas Corsino (perfis.id)
  concurso_id uuid;

  -- Blocos
  b_lp     uuid; -- Língua Portuguesa
  b_esp    uuid; -- Conhecimentos Específicos (Seguridade Social)
  b_dir    uuid; -- Direito Constitucional + Administrativo
  b_etica  uuid; -- Ética + Informática + Raciocínio Lógico
  b_rev    uuid; -- Revisão Cruzada
  b_sprint uuid; -- Sprint Final

  -- Semanas genéricas
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
  s6 uuid; s7 uuid; s8 uuid; s9 uuid; s10 uuid;
  s11 uuid; s12 uuid; s13 uuid; s14 uuid;

  -- Dias genéricos
  d1 uuid; d2 uuid; d3 uuid; d4 uuid; d5 uuid;

BEGIN

  IF NOT EXISTS (SELECT 1 FROM perfis WHERE id = lucas_id) THEN
    RAISE EXCEPTION 'Perfil % não encontrado. O usuário precisa se cadastrar antes de rodar o seed.', lucas_id;
  END IF;

  -- Evita duplicar o cronograma se o script for executado mais de uma vez
  IF EXISTS (
    SELECT 1 FROM concursos
    WHERE user_id = lucas_id AND nome = 'INSS 2026 — Técnico do Seguro Social'
  ) THEN
    RAISE EXCEPTION 'O concurso INSS 2026 já existe para este usuário; seed não executado.';
  END IF;

  -- O nome do perfil é o que a própria pessoa informou no cadastro; não é sobrescrito aqui.

  -- --------------------------------------------------------
  -- CONCURSO
  -- --------------------------------------------------------
  INSERT INTO concursos (user_id, nome, orgao, cargo, nivel, data_prova)
  VALUES (
    lucas_id,
    'INSS 2026 — Técnico do Seguro Social',
    'INSS',
    'Técnico do Seguro Social',
    'Médio',
    NULL -- data da prova não divulgada ainda
  ) RETURNING id INTO concurso_id;

  -- --------------------------------------------------------
  -- BLOCO 1: LÍNGUA PORTUGUESA
  -- Apostila APCON · Língua Portuguesa · p.1–58 + Redação p.1–?
  -- Estimativa: 3 semanas
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 1, 'Bloco 1 · Língua Portuguesa', '#3b82f6')
  RETURNING id INTO b_lp;

  -- Semana 1: Compreensão textual, Tipologia, Ortografia, Acentuação
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_lp, 1, 'Semana 1 · Língua Portuguesa I') RETURNING id INTO s1;

  -- Seg
  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s1, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Compreensão e interpretação de textos', 'leitura', 50, 'APCON · LP', '1-7', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Tipologia textual', 'leitura', 50, 'APCON · LP', '7-10', ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Compreensão textual', 'questoes', 45, 'APCON · LP', NULL, ARRAY['questoes']);

  -- Ter
  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s1, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Ortografia oficial', 'leitura', 50, 'APCON · LP', '11', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Acentuação gráfica', 'leitura', 50, 'APCON · LP', '11', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: Ortografia e Acentuação', 'questoes', 45, 'APCON · LP', NULL, ARRAY['questoes']);

  -- Qua
  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s1, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Emprego das classes de palavras', 'leitura', 50, 'APCON · LP', '11', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Emprego do sinal indicativo de crase', 'leitura', 50, 'APCON · LP', '30-37', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: Classes de palavras e Crase', 'questoes', 45, 'APCON · LP', NULL, ARRAY['questoes']);

  -- Qui
  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s1, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Sintaxe da oração e do período', 'leitura', 50, 'APCON · LP', '38', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Pontuação', 'leitura', 50, 'APCON · LP', '38', ARRAY['apcon','pomodoro']),
    (d4, 4, 'Questões: Sintaxe e Pontuação', 'questoes', 45, 'APCON · LP', NULL, ARRAY['questoes']);

  -- Sex
  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s1, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Concordância nominal e verbal', 'leitura', 50, 'APCON · LP', '40-43', ARRAY['apcon','pomodoro']),
    (d5, 3, '[POMODORO 2] Regências nominal e verbal', 'leitura', 50, 'APCON · LP', '43', ARRAY['apcon','pomodoro']),
    (d5, 4, 'Questões: Concordância e Regência', 'questoes', 45, 'APCON · LP', NULL, ARRAY['questoes']);

  -- Semana 2: Significação, Redação Oficial, revisão do bloco LP
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_lp, 2, 'Semana 2 · Língua Portuguesa II + Redação') RETURNING id INTO s2;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s2, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Significação das palavras', 'leitura', 50, 'APCON · LP', '46', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Correspondências oficiais — Manual de Redação da Presidência', 'leitura', 50, 'APCON · Redação', NULL, ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Significação + Redação Oficial', 'questoes', 45, 'APCON', NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s2, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Redação e Correspondências Oficiais — tipos e estrutura', 'leitura', 50, 'APCON · Redação', NULL, ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Prática de redação de ofício e memorando', 'redacao', 50, NULL, NULL, ARRAY['pomodoro','redacao']),
    (d2, 4, 'Questões: Redação Oficial', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s2, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Revisão: Compreensão textual + Tipologia + Ortografia', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 3, '[POMODORO 2] Revisão: Sintaxe + Concordância + Regência', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 4, 'Simulado LP (20 questões)', 'questoes', 45, NULL, NULL, ARRAY['questoes','simulado']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s2, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Gabarito comentado do simulado LP', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 3, '[POMODORO 2] Revisão: pontos de maior erro no simulado', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 4, 'Questões extras LP', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s2, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Mapa mental: LP completo', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Revisão final LP + Redação', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 4, 'Questões: LP + Redação mistas', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- --------------------------------------------------------
  -- BLOCO 2: CONHECIMENTOS ESPECÍFICOS — SEGURIDADE SOCIAL
  -- Apostila APCON · Conhecimentos Específicos · p.3–290
  -- MAIOR MATÉRIA do edital. Estimativa: 5 semanas
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 2, 'Bloco 2 · Seguridade Social (Conhecimentos Específicos)', '#10b981')
  RETURNING id INTO b_esp;

  -- Semana 3: Seguridade Social — fundamentos e RGPS
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_esp, 1, 'Semana 3 · Seguridade Social I — Fundamentos') RETURNING id INTO s3;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s3, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Origem, evolução e conceituação — Seguridade Social', 'leitura', 50, 'APCON · CE', '3-7', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Organização e princípios constitucionais', 'leitura', 50, 'APCON · CE', '7-13', ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Fundamentos da Seguridade', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s3, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Regime Geral de Previdência Social — conceito, filiação', 'leitura', 50, 'APCON · CE', '13-19', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Segurados obrigatórios: empregado, avulso, especial', 'leitura', 50, 'APCON · CE', '19-26', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: RGPS e Segurados', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s3, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Segurado facultativo — conceito e características', 'leitura', 50, 'APCON · CE', '25', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Trabalhadores excluídos do RGPS', 'leitura', 50, 'APCON · CE', '26', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: Tipos de segurado', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s3, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Financiamento da Seguridade — receitas da União', 'leitura', 50, 'APCON · CE', '27', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Contribuições sociais: segurados, empregadores', 'leitura', 50, 'APCON · CE', '27-41', ARRAY['apcon','pomodoro']),
    (d4, 4, 'Questões: Financiamento da Previdência', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s3, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Contribuições: limites mínimo e máximo, parcelas', 'leitura', 50, 'APCON · CE', '38-41', ARRAY['apcon','pomodoro']),
    (d5, 3, '[POMODORO 2] Arrecadação, recolhimento e competência INSS/RFB', 'leitura', 50, 'APCON · CE', '41-47', ARRAY['apcon','pomodoro']),
    (d5, 4, 'Questões: Contribuições e Arrecadação', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- Semana 4: Benefícios I (Aposentadorias e Salário)
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_esp, 2, 'Semana 4 · Seguridade Social II — Benefícios: Aposentadorias') RETURNING id INTO s4;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s4, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Prazo de recolhimento e obrigações da empresa', 'leitura', 50, 'APCON · CE', '47-56', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Decadência e prescrição + Reajustamento', 'leitura', 50, 'APCON · CE', '56-59', ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Obrigações da empresa e prazos', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s4, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Plano de Benefícios — beneficiários, espécies, carência', 'leitura', 50, 'APCON · CE', '60-73', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Manutenção, perda e restabelecimento do benefício', 'leitura', 50, 'APCON · CE', '72', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: Plano de Benefícios — conceitos gerais', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s4, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Serviço Social + Reabilitação Profissional', 'leitura', 50, 'APCON · CE', '73', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Benefício de prestação continuada — BPC/LOAS', 'leitura', 50, 'APCON · CE', '84-98', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: BPC/LOAS', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s4, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Benefícios especiais: Lei 7.070/82, ex-combatentes, hanseníase', 'leitura', 50, 'APCON · CE', '74-83', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Pensão por morte, auxílio-reclusão', 'leitura', 50, 'APCON · CE', '101-102', ARRAY['apcon','pomodoro']),
    (d4, 4, 'Questões: Benefícios especiais e pensão', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s4, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Auxílio-Inclusão + Seguro-desemprego pescador artesanal', 'leitura', 50, 'APCON · CE', '101-103', ARRAY['apcon','pomodoro']),
    (d5, 3, '[POMODORO 2] Certidão de Tempo de Contribuição + Compensação previdenciária', 'leitura', 50, 'APCON · CE', '113-114', ARRAY['apcon','pomodoro']),
    (d5, 4, 'Questões: Benefícios variados', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- Semana 5: Legislação Previdenciária (Leis e Decretos)
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_esp, 3, 'Semana 5 · Seguridade Social III — Legislação Previdenciária') RETURNING id INTO s5;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s5, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Lei 8.212/1991 e alterações (custeio)', 'lei', 50, 'APCON · CE', '114-121', ARRAY['apcon','lei','pomodoro']),
    (d1, 3, '[POMODORO 2] Lei 8.213/1991 e alterações (benefícios)', 'lei', 50, 'APCON · CE', '114-121', ARRAY['apcon','lei','pomodoro']),
    (d1, 4, 'Questões: Lei 8.212 e 8.213', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s5, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Lei 8.429/1992 — Improbidade Administrativa', 'lei', 50, 'APCON · CE', '121', ARRAY['apcon','lei','pomodoro']),
    (d2, 3, '[POMODORO 2] Lei 9.784/1999 — Processo Administrativo', 'lei', 50, 'APCON · CE', '121', ARRAY['apcon','lei','pomodoro']),
    (d2, 4, 'Questões: Leis de improbidade e processo adm.', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s5, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Regimes Próprios de Previdência Social — RPPS', 'leitura', 50, 'APCON · CE', '104', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Emendas Constitucionais 103/2019 e 142/2013', 'lei', 50, 'APCON · CE', '114-133', ARRAY['apcon','lei','pomodoro']),
    (d3, 4, 'Questões: RPPS e Emendas Constitucionais', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s5, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Servidor público: PRES/INSS, saúde e qualidade de vida', 'leitura', 50, 'APCON · CE', '187-288', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Instrução Normativa PRES/INSS 128/2022', 'lei', 50, 'APCON · CE', '288-290', ARRAY['apcon','lei','pomodoro']),
    (d4, 4, 'Questões: Legislação específica INSS', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s5, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Revisão: Seguridade Social I + II (fundamentos + benefícios)', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Revisão: Seguridade Social III (legislação)', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 4, 'Simulado Conhecimentos Específicos (30 questões)', 'questoes', 45, NULL, NULL, ARRAY['questoes','simulado']);

  -- Semanas 6 e 7: continuação CE (legislação extensa — 290 páginas de material)
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_esp, 4, 'Semana 6 · Seguridade Social IV — Legislação Complementar') RETURNING id INTO s6;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s6, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Gabarito comentado do simulado CE', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d1, 3, '[POMODORO 2] Lei Complementar 142/2013 — aposentadoria do deficiente', 'lei', 50, 'APCON · CE', '116', ARRAY['apcon','lei','pomodoro']),
    (d1, 4, 'Questões: LC 142 e legislação complementar', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s6, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Decreto 3.048/1999 e alterações — Regulamento da Previdência', 'lei', 50, 'APCON · CE', '134', ARRAY['apcon','lei','pomodoro']),
    (d2, 3, '[POMODORO 2] Decreto 6.214/2007 — BPC regulamentado', 'lei', 50, 'APCON · CE', '104', ARRAY['apcon','lei','pomodoro']),
    (d2, 4, 'Questões: Decreto 3.048 e BPC regulamentado', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s6, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Lei 14.176/2021 — LOAS atualizada', 'lei', 50, 'APCON · CE', '102', ARRAY['apcon','lei','pomodoro']),
    (d3, 3, '[POMODORO 2] Lei 8.742/1993 — LOAS original e alterações', 'lei', 50, 'APCON · CE', '101', ARRAY['apcon','lei','pomodoro']),
    (d3, 4, 'Questões: LOAS e assistência social', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s6, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Benefício de prestação continuada — concessão, manutenção, revisão', 'leitura', 50, 'APCON · CE', '84-100', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Seguro-desemprego e benefícios assistenciais variados', 'leitura', 50, 'APCON · CE', '83', ARRAY['apcon','pomodoro']),
    (d4, 4, 'Questões: BPC + Seguro-desemprego + Assistência', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s6, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Revisão geral: Seguridade Social completo', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Mapa mental: Seguridade Social', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 4, 'Simulado final CE (40 questões)', 'questoes', 45, NULL, NULL, ARRAY['questoes','simulado']);

  -- --------------------------------------------------------
  -- BLOCO 3: DIREITO CONSTITUCIONAL + DIREITO ADMINISTRATIVO
  -- APCON · Dir. Const. p.3–14 | Dir. Adm. p.3–77
  -- Estimativa: 3 semanas
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 3, 'Bloco 3 · Dir. Constitucional + Dir. Administrativo', '#f59e0b')
  RETURNING id INTO b_dir;

  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_dir, 1, 'Semana 7 · Direito Constitucional') RETURNING id INTO s7;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s7, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Direitos e deveres fundamentais: individuais e coletivos', 'leitura', 50, 'APCON · Dir. Const.', '3-13', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Direito à vida, liberdade, igualdade, segurança, propriedade', 'leitura', 50, 'APCON · Dir. Const.', '3-13', ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Direitos Fundamentais I', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s7, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Direitos sociais, nacionalidade, cidadania', 'leitura', 50, 'APCON · Dir. Const.', '3-13', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Garantias constitucionais + direitos coletivos', 'leitura', 50, 'APCON · Dir. Const.', '3-13', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: Direitos Fundamentais II', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s7, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Da Administração Pública — arts. 37 a 41 CF', 'lei', 50, 'APCON · Dir. Const.', '14', ARRAY['apcon','lei','pomodoro']),
    (d3, 3, '[POMODORO 2] Princípios LIMPE e aplicações práticas', 'leitura', 50, 'APCON · Dir. Const.', '14', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: Adm. Pública na CF', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s7, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Revisão: Dir. Constitucional completo', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 3, '[POMODORO 2] Simulado Dir. Constitucional (15 questões)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d4, 4, 'Gabarito comentado Dir. Const.', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s7, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Dir. Adm.: Estado, governo, organização', 'leitura', 50, 'APCON · Dir. Adm.', '3-9', ARRAY['apcon','pomodoro']),
    (d5, 3, '[POMODORO 2] Dir. Adm.: conceitos, elementos, princípios', 'leitura', 50, 'APCON · Dir. Adm.', '9-12', ARRAY['apcon','pomodoro']),
    (d5, 4, 'Questões: Dir. Adm. I', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_dir, 2, 'Semana 8 · Direito Administrativo') RETURNING id INTO s8;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s8, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Org. Administrativa da União: administração direta e indireta', 'leitura', 50, 'APCON · Dir. Adm.', '12-15', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] Agentes públicos: espécies, cargo, emprego, função', 'leitura', 50, 'APCON · Dir. Adm.', '15', ARRAY['apcon','pomodoro']),
    (d1, 4, 'Questões: Org. administrativa e agentes', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s8, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Poderes administrativos — hierárquico, disciplinar, regulamentar, polícia', 'leitura', 50, 'APCON · Dir. Adm.', '55-57', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Atos administrativos: validade, eficácia, extinção, sanatória', 'leitura', 50, 'APCON · Dir. Adm.', '57', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: Poderes e Atos administrativos', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s8, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Serviços públicos: conceito, classificação, concessão, permissão', 'leitura', 50, 'APCON · Dir. Adm.', '62', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Controle e responsabilização da Adm.: controles adm., legislativo, judicial', 'leitura', 50, 'APCON · Dir. Adm.', '66', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: Serviços públicos e controle', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s8, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Lei 8.429/1992 — Improbidade (Dir. Adm.)', 'lei', 50, 'APCON · Dir. Adm.', '68', ARRAY['apcon','lei','pomodoro']),
    (d4, 3, '[POMODORO 2] Lei 9.784/1999 — Processo Administrativo', 'lei', 50, 'APCON · Dir. Adm.', '77', ARRAY['apcon','lei','pomodoro']),
    (d4, 4, 'Questões: Improbidade + Processo Adm.', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s8, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Revisão: Dir. Adm. completo', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Simulado Dir. Administrativo (20 questões)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d5, 4, 'Gabarito comentado Dir. Adm.', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  -- --------------------------------------------------------
  -- BLOCO 4: ÉTICA + INFORMÁTICA + RACIOCÍNIO LÓGICO
  -- Ética: Decretos 1.171/94 e 6.029/07 (conciso)
  -- Informática: p.3–60 | RL: p.3–15
  -- Estimativa: 2 semanas
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 4, 'Bloco 4 · Ética + Informática + Raciocínio Lógico', '#8b5cf6')
  RETURNING id INTO b_etica;

  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_etica, 1, 'Semana 9 · Ética no Serviço Público + Informática') RETURNING id INTO s9;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s9, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Ética: Código de Ética — Decreto 1.171/94', 'lei', 50, 'APCON · Ética', '7', ARRAY['apcon','lei','pomodoro']),
    (d1, 3, '[POMODORO 2] Ética: Sistema de Gestão da Ética — Decreto 6.029/07', 'lei', 50, 'APCON · Ética', '8', ARRAY['apcon','lei','pomodoro']),
    (d1, 4, 'Questões: Ética no Serviço Público', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s9, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Informática: conceitos básicos, hardware/software, internet/intranet', 'leitura', 50, 'APCON · Info', '3-10', ARRAY['apcon','pomodoro']),
    (d2, 3, '[POMODORO 2] Informática: aplicativos, tecnologias, modos de utilização', 'leitura', 50, 'APCON · Info', '10-18', ARRAY['apcon','pomodoro']),
    (d2, 4, 'Questões: Informática I', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s9, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Informática: sistemas operacionais Windows, ferramentas de navegação', 'leitura', 50, 'APCON · Info', '18-29', ARRAY['apcon','pomodoro']),
    (d3, 3, '[POMODORO 2] Informática: Microsoft Office (Word, Excel, PowerPoint)', 'leitura', 50, 'APCON · Info', '29', ARRAY['apcon','pomodoro']),
    (d3, 4, 'Questões: Informática II — SO e Office', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s9, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Informática: correio eletrônico, vírus, worms, segurança', 'leitura', 50, 'APCON · Info', '60', ARRAY['apcon','pomodoro']),
    (d4, 3, '[POMODORO 2] Revisão geral: Informática', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 4, 'Simulado Informática (20 questões)', 'questoes', 45, NULL, NULL, ARRAY['questoes','simulado']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s9, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Raciocínio Lógico: proposições, conectivos, tabela verdade', 'leitura', 50, 'APCON · RL', '3-6', ARRAY['apcon','pomodoro']),
    (d5, 3, '[POMODORO 2] RL: tautologia, operação com conjuntos, porcentagens', 'leitura', 50, 'APCON · RL', '6-15', ARRAY['apcon','pomodoro']),
    (d5, 4, 'Questões: Raciocínio Lógico', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- Semana 10: RL continuação + revisão do bloco
  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_etica, 2, 'Semana 10 · Raciocínio Lógico + Revisão Bloco 4') RETURNING id INTO s10;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s10, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] RL: cálculos com porcentagens + revisão sentença abertas', 'leitura', 50, 'APCON · RL', '10-15', ARRAY['apcon','pomodoro']),
    (d1, 3, '[POMODORO 2] RL: gabarito comentado de questões anteriores', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d1, 4, 'Simulado RL (20 questões)', 'questoes', 45, NULL, NULL, ARRAY['questoes','simulado']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s10, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Revisão: Ética + Informática', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d2, 3, '[POMODORO 2] Mapa mental: Bloco 4 completo', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d2, 4, 'Questões mistas: Bloco 4', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s10, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Revisão reforçada: pontos fracos identificados nos simulados', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 3, '[POMODORO 2] Revisão reforçada: pontos fracos (sessão 2)', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 4, 'Questões extras: Ética + RL + Info', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s10, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Simulado Bloco 4 completo (25 questões)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d4, 3, '[POMODORO 2] Gabarito comentado simulado Bloco 4', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 4, 'Revisão final Bloco 4', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s10, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Revisão cruzada: LP + CE + Dir. Const.', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Revisão cruzada: Dir. Adm. + Ética + Info + RL', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 4, 'Questões mistas: todas as matérias', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- --------------------------------------------------------
  -- BLOCO 5: REVISÃO CRUZADA GERAL
  -- 2 semanas dedicadas a revisão de todo o conteúdo
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 5, 'Bloco 5 · Revisão Cruzada Geral', '#ef4444')
  RETURNING id INTO b_rev;

  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_rev, 1, 'Semana 11 · Revisão Cruzada I') RETURNING id INTO s11;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s11, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Simulado completo I (50 questões — todas as matérias)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d1, 3, '[POMODORO 2] Gabarito comentado simulado I', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d1, 4, 'Revisão dos pontos com mais erros', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s11, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Revisão focada: Seguridade Social (maior matéria)', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d2, 3, '[POMODORO 2] Revisão focada: Língua Portuguesa', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d2, 4, 'Questões: CE + LP', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s11, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Revisão focada: Dir. Constitucional + Dir. Adm.', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 3, '[POMODORO 2] Revisão focada: Ética + RL + Informática', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 4, 'Questões: Direitos + Ética + RL', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s11, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Simulado completo II (50 questões)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d4, 3, '[POMODORO 2] Gabarito comentado simulado II', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 4, 'Identificação dos pontos críticos', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s11, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Mapas mentais: consolidação de todas as matérias', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Revisão das leis mais cobradas em concurso', 'revisao', 50, NULL, NULL, ARRAY['revisao','lei','pomodoro']),
    (d5, 4, 'Questões de provas anteriores INSS', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  -- --------------------------------------------------------
  -- BLOCO 6: SPRINT FINAL
  -- 1 semana de alta intensidade pré-prova
  -- --------------------------------------------------------
  INSERT INTO blocos (concurso_id, ordem, titulo, cor)
  VALUES (concurso_id, 6, 'Bloco 6 · Sprint Final', '#dc2626')
  RETURNING id INTO b_sprint;

  INSERT INTO semanas (bloco_id, ordem, label) VALUES (b_sprint, 1, 'Semana 12 · Sprint Final') RETURNING id INTO s12;

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s12, 1, 'Segunda', 'seg') RETURNING id INTO d1;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d1, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d1, 2, '[POMODORO 1] Simulado final I (60 questões — formato prova real)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d1, 3, '[POMODORO 2] Gabarito comentado simulado final I', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d1, 4, 'Revisão emergencial dos erros', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s12, 2, 'Terça', 'ter') RETURNING id INTO d2;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d2, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d2, 2, '[POMODORO 1] Revisão: pontos críticos Seguridade Social', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d2, 3, '[POMODORO 2] Revisão: legislação mais cobrada (8.212, 8.213, LOAS)', 'revisao', 50, NULL, NULL, ARRAY['revisao','lei','pomodoro']),
    (d2, 4, 'Questões: legislação previdenciária', 'questoes', 45, NULL, NULL, ARRAY['questoes','lei']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s12, 3, 'Quarta', 'qua') RETURNING id INTO d3;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d3, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d3, 2, '[POMODORO 1] Simulado final II (60 questões)', 'questoes', 50, NULL, NULL, ARRAY['questoes','simulado','pomodoro']),
    (d3, 3, '[POMODORO 2] Gabarito comentado simulado final II', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d3, 4, 'Análise final de desempenho', 'revisao', 45, NULL, NULL, ARRAY['revisao']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s12, 4, 'Quinta', 'qui') RETURNING id INTO d4;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d4, 1, 'Revisão espaçada (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d4, 2, '[POMODORO 1] Revisão leve: LP + Ética (fácil de manter)', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 3, '[POMODORO 2] Revisão leve: Dir. Const. + Dir. Adm.', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d4, 4, 'Questões rápidas: todas as matérias (10 cada)', 'questoes', 45, NULL, NULL, ARRAY['questoes']);

  INSERT INTO dias (semana_id, ordem, label, dia_semana) VALUES (s12, 5, 'Sexta', 'sex') RETURNING id INTO d5;
  INSERT INTO itens (dia_id, ordem, descricao, tipo, duracao_min, fonte, paginas, tags) VALUES
    (d5, 1, 'Revisão espaçada final (15min)', 'revisao', 15, NULL, NULL, ARRAY['revisao']),
    (d5, 2, '[POMODORO 1] Revisão dos mapas mentais — visão geral', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 3, '[POMODORO 2] Descanso ativo: revisão leve apenas dos pontos mais seguros', 'revisao', 50, NULL, NULL, ARRAY['revisao','pomodoro']),
    (d5, 4, 'Preparação logística para o dia da prova', 'revisao', 30, NULL, NULL, ARRAY['revisao']);

  RAISE NOTICE 'Seed INSS Lucas concluído com sucesso! concurso_id: %', concurso_id;
END $$;
