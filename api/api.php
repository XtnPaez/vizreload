<?php
header('Content-Type: application/json');
require_once '../config/conexion.php'; // tu conexión PDO

if (!isset($_GET['layer'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Parámetro layer requerido']);
    exit;
}

$layer = $_GET['layer'];

try {
    // Buscar la capa y su SQL
    $stmt = $pdo->prepare("SELECT sql_query FROM public.capas WHERE id = :layer AND activo = TRUE");
    $stmt->execute(['layer' => $layer]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Capa no encontrada']);
        exit;
    }

    $sql = $row['sql_query'];
    $stmt2 = $pdo->prepare($sql);
    $stmt2->execute();

    $features = [];
    while ($r = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        if (isset($r['geometry'])) {
            $geometry = json_decode($r['geometry']);
            unset($r['geometry']);
        } elseif (isset($r['latitud']) && isset($r['longitud'])) {
            $geometry = [
                "type" => "Point",
                "coordinates" => [(float)$r['longitud'], (float)$r['latitud']]
            ];
            unset($r['latitud'], $r['longitud']);
        } else {
            $geometry = null;
        }

        $features[] = [
            "type" => "Feature",
            "geometry" => $geometry,
            "properties" => $r
        ];
    }

    echo json_encode([
        "type" => "FeatureCollection",
        "features" => $features
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
