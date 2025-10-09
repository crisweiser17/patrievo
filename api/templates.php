<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Instanciar conexão com banco de dados
$database = new Database();
$pdo = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Validar tipo de template
$validTypes = ['receitas', 'custos', 'investimentos', 'ativos', 'passivos'];
$type = isset($_GET['type']) ? $_GET['type'] : (isset($input['type']) ? $input['type'] : null);

if (!$type || !in_array($type, $validTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de template inválido. Use: ' . implode(', ', $validTypes)]);
    exit;
}

$tableName = "templates_$type";

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo, $tableName, $type);
            break;
        case 'POST':
            handlePost($pdo, $tableName, $type, $input);
            break;
        case 'PUT':
            handlePut($pdo, $tableName, $type, $input);
            break;
        case 'DELETE':
            handleDelete($pdo, $tableName, $input);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno: ' . $e->getMessage()]);
}

function handleGet($pdo, $tableName, $type) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    if ($id) {
        // Buscar template específico
        $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ? AND ativo = 1");
        $stmt->execute([$id]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($template) {
            echo json_encode($template);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Template não encontrado']);
        }
    } else {
        // Buscar todos os templates ativos
        // Definir coluna de ordenação baseada no tipo
        $orderColumn = ($type === 'investimentos') ? 'instituicao' : 'nome';
        $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE ativo = 1 ORDER BY $orderColumn ASC");
        $stmt->execute();
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($templates);
    }
}

function handlePost($pdo, $tableName, $type, $input) {
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados não fornecidos']);
        return;
    }

    $fields = getFieldsForType($type);
    $requiredFields = getRequiredFieldsForType($type);
    
    // Validar campos obrigatórios
    foreach ($requiredFields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => "Campo obrigatório: $field"]);
            return;
        }
    }

    // Preparar query de inserção
    $columns = array_keys($fields);
    $placeholders = ':' . implode(', :', $columns);
    $sql = "INSERT INTO $tableName (" . implode(', ', $columns) . ") VALUES ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    
    // Preparar dados para inserção
    $data = [];
    foreach ($fields as $field => $default) {
        $data[$field] = isset($input[$field]) ? $input[$field] : $default;
    }
    
    try {
        $stmt->execute($data);
        $id = $pdo->lastInsertId();
        
        // Retornar o template criado
        $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ?");
        $stmt->execute([$id]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode($template);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['error' => 'Template com esse nome já existe']);
        } else {
            throw $e;
        }
    }
}

function handlePut($pdo, $tableName, $type, $input) {
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        return;
    }

    $id = intval($input['id']);
    $fields = getFieldsForType($type);
    
    // Verificar se o template existe
    $stmt = $pdo->prepare("SELECT id FROM $tableName WHERE id = ? AND ativo = 1");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Template não encontrado']);
        return;
    }

    // Preparar campos para atualização
    $updateFields = [];
    $data = ['id' => $id];
    
    foreach ($fields as $field => $default) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = :$field";
            $data[$field] = $input[$field];
        }
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        return;
    }

    $sql = "UPDATE $tableName SET " . implode(', ', $updateFields) . " WHERE id = :id";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);
        
        // Retornar o template atualizado
        $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE id = ?");
        $stmt->execute([$id]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode($template);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(['error' => 'Template com esse nome já existe']);
        } else {
            throw $e;
        }
    }
}

function handleDelete($pdo, $tableName, $input) {
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        return;
    }

    $id = intval($input['id']);
    
    // Soft delete - marcar como inativo
    $stmt = $pdo->prepare("UPDATE $tableName SET ativo = 0 WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Template removido com sucesso']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Template não encontrado']);
    }
}

function getFieldsForType($type) {
    switch ($type) {
        case 'receitas':
            return [
                'nome' => '',
                'categoria' => '',
                'valor' => 0.00,
                'frequencia' => 'mensal',
                'moeda' => 'BRL',
                'confiabilidade' => 'alta',
                'notas' => null,
                'ativo' => 1
            ];
        case 'custos':
            return [
                'nome' => '',
                'centro_custo' => '',
                'valor' => 0.00,
                'frequencia' => 'mensal',
                'moeda' => 'BRL',
                'notas' => null,
                'ativo' => 1
            ];
        case 'investimentos':
            return [
                'instituicao' => '',
                'valor' => 0.00,
                'moeda' => 'BRL',
                'rendimento' => 0.00,
                'liquidez' => 'líquido',
                'notas' => null,
                'ativo' => 1
            ];
        case 'ativos':
            return [
                'nome' => '',
                'valor' => 0.00,
                'valorizacao' => 0.00,
                'notas' => null,
                'ativo' => 1
            ];
        case 'passivos':
            return [
                'nome' => '',
                'valor' => 0.00,
                'mes_referencia' => null,
                'notas' => null,
                'ativo' => 1
            ];
        default:
            return [];
    }
}

function getRequiredFieldsForType($type) {
    switch ($type) {
        case 'receitas':
            return ['nome', 'categoria', 'valor'];
        case 'custos':
            return ['nome', 'centro_custo', 'valor'];
        case 'investimentos':
            return ['instituicao', 'valor'];
        case 'ativos':
        case 'passivos':
            return ['nome', 'valor'];
        default:
            return [];
    }
}
?>