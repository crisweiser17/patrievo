<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if($method === 'GET') {
    $mes_ano = $_GET['mes_ano'] ?? date('Y-m');
    $cotacao = isset($_GET['cotacao']) ? floatval($_GET['cotacao']) : 5.0; // USD->BRL
    
    // Buscar dados de todas as tabelas
    $dados = [];
    
    // Receitas
    $query = "SELECT * FROM receitas WHERE TRIM(mes_ano) = :mes_ano";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':mes_ano', $mes_ano);
    $stmt->execute();
    $dados['receitas'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Custos
    $query = "SELECT * FROM custos WHERE TRIM(mes_ano) = :mes_ano";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':mes_ano', $mes_ano);
    $stmt->execute();
    $dados['custos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Investimentos
    $query = "SELECT * FROM investimentos WHERE TRIM(mes_ano) = :mes_ano";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':mes_ano', $mes_ano);
    $stmt->execute();
    $dados['investimentos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ativos
    $query = "SELECT * FROM ativos WHERE TRIM(mes_ano) = :mes_ano";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':mes_ano', $mes_ano);
    $stmt->execute();
    $dados['ativos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Passivos
    $query = "SELECT * FROM passivos WHERE TRIM(mes_ano) = :mes_ano";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':mes_ano', $mes_ano);
    $stmt->execute();
    $dados['passivos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcular indicadores
    $indicadores = calcularIndicadores($dados);
    
    echo json_encode(['dados' => $dados, 'indicadores' => $indicadores]);
}

function calcularIndicadores($dados, $cotacao = 5.0) {
    $indicadores = [];
    
    // Rendas
    $renda_total = 0;
    $renda_alta_confiabilidade = 0;
    $renda_baixa_confiabilidade = 0;
    $renda_salario = 0;
    
    foreach($dados['receitas'] as $receita) {
        $valor = (float)$receita['valor'];
        $renda_total += $valor;
        
        if($receita['confiabilidade'] === 'alta') {
            $renda_alta_confiabilidade += $valor;
        } else {
            $renda_baixa_confiabilidade += $valor;
        }
        
        if($receita['categoria'] === 'salário/emprego') {
            $renda_salario += $valor;
        }
    }
    
    $indicadores['renda_total'] = $renda_total;
    $indicadores['renda_alta_confiabilidade'] = $renda_alta_confiabilidade;
    $indicadores['renda_baixa_confiabilidade'] = $renda_baixa_confiabilidade;
    $indicadores['renda_independente'] = $renda_total - $renda_salario;
    
    // Custos
    $custo_total = 0;
    $custos_por_centro = [];
    
    foreach($dados['custos'] as $custo) {
        $valor = (float)$custo['valor'];
        $custo_total += $valor;
        
        $centro = $custo['centro_custo'];
        if(!isset($custos_por_centro[$centro])) {
            $custos_por_centro[$centro] = 0;
        }
        $custos_por_centro[$centro] += $valor;
    }
    
    $indicadores['custo_total'] = $custo_total;
    $indicadores['custos_por_centro'] = $custos_por_centro;
    
    // Investimentos
    $investimento_total_brl = 0;
    $investimento_total_usd = 0;
    $rendimento_total = 0;
    $total_investimentos = 0;
    $soma_percentuais = 0;
    
    foreach($dados['investimentos'] as $investimento) {
        $saldo = (float)$investimento['saldo'];
        $rendimento_percentual = (float)$investimento['rendimento_percentual'];
        $moeda = isset($investimento['moeda']) ? $investimento['moeda'] : 'BRL';
        
        // Converter rendimentos e saldos em USD para BRL
        $saldo_brl = ($moeda === 'USD') ? $saldo * $cotacao : $saldo;
        $rendimento_valor_brl = $saldo_brl * ($rendimento_percentual / 100);
        
        if($moeda === 'BRL') {
            $investimento_total_brl += $saldo;
        } else {
            $investimento_total_usd += $saldo; // manter valor original em USD
        }
        
        $total_investimentos += $saldo_brl; // total consolidado em BRL
        $rendimento_total += $rendimento_valor_brl; // rendimento total em BRL
        $soma_percentuais += $rendimento_percentual;
    }
    
    $indicadores['investimento_total_brl'] = $investimento_total_brl;
    $indicadores['investimento_total_usd'] = $investimento_total_usd;
    $indicadores['investimento_total'] = $total_investimentos; // em BRL
    $indicadores['rendimento_total'] = $rendimento_total; // em BRL
    $indicadores['media_percentual_rendimento'] = count($dados['investimentos']) > 0 ? $soma_percentuais / count($dados['investimentos']) : 0;
    
    // Ativos e Passivos
    $ativo_total = 0;
    $passivo_total = 0;
    
    foreach($dados['ativos'] as $ativo) {
        $ativo_total += (float)$ativo['valor'];
    }
    
    foreach($dados['passivos'] as $passivo) {
        $passivo_total += (float)$passivo['valor'];
    }
    
    $indicadores['ativo_total'] = $ativo_total;
    $indicadores['passivo_total'] = $passivo_total;
    
    // Indicadores finais
    $indicadores['renda_disponivel'] = $renda_total - $custo_total;
    
    if($custo_total > 0) {
        $indicadores['fator_independencia'] = $renda_total / $custo_total;
        $indicadores['percentual_independencia'] = min(100, ($renda_total / $custo_total) * 100);
        $indicadores['falta_independencia'] = max(0, $custo_total - $renda_total);
    } else {
        $indicadores['fator_independencia'] = $renda_total > 0 ? PHP_FLOAT_MAX : 0;
        $indicadores['percentual_independencia'] = 100;
        $indicadores['falta_independencia'] = 0;
    }
    
    return $indicadores;
}
?>