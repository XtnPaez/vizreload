<?php
header('Content-Type: application/json');
require_once '../config/conexion.php';
$sql = "SELECT numero_oficina AS \"OFICINA\", denominacion, domicilio, ST_AsGeoJSON(geom)::json AS geometry
        FROM geografia_social.centros_documentacion_renaper WHERE geom is not null";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$features = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $geometry = json_decode($row['geometry']); // <- importante
    unset($row['geometry']);
    $features[] = [
        "type" => "Feature",
        "geometry" => $geometry,
        "properties" => $row
    ];
}
echo json_encode([
    "type" => "FeatureCollection",
    "features" => $features
]);