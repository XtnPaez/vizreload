<?php
header('Content-Type: application/json');
require_once '../config/conexion.php';
$sql = "SELECT sgt, regional, provincia, localidad, direccion, latitud, longitud, ST_AsGeoJSON(the_geom)::json AS geometry
        FROM geografia_social.oficinas_anses";
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
