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
        
        $query = "SELECT * FROM passivos WHERE mes_ano = :mes_ano ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':mes_ano', $mes_ano);
        $stmt->execute();
        
        $passivos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $passivos[] = $row;
        }
        
        echo json_encode($passivos);
        break;
        
    case 'POST':
        $mes_ano = $input['mes_ano'] ?? date('Y-m');
        $query = "INSERT INTO passivos SET nome=:nome, valor=:valor, notas=:notas, mes_ano=:mes_ano";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $mes_ano);
        
        if($stmt->execute()) {
            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Passivo criado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao criar passivo']);
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $query = "UPDATE passivos SET nome=:nome, valor=:valor, notas=:notas, mes_ano=:mes_ano WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':nome', $input['nome']);
        $stmt->bindParam(':valor', $input['valor']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $input['mes_ano']);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Passivo atualizado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao atualizar passivo']);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM passivos WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Passivo deletado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao deletar passivo']);
        }
        break;
}
?>