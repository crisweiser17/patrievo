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
        
        $query = "SELECT * FROM custos WHERE mes_ano = :mes_ano ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':mes_ano', $mes_ano);
        $stmt->execute();
        
        $custos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $custos[] = $row;
        }
        
        echo json_encode($custos);
        break;
        
    case 'POST':
        $mes_ano = $input['mes_ano'] ?? date('Y-m');
        $query = "INSERT INTO custos SET nome=:nome, valor=:valor, moeda=:moeda, centro_custo=:centro_custo, notas=:notas, mes_ano=:mes_ano";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':centro_custo', $input['centro_custo']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $mes_ano);
        
        if($stmt->execute()) {
            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Custo criado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao criar custo']);
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $query = "UPDATE custos SET nome=:nome, valor=:valor, moeda=:moeda, centro_custo=:centro_custo, notas=:notas, mes_ano=:mes_ano WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':centro_custo', $input['centro_custo']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $input['mes_ano']);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Custo atualizado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao atualizar custo']);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM custos WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Custo deletado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao deletar custo']);
        }
        break;
}
?>