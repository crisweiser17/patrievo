-- Migração para adicionar campo 'valor' às tabelas de templates
USE evo_patri;

-- Adicionar campo valor à tabela de templates de receitas
ALTER TABLE templates_receitas 
ADD COLUMN valor DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER categoria;

-- Adicionar campo valor à tabela de templates de custos
ALTER TABLE templates_custos 
ADD COLUMN valor DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER centro_custo;

-- Adicionar campos valor e frequencia/prioridade à tabela de templates de custos
ALTER TABLE templates_custos 
ADD COLUMN frequencia ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensal' AFTER valor,
ADD COLUMN prioridade ENUM('alta', 'media', 'baixa') NOT NULL DEFAULT 'media' AFTER frequencia;

-- Adicionar campo valor à tabela de templates de investimentos
ALTER TABLE templates_investimentos 
ADD COLUMN valor DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER instituicao;

-- Renomear campo rendimento_percentual para rendimento
ALTER TABLE templates_investimentos 
CHANGE COLUMN rendimento_percentual rendimento DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Adicionar campo valor à tabela de templates de ativos
ALTER TABLE templates_ativos 
ADD COLUMN valor DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER nome;

-- Alterar campo valorizacao para aceitar valores decimais
ALTER TABLE templates_ativos 
CHANGE COLUMN valorizacao valorizacao DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Adicionar campos valor e mes_referencia à tabela de templates de passivos
ALTER TABLE templates_passivos 
ADD COLUMN valor DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER nome,
ADD COLUMN mes_referencia VARCHAR(7) NULL AFTER valor;