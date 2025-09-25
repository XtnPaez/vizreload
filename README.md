# vizreload
automatizando viz

## Flujo de datos
                
[PostgreSQL - Tabla capas]
    │
    │ catalogo dinámico (metadatos)
    ▼
[catalogo.php]  ------------------> Fetch JSON
    │
    │ JSON dinámico de capas activas
    ▼
[mapa.js - JS dinámico]
    │
    ├─ Construye sidebar
    │   ├─ Agrupa por 'grupo' (accordion)
    │   └─ Crea checkbox/botón para cada capa
    │
    ├─ Usuario selecciona una capa
    │       │
    │       ▼
    │   Fetch: api.php?layer=id_capa
    │       │
    │       ▼
    │   [api.php] --> ejecuta sql_query desde Postgres
    │       │
    │       ▼
    │   GeoJSON dinámico
    │
    └─ JS recibe GeoJSON
            │
            ▼
        L.geoJSON(geojson, {
            style: color,
            onEachFeature: popup_campos
        }).addTo(map)
            │
            ▼
        Capa visible en el mapa
            │
            └─ Si usuario deselecciona → map.removeLayer()


## Flujo resumido

- catalogo.php → devuelve JSON con metadatos de todas las capas activas.
- mapa.js → crea dinámicamente el sidebar con acordeones y checkboxes por capa.
- Usuario activa una capa → JS hace fetch a api.php?layer=id_capa.
- api.php → ejecuta sql_query de esa capa en Postgres, devuelve GeoJSON.
- JS recibe GeoJSON → crea L.geoJSON y lo agrega al mapa con estilo y popup.
- Usuario desactiva la capa → JS remueve la capa del mapa en memoria (map.removeLayer()).