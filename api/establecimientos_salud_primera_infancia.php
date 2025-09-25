<?php
header('Content-Type: application/json');
require_once '../config/conexion.php';
$sql = "SELECT cde, provincia, departamento, localidad, nombre, categoria, dependencia , ST_AsGeoJSON(the_geom)::json AS geometry
        FROM geografia_social.establecimientos_salud_primera_infancia WHERE the_geom is not null";
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