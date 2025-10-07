<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        $mes_ano = $_GET['mes_ano'] ?? date('Y-m');
        
        $query = "SELECT * FROM receitas WHERE mes_ano = :mes_ano ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':mes_ano', $mes_ano);
        $stmt->execute();
        
        $receitas = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $receitas[] = $row;
        }
        
        echo json_encode($receitas);
        break;
        
    case 'POST':
        $mes_ano = $input['mes_ano'] ?? date('Y-m');
        $query = "INSERT INTO receitas SET nome=:nome, categoria=:categoria, valor=:valor, frequencia=:frequencia, moeda=:moeda, confiabilidade=:confiabilidade, notas=:notas, mes_ano=:mes_ano";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':categoria', $input['categoria']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':frequencia', $input['frequencia']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':confiabilidade', $input['confiabilidade']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $mes_ano);
        
        if($stmt->execute()) {
            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Receita criada com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao criar receita']);
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $query = "UPDATE receitas SET nome=:nome, categoria=:categoria, valor=:valor, frequencia=:frequencia, moeda=:moeda, confiabilidade=:confiabilidade, notas=:notas, mes_ano=:mes_ano WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':categoria', $input['categoria']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':frequencia', $input['frequencia']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':confiabilidade', $input['confiabilidade']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $input['mes_ano']);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Receita atualizada com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao atualizar receita']);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM receitas WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Receita deletada com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao deletar receita']);
        }
        break;
}
?>