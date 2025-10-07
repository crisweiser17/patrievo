<?php
// Script para configurar o banco de dados

echo "Configurando banco de dados Evolução Patrimonial...\n";

// Configurações do banco de dados
$host = 'localhost';
$dbname = 'evo_patri';
$username = 'root';
$password = '';

try {
    // Conectar sem selecionar banco para criar se não existir
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Criar banco de dados se não existir
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    $pdo->exec("USE $dbname");
    
    echo "Banco de dados criado/verificado com sucesso.\n";
    
    // Ler e executar o schema SQL
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);
        
        // Executar cada instrução separadamente
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        echo "Schema do banco de dados criado com sucesso.\n";
        echo "Dados de exemplo inseridos.\n";
    } else {
        echo "ERRO: Arquivo schema.sql não encontrado.\n";
    }
    
    echo "\nConfiguração do banco de dados concluída!\n";
    echo "Você pode acessar a aplicação em: http://localhost/evo-patri\n";
    
} catch (PDOException $e) {
    echo "ERRO na configuração do banco de dados: " . $e->getMessage() . "\n";
    echo "Verifique se o MySQL está rodando e as credenciais estão corretas.\n";
}
?>