<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>EFPI : Home</title>    
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <!-- Leaflet CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <!-- home CSS -->
        <link href="assets/css/home.css" rel="stylesheet" />
    </head>
    <body>
        <?php include 'includes/navbar.php'; ?>
        <!-- Sidebar -->
        <div id="sidebar" class="p-3">
            <!-- Logos -->
            <div class="text-center mb-3">
                <img src="../public/assets/images/CNCPSSIEMPROAZUL.png" alt="Logo EFPI" class="img-fluid mb-2" style="max-height: 100px;">
            </div>
            <!-- Acordeones -->
            <div class="accordion" id="accordionCapas">
                <!-- Los acordeones se generan dinámicamente desde mapa.js -->
            </div>
        </div>
        <!-- Mapa -->
        <div id="map"></div>
        <?php include 'includes/footer.php'; ?>
        <!-- Bootstrap JS Bundle -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <!-- Leaflet JS -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <!-- Mapa JS dinámico -->
        <script src="assets/js/mapa.js"></script>
    </body>
</html>