-- Remover coluna 'prioridade' da tabela de templates de custos
-- Execute este script apenas se a coluna existir no seu banco

ALTER TABLE templates_custos
  DROP COLUMN prioridade;