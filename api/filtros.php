<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php'; // $pdo

$tipo = $_GET['tipo'] ?? null;
$provincia = $_GET['provincia'] ?? null;

try {
    if ($tipo === 'provincias') {
        $stmt = $pdo->query("SELECT DISTINCT provincia FROM geografia_social.provincias ORDER BY provincia");
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    } elseif ($tipo === 'departamentos' && $provincia) {
        $stmt = $pdo->prepare("SELECT DISTINCT departamento FROM geografia_social.departamentos WHERE provincia = :provincia ORDER BY departamento");
        $stmt->execute(['provincia' => $provincia]);
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
