# vizreload
automatizando viz

## Flujo de datos
                 ┌───────────────────────┐
                 │       PostgreSQL      │
                 │   Tabla: capas        │
                 │----------------------│
                 │ id                    │
                 │ nombre                │
                 │ grupo                 │
                 │ tipo                  │
                 │ color                 │
                 │ popup_campos          │
                 │ sql_query             │
                 │ activo                │
                 │ orden                 │
                 └─────────┬─────────────┘
                           │
                           │ JSON dinámico
                           ▼
                 ┌───────────────────────┐
                 │     catalogo.php      │
                 │  Devuelve capas con   │
                 │  metadatos (grupo,    │
                 │  nombre, color, tipo)│
                 └─────────┬─────────────┘
                           │
                           │ Fetch JSON
                           ▼
                 ┌───────────────────────┐
                 │   index.php / Sidebar │
                 │  Construye acordeones │
                 │  según grupos y capas│
                 └─────────┬─────────────┘
                           │
                           │ Evento click capa
                           ▼
                 ┌───────────────────────┐
                 │      api.php          │
                 │  Recibe layer=id      │
                 │  Busca sql_query en   │
                 │  Postgres y devuelve │
                 │  FeatureCollection    │
                 └─────────┬─────────────┘
                           │
                           │ GeoJSON
                           ▼
                 ┌───────────────────────┐
                 │      mapa.js          │
                 │  Carga GeoJSON        │
                 │  Agrega capa al mapa  │
                 │  Aplica color y popup │
                 └───────────────────────┘

## Flujo resumido

- Postgres → almacena metadatos y SQL de cada capa.
- catalogo.php → lee Postgres y genera JSON para el sidebar.
- Sidebar → se construye dinámicamente según JSON.
- Usuario clic en capa → JS llama a api.php?layer=xxx.
- api.php → ejecuta SQL de Postgres y devuelve GeoJSON.
- Mapa → recibe GeoJSON y despliega la capa con estilo y popup.