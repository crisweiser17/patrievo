-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: evo_patri
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ativos`
--

DROP TABLE IF EXISTS `ativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ativos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `valorizacao` enum('aprecia','deprecia') NOT NULL,
  `notas` text,
  `mes_ano` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ativos_mes_ano` (`mes_ano`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ativos`
--

LOCK TABLES `ativos` WRITE;
/*!40000 ALTER TABLE `ativos` DISABLE KEYS */;
INSERT INTO `ativos` VALUES (1,'Carro',35000.00,'deprecia','Veículo pessoal','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(2,'Apartamento',250000.00,'aprecia','Imóvel próprio','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(3,'Apartamento QG 2506',480000.00,'aprecia','','2025-10','2025-10-08 02:03:36','2025-10-08 02:03:36');
/*!40000 ALTER TABLE `ativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custos`
--

DROP TABLE IF EXISTS `custos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `moeda` enum('BRL','USD') NOT NULL,
  `centro_custo` varchar(100) NOT NULL,
  `notas` text,
  `mes_ano` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_custos_mes_ano` (`mes_ano`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custos`
--

LOCK TABLES `custos` WRITE;
/*!40000 ALTER TABLE `custos` DISABLE KEYS */;
INSERT INTO `custos` VALUES (1,'Aluguel',1200.00,'BRL','Casa principal','Aluguel do apartamento','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(2,'Supermercado',800.00,'BRL','Casa principal','Compras do mês','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(3,'Aluguel Apto Pira',2600.00,'BRL','Piracicaba','','2025-10','2025-10-07 19:55:55','2025-10-07 19:55:55');
/*!40000 ALTER TABLE `custos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `investimentos`
--

DROP TABLE IF EXISTS `investimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investimentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instituicao` varchar(255) NOT NULL,
  `saldo` decimal(15,2) NOT NULL,
  `moeda` enum('BRL','USD') NOT NULL,
  `rendimento_percentual` decimal(5,2) NOT NULL,
  `liquidez` enum('líquido','conversível','ilíquido') NOT NULL,
  `notas` text,
  `mes_ano` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investimentos_mes_ano` (`mes_ano`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `investimentos`
--

LOCK TABLES `investimentos` WRITE;
/*!40000 ALTER TABLE `investimentos` DISABLE KEYS */;
INSERT INTO `investimentos` VALUES (1,'Banco A',10000.00,'BRL',12.50,'líquido','CDB','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(2,'Corretora B',5000.00,'USD',8.20,'conversível','Ações','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(3,'MercadoPago',110000.00,'BRL',1.00,'líquido','','2025-10','2025-10-07 20:56:24','2025-10-07 20:56:24'),(4,'XP',594000.00,'BRL',1.20,'líquido','','2025-10','2025-10-08 01:53:36','2025-10-08 01:53:36');
/*!40000 ALTER TABLE `investimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passivos`
--

DROP TABLE IF EXISTS `passivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `notas` text,
  `mes_ano` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_passivos_mes_ano` (`mes_ano`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passivos`
--

LOCK TABLES `passivos` WRITE;
/*!40000 ALTER TABLE `passivos` DISABLE KEYS */;
INSERT INTO `passivos` VALUES (1,'Financiamento Carro',-15000.00,'Parcela restante','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(2,'Empréstimo',-5000.00,'Empréstimo pessoal','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(3,'Emprestimo Tedesco',200000.00,'','2025-10','2025-10-08 02:03:51','2025-10-08 02:03:51');
/*!40000 ALTER TABLE `passivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receitas`
--

DROP TABLE IF EXISTS `receitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `frequencia` enum('mensal','bimestral','trimestral','semestral','anual') NOT NULL,
  `moeda` enum('BRL','USD') NOT NULL,
  `confiabilidade` enum('alta','baixa') NOT NULL,
  `notas` text,
  `mes_ano` varchar(7) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_receitas_mes_ano` (`mes_ano`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receitas`
--

LOCK TABLES `receitas` WRITE;
/*!40000 ALTER TABLE `receitas` DISABLE KEYS */;
INSERT INTO `receitas` VALUES (1,'Salário','salário/emprego',5000.00,'mensal','BRL','alta','Salário principal','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(2,'Freelance','negócios',1500.00,'mensal','BRL','baixa','Trabalho freelance','2024-01','2025-10-07 19:02:03','2025-10-07 19:02:03'),(3,'NAVA','salário/emprego',36000.00,'mensal','BRL','alta','','2025-10','2025-10-07 19:40:20','2025-10-07 19:40:20'),(6,'Salário Principal','salário/emprego',45000.00,'mensal','BRL','alta','Salário principal outubro','2024-10','2025-10-08 02:57:28','2025-10-08 02:57:28'),(7,'Freelance','freelancer',8594.00,'mensal','BRL','baixa','Trabalhos extras outubro','2024-10','2025-10-08 02:57:34','2025-10-08 02:57:34'),(8,'Investimentos','investimentos',2000.00,'mensal','BRL','alta','Rendimentos investimentos outubro','2024-10','2025-10-08 02:57:40','2025-10-08 02:57:40');
/*!40000 ALTER TABLE `receitas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-08 13:37:33
