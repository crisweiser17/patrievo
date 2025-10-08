<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$database = new Database();
$db = $database->getConnection();

$targetMesAno = '2025-10';
$tables = ['receitas', 'custos', 'investimentos', 'ativos', 'passivos'];
$results = [];

try {
    foreach ($tables as $table) {
        // Atualiza registros onde mes_ano é NULL ou string vazia
        $query = "UPDATE {$table} SET mes_ano = :mes_ano WHERE mes_ano IS NULL OR mes_ano = ''";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':mes_ano', $targetMesAno);
        $stmt->execute();
        $results[$table] = [
            'updated' => $stmt->rowCount()
        ];
    }
    echo json_encode(['message' => 'Correção aplicada com sucesso', 'target_mes_ano' => $targetMesAno, 'details' => $results]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao aplicar correção', 'details' => $e->getMessage()]);
}
?>