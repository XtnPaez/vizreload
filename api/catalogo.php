<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php'; // conexión PDO $pdo

try {
    // Traer todas las capas activas
    $stmt = $pdo->prepare("
        SELECT id, nombre, grupo, tipo, color, popup_campos, popup_labels, orden
        FROM public.capas
        WHERE activo = TRUE
        ORDER BY grupo, orden, nombre
    ");
    $stmt->execute();

    $capas = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Normalizar popup_campos a array PHP
        $popup_campos = [];
        if (!empty($row['popup_campos'])) {
            $clean = trim($row['popup_campos'], '{}');
            $popup_campos = $clean === '' ? [] : explode(',', $clean);
        }

        // Normalizar popup_labels a array PHP
        $popup_labels = [];
        if (!empty($row['popup_labels'])) {
            $popup_labels = json_decode($row['popup_labels'], true);
            if (!is_array($popup_labels)) $popup_labels = [];
        }

        $capas[] = [
            'id'           => (int)$row['id'],
            'nombre'       => $row['nombre'],
            'grupo'        => $row['grupo'],
            'tipo'         => $row['tipo'],
            'color'        => $row['color'],
            'popup_campos' => $popup_campos,
            'popup_labels' => $popup_labels
        ];
    }

    echo json_encode(['capas' => $capas], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
