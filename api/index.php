<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', $path);
$endpoint = end($pathParts);

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$db = new Database();
$pdo = $db->getConnection();

switch($endpoint) {
    case 'receitas':
        handleReceitas($pdo, $method, $input);
        break;
    case 'custos':
        handleCustos($pdo, $method, $input);
        break;
    case 'investimentos':
        handleInvestimentos($pdo, $method, $input);
        break;
    case 'ativos':
        handleAtivos($pdo, $method, $input);
        break;
    case 'passivos':
        handlePassivos($pdo, $method, $input);
        break;
    case 'cotacao-dolar':
        handleCotacaoDolar();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado']);
}

function handleReceitas($pdo, $method, $input) {
    $mesAno = $_GET['mesAno'] ?? date('Y-m');
    
    switch($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM receitas WHERE mes_ano = ?");
            $stmt->execute([$mesAno]);
            $receitas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($receitas);
            break;
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO receitas (nome, categoria, valor, frequencia, moeda, confiabilidade, notas, mes_ano) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nome'],
                $input['categoria'],
                $input['valor'],
                $input['frequencia'],
                $input['moeda'],
                $input['confiabilidade'],
                $input['notas'] ?? '',
                $mesAno
            ]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE receitas SET nome = ?, categoria = ?, valor = ?, frequencia = ?, moeda = ?, confiabilidade = ?, notas = ? WHERE id = ? AND mes_ano = ?");
            $stmt->execute([
                $input['nome'],
                $input['categoria'],
                $input['valor'],
                $input['frequencia'],
                $input['moeda'],
                $input['confiabilidade'],
                $input['notas'] ?? '',
                $input['id'],
                $mesAno
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM receitas WHERE id = ? AND mes_ano = ?");
            $stmt->execute([$input['id'], $mesAno]);
            echo json_encode(['success' => true]);
            break;
    }
}

function handleCustos($pdo, $method, $input) {
    $mesAno = $_GET['mesAno'] ?? date('Y-m');
    
    switch($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM custos WHERE mes_ano = ?");
            $stmt->execute([$mesAno]);
            $custos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($custos);
            break;
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO custos (nome, valor, moeda, centro_custo, notas, mes_ano) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['moeda'],
                $input['centroCusto'],
                $input['notas'] ?? '',
                $mesAno
            ]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE custos SET nome = ?, valor = ?, moeda = ?, centro_custo = ?, notas = ? WHERE id = ? AND mes_ano = ?");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['moeda'],
                $input['centroCusto'],
                $input['notas'] ?? '',
                $input['id'],
                $mesAno
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM custos WHERE id = ? AND mes_ano = ?");
            $stmt->execute([$input['id'], $mesAno]);
            echo json_encode(['success' => true]);
            break;
    }
}

function handleInvestimentos($pdo, $method, $input) {
    $mesAno = $_GET['mesAno'] ?? date('Y-m');
    
    switch($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM investimentos WHERE mes_ano = ?");
            $stmt->execute([$mesAno]);
            $investimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($investimentos);
            break;
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO investimentos (instituicao, saldo, moeda, rendimento_percentual, liquidez, notas, mes_ano) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['instituicao'],
                $input['saldo'],
                $input['moeda'],
                $input['rendimentoPercentual'],
                $input['liquidez'],
                $input['notas'] ?? '',
                $mesAno
            ]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE investimentos SET instituicao = ?, saldo = ?, moeda = ?, rendimento_percentual = ?, liquidez = ?, notas = ? WHERE id = ? AND mes_ano = ?");
            $stmt->execute([
                $input['instituicao'],
                $input['saldo'],
                $input['moeda'],
                $input['rendimentoPercentual'],
                $input['liquidez'],
                $input['notas'] ?? '',
                $input['id'],
                $mesAno
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM investimentos WHERE id = ? AND mes_ano = ?");
            $stmt->execute([$input['id'], $mesAno]);
            echo json_encode(['success' => true]);
            break;
    }
}

function handleAtivos($pdo, $method, $input) {
    $mesAno = $_GET['mesAno'] ?? date('Y-m');
    
    switch($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM ativos WHERE mes_ano = ?");
            $stmt->execute([$mesAno]);
            $ativos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($ativos);
            break;
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO ativos (nome, valor, valorizacao, notas, mes_ano) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['valorizacao'],
                $input['notas'] ?? '',
                $mesAno
            ]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE ativos SET nome = ?, valor = ?, valorizacao = ?, notas = ? WHERE id = ? AND mes_ano = ?");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['valorizacao'],
                $input['notas'] ?? '',
                $input['id'],
                $mesAno
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM ativos WHERE id = ? AND mes_ano = ?");
            $stmt->execute([$input['id'], $mesAno]);
            echo json_encode(['success' => true]);
            break;
    }
}

function handlePassivos($pdo, $method, $input) {
    $mesAno = $_GET['mesAno'] ?? date('Y-m');
    
    switch($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM passivos WHERE mes_ano = ?");
            $stmt->execute([$mesAno]);
            $passivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($passivos);
            break;
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO passivos (nome, valor, notas, mes_ano) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['notas'] ?? '',
                $mesAno
            ]);
            echo json_encode(['id' => $pdo->lastInsertId()]);
            break;
            
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE passivos SET nome = ?, valor = ?, notas = ? WHERE id = ? AND mes_ano = ?");
            $stmt->execute([
                $input['nome'],
                $input['valor'],
                $input['notas'] ?? '',
                $input['id'],
                $mesAno
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM passivos WHERE id = ? AND mes_ano = ?");
            $stmt->execute([$input['id'], $mesAno]);
            echo json_encode(['success' => true]);
            break;
    }
}

function handleCotacaoDolar() {
    // Simulação da API do Google Finance
    $cotacao = 5.0; // Fallback
    
    try {
        $response = file_get_contents('https://api.exchangerate-api.com/v4/latest/USD');
        $data = json_decode($response, true);
        $cotacao = $data['rates']['BRL'] ?? $cotacao;
    } catch (Exception $e) {
        // Mantém o fallback
    }
    
    echo json_encode(['cotacao' => $cotacao]);
}
?>