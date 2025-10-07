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
        
        $query = "SELECT * FROM investimentos WHERE mes_ano = :mes_ano ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':mes_ano', $mes_ano);
        $stmt->execute();
        
        $investimentos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Calcular rendimento em valor
            $row['rendimento_valor'] = $row['saldo'] * ($row['rendimento_percentual'] / 100);
            $investimentos[] = $row;
        }
        
        echo json_encode($investimentos);
        break;
        
    case 'POST':
        $mes_ano = $input['mes_ano'] ?? date('Y-m');
        $query = "INSERT INTO investimentos SET instituicao=:instituicao, saldo=:saldo, moeda=:moeda, rendimento_percentual=:rendimento_percentual, liquidez=:liquidez, notas=:notas, mes_ano=:mes_ano";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':instituicao', $input['instituicao']);
        $stmt->bindParam(':saldo', $input['saldo']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':rendimento_percentual', $input['rendimento_percentual']);
        $stmt->bindParam(':liquidez', $input['liquidez']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $mes_ano);
        
        if($stmt->execute()) {
            echo json_encode(['id' => $db->lastInsertId(), 'message' => 'Investimento criado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao criar investimento']);
        }
        break;
        
    case 'PUT':
        $id = $_GET['id'];
        $query = "UPDATE investimentos SET instituicao=:instituicao, saldo=:saldo, moeda=:moeda, rendimento_percentual=:rendimento_percentual, liquidez=:liquidez, notas=:notas, mes_ano=:mes_ano WHERE id=:id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':instituicao', $input['instituicao']);
        $stmt->bindParam(':saldo', $input['saldo']);
        $stmt->bindParam(':moeda', $input['moeda']);
        $stmt->bindParam(':rendimento_percentual', $input['rendimento_percentual']);
        $stmt->bindParam(':liquidez', $input['liquidez']);
        $stmt->bindParam(':notas', $input['notas']);
        $stmt->bindParam(':mes_ano', $input['mes_ano']);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Investimento atualizado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao atualizar investimento']);
        }
        break;
        
    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM investimentos WHERE id=:id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        
        if($stmt->execute()) {
            echo json_encode(['message' => 'Investimento deletado com sucesso']);
        } else {
            echo json_encode(['error' => 'Erro ao deletar investimento']);
        }
        break;
}
?>