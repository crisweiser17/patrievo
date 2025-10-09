-- Templates de Configuração - Schema para pré-cadastros
-- Este arquivo adiciona tabelas para armazenar templates que agilizam o processo mensal

USE evo_patri;

-- Tabela de Templates de Receitas
CREATE TABLE IF NOT EXISTS templates_receitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    frequencia ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensal',
    moeda ENUM('BRL', 'USD') NOT NULL DEFAULT 'BRL',
    confiabilidade ENUM('alta', 'baixa') NOT NULL DEFAULT 'alta',
    notas TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nome_categoria (nome, categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Templates de Custos
CREATE TABLE IF NOT EXISTS templates_custos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    centro_custo VARCHAR(100) NOT NULL,
    moeda ENUM('BRL', 'USD') NOT NULL DEFAULT 'BRL',
    notas TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nome_centro (nome, centro_custo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Templates de Investimentos
CREATE TABLE IF NOT EXISTS templates_investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao VARCHAR(255) NOT NULL,
    moeda ENUM('BRL', 'USD') NOT NULL DEFAULT 'BRL',
    rendimento_percentual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    liquidez ENUM('líquido', 'conversível', 'ilíquido') NOT NULL DEFAULT 'líquido',
    notas TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_instituicao (instituicao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Templates de Ativos
CREATE TABLE IF NOT EXISTS templates_ativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valorizacao ENUM('aprecia', 'deprecia') NOT NULL DEFAULT 'aprecia',
    notas TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Templates de Passivos
CREATE TABLE IF NOT EXISTS templates_passivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    notas TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Índices para otimização
CREATE INDEX idx_templates_receitas_ativo ON templates_receitas(ativo);
CREATE INDEX idx_templates_custos_ativo ON templates_custos(ativo);
CREATE INDEX idx_templates_investimentos_ativo ON templates_investimentos(ativo);
CREATE INDEX idx_templates_ativos_ativo ON templates_ativos(ativo);
CREATE INDEX idx_templates_passivos_ativo ON templates_passivos(ativo);

-- Dados de exemplo para templates
INSERT INTO templates_receitas (nome, categoria, frequencia, moeda, confiabilidade, notas) VALUES
('Salário Principal', 'salário/emprego', 'mensal', 'BRL', 'alta', 'Salário fixo mensal'),
('Freelance Desenvolvimento', 'negócios', 'mensal', 'BRL', 'baixa', 'Trabalhos freelance de desenvolvimento'),
('Aluguel de Imóvel', 'aluguel/locação', 'mensal', 'BRL', 'alta', 'Renda de aluguel'),
('Dividendos', 'investimentos', 'trimestral', 'BRL', 'baixa', 'Dividendos de ações'),
('Consultoria', 'negócios', 'mensal', 'BRL', 'baixa', 'Serviços de consultoria');

INSERT INTO templates_custos (nome, centro_custo, moeda, notas) VALUES
('Aluguel', 'Casa principal', 'BRL', 'Aluguel mensal da residência'),
('Supermercado', 'Casa principal', 'BRL', 'Compras mensais de supermercado'),
('Internet', 'Casa principal', 'BRL', 'Conta de internet'),
('Energia Elétrica', 'Casa principal', 'BRL', 'Conta de luz'),
('Combustível', 'Transporte', 'BRL', 'Gasolina do veículo'),
('Seguro do Carro', 'Transporte', 'BRL', 'Seguro veicular'),
('Plano de Saúde', 'Saúde', 'BRL', 'Plano de saúde familiar'),
('Academia', 'Saúde', 'BRL', 'Mensalidade da academia'),
('Streaming', 'Entretenimento', 'BRL', 'Assinaturas de streaming'),
('Restaurantes', 'Entretenimento', 'BRL', 'Gastos com alimentação fora');

INSERT INTO templates_investimentos (instituicao, moeda, rendimento_percentual, liquidez, notas) VALUES
('Nubank', 'BRL', 12.50, 'líquido', 'CDB Nubank'),
('Inter', 'BRL', 13.00, 'líquido', 'CDB Banco Inter'),
('XP Investimentos', 'BRL', 10.50, 'conversível', 'Fundos de investimento'),
('Rico', 'USD', 8.20, 'conversível', 'Ações internacionais'),
('BTG Pactual', 'BRL', 11.80, 'líquido', 'Tesouro Direto'),
('Clear', 'BRL', 9.50, 'conversível', 'Ações nacionais'),
('Avenue', 'USD', 7.80, 'conversível', 'REITs americanos');

INSERT INTO templates_ativos (nome, valorizacao, notas) VALUES
('Apartamento Principal', 'aprecia', 'Imóvel residencial próprio'),
('Carro', 'deprecia', 'Veículo pessoal'),
('Moto', 'deprecia', 'Motocicleta'),
('Terreno', 'aprecia', 'Terreno para investimento'),
('Casa de Praia', 'aprecia', 'Imóvel de lazer'),
('Equipamentos de Trabalho', 'deprecia', 'Computadores, móveis de escritório'),
('Joias', 'aprecia', 'Joias e metais preciosos');

INSERT INTO templates_passivos (nome, notas) VALUES
('Financiamento Imobiliário', 'Financiamento da casa própria'),
('Financiamento do Carro', 'Financiamento veicular'),
('Cartão de Crédito', 'Fatura do cartão de crédito'),
('Empréstimo Pessoal', 'Empréstimo bancário'),
('Financiamento Estudantil', 'FIES ou financiamento privado'),
('Consórcio', 'Consórcio de bens'),
('Empréstimo Familiar', 'Dívida com familiares');