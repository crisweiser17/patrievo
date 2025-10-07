-- Evolução Patrimonial - Database Schema

CREATE DATABASE IF NOT EXISTS evo_patri;
USE evo_patri;

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS receitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    frequencia ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual') NOT NULL,
    moeda ENUM('BRL', 'USD') NOT NULL,
    confiabilidade ENUM('alta', 'baixa') NOT NULL,
    notas TEXT,
    mes_ano VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Custos
CREATE TABLE IF NOT EXISTS custos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    moeda ENUM('BRL', 'USD') NOT NULL,
    centro_custo VARCHAR(100) NOT NULL,
    notas TEXT,
    mes_ano VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Investimentos
CREATE TABLE IF NOT EXISTS investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao VARCHAR(255) NOT NULL,
    saldo DECIMAL(15,2) NOT NULL,
    moeda ENUM('BRL', 'USD') NOT NULL,
    rendimento_percentual DECIMAL(5,2) NOT NULL,
    liquidez ENUM('líquido', 'conversível', 'ilíquido') NOT NULL,
    notas TEXT,
    mes_ano VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Ativos
CREATE TABLE IF NOT EXISTS ativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    valorizacao ENUM('aprecia', 'deprecia') NOT NULL,
    notas TEXT,
    mes_ano VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Passivos
CREATE TABLE IF NOT EXISTS passivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    notas TEXT,
    mes_ano VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_receitas_mes_ano ON receitas(mes_ano);
CREATE INDEX idx_custos_mes_ano ON custos(mes_ano);
CREATE INDEX idx_investimentos_mes_ano ON investimentos(mes_ano);
CREATE INDEX idx_ativos_mes_ano ON ativos(mes_ano);
CREATE INDEX idx_passivos_mes_ano ON passivos(mes_ano);

-- Dados de exemplo
INSERT INTO receitas (nome, categoria, valor, frequencia, moeda, confiabilidade, notas, mes_ano) VALUES
('Salário', 'salário/emprego', 5000.00, 'mensal', 'BRL', 'alta', 'Salário principal', '2024-01'),
('Freelance', 'negócios', 1500.00, 'mensal', 'BRL', 'baixa', 'Trabalho freelance', '2024-01');

INSERT INTO custos (nome, valor, moeda, centro_custo, notas, mes_ano) VALUES
('Aluguel', 1200.00, 'BRL', 'Casa principal', 'Aluguel do apartamento', '2024-01'),
('Supermercado', 800.00, 'BRL', 'Casa principal', 'Compras do mês', '2024-01');

INSERT INTO investimentos (instituicao, saldo, moeda, rendimento_percentual, liquidez, notas, mes_ano) VALUES
('Banco A', 10000.00, 'BRL', 12.5, 'líquido', 'CDB', '2024-01'),
('Corretora B', 5000.00, 'USD', 8.2, 'conversível', 'Ações', '2024-01');

INSERT INTO ativos (nome, valor, valorizacao, notas, mes_ano) VALUES
('Carro', 35000.00, 'deprecia', 'Veículo pessoal', '2024-01'),
('Apartamento', 250000.00, 'aprecia', 'Imóvel próprio', '2024-01');

INSERT INTO passivos (nome, valor, notas, mes_ano) VALUES
('Financiamento Carro', -15000.00, 'Parcela restante', '2024-01'),
('Empréstimo', -5000.00, 'Empréstimo pessoal', '2024-01');