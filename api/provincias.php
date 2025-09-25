<?php
header('Content-Type: application/json');
require_once '../config/conexion.php';
$sql = "SELECT gid, nam AS \"NOMBRE\", cpro, ST_AsGeoJSON(the_geom) AS geometry FROM demarcacion.provincia ORDER BY gid ASC";
try {
    $stmt = $pdo->query($sql);
    $features = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $geometry = json_decode($row['geometry']);
        unset($row['geometry']);
        $features[] = [
            "type" => "Feature",
            "geometry" => $geometry,
            "properties" => $row
        ];
    }
    $geojson = [
        "type" => "FeatureCollection",
        "features" => $features
    ];
    echo json_encode($geojson);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}