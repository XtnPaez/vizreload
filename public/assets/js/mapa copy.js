// -----------------------
// Capas base
// -----------------------
var argenmap = L.tileLayer(
    'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png',
    { minZoom: 1, maxZoom: 20, attribution: '© IGN Argentina - Argenmap || Ministerio de Capital Humano || CNCPS || SIEMPRO' }
);
var argenmap_gris = L.tileLayer(
    'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png',
    { minZoom: 1, maxZoom: 20, attribution: '© IGN Argentina - Argenmap Base Gris || Ministerio de Capital Humano || CNCPS || SIEMPRO' }
);
var osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors || Ministerio de Capital Humano || CNCPS || SIEMPRO' }
);

// -----------------------
// Inicialización del mapa
// -----------------------
var map = L.map('map', {
    center: [-38.5, -63],
    zoom: 4,
    layers: [argenmap]
});

// -----------------------
// Crear panes para control de orden
// -----------------------
map.createPane('limites_provincias');
map.getPane('limites_provincias').style.zIndex = 200;

map.createPane('limites_departamentos');
map.getPane('limites_departamentos').style.zIndex = 300;

map.createPane('capasActivas');
map.getPane('capasActivas').style.zIndex = 400;

// -----------------------
// Control de capas base
// -----------------------
var baseMaps = { "Argenmap": argenmap, "Argenmap Gris": argenmap_gris, "OpenStreetMap": osm };
L.control.layers(baseMaps).addTo(map);

// -----------------------
// Objeto para guardar capas activas
// -----------------------
var mapLayers = {};

// -----------------------
// Función para construir sidebar
// -----------------------
function construirSidebar(capas) {
    const accordion = document.getElementById('accordionCapas');
    const grupos = {};

    capas.forEach(capa => {
        if (!grupos[capa.grupo]) grupos[capa.grupo] = [];
        grupos[capa.grupo].push(capa);
    });

    accordion.innerHTML = '';

    Object.keys(grupos).forEach((grupo, idx) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';

        const header = document.createElement('h2');
        header.className = 'accordion-header';
        header.id = 'heading' + idx;

        const button = document.createElement('button');
        button.className = 'accordion-button collapsed fw-bold text-white';
        button.type = 'button';
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', '#collapse' + idx);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'collapse' + idx);
        button.style.backgroundColor = '#34495e';
        button.textContent = grupo;

        header.appendChild(button);
        item.appendChild(header);

        const collapse = document.createElement('div');
        collapse.id = 'collapse' + idx;
        collapse.className = 'accordion-collapse collapse';
        collapse.setAttribute('aria-labelledby', 'heading' + idx);
        collapse.setAttribute('data-bs-parent', '#accordionCapas');

        const body = document.createElement('div');
        body.className = 'accordion-body';

        grupos[grupo].forEach(capa => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.cursor = 'pointer';
            label.style.marginBottom = '5px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = capa.id;
            checkbox.style.marginRight = '5px';

            checkbox.addEventListener('change', function() {
                if (this.checked) agregarCapa(capa);
                else quitarCapa(capa.id);
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(capa.nombre));
            body.appendChild(label);
        });

        collapse.appendChild(body);
        item.appendChild(collapse);
        accordion.appendChild(item);
    });
}

// -----------------------
// Función para construir popups con título de capa
// -----------------------
function buildPopup(feature, capa) {
    let content = `
        <div style="
            font-weight: bold;
            font-size: 16px;
            color: #ffffff;
            background-color: #34495e;
            padding: 4px 6px;
            border-radius: 4px 4px 0 0;
            margin-bottom: 4px;
        ">
            ${capa.nombre}
        </div>
    `;

    if (feature.properties && capa.popup_campos && capa.popup_campos.length > 0) {
        capa.popup_campos.forEach(pc => {
            if (feature.properties[pc] !== undefined) {
                const label = capa.popup_labels && capa.popup_labels[pc] ? capa.popup_labels[pc] : pc;
                content += `<b>${label}:</b> ${feature.properties[pc]}<br>`;
            }
        });
    } else {
        content += '<i>No hay datos disponibles</i>';
    }

    return content;
}

// -----------------------
// Función para agregar capa al mapa
// -----------------------
function agregarCapa(capa) {
    fetch('../api/api.php?layer=' + encodeURIComponent(capa.id))
        .then(res => res.json())
        .then(data => {
            let paneName = 'capasActivas';

            if (capa.tipo === 'poligono') {
                if (capa.nombre.toLowerCase().includes('provincia')) paneName = 'limites_provincias';
                else if (capa.nombre.toLowerCase().includes('departamento')) paneName = 'limites_departamentos';
            }

            const geojsonLayer = L.geoJSON(data, {
                pane: paneName,
                style: feature => {
                    if (capa.tipo === 'poligono') {
                        let weight = 1;
                        if (capa.nombre.toLowerCase().includes('provincia')) weight = 4;
                        if (capa.nombre.toLowerCase().includes('departamento')) weight = 2;
                        return {
                            color: capa.color,
                            weight: weight,
                            fillColor: 'transparent',
                            fillOpacity: 0
                        };
                    }
                    return {};
                },
                pointToLayer: (feature, latlng) => {
                    if (capa.tipo === 'puntos') {
                        return L.circleMarker(latlng, {
                            radius: 4,
                            fillColor: capa.color,
                            color: null,
                            weight: 0,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    }
                    return null;
                },
                onEachFeature: (feature, layer) => {
                    const popupContent = buildPopup(feature, capa);
                    if (popupContent) layer.bindPopup(popupContent);
                }
            }).addTo(map);

            geojsonLayer.capaInfo = capa;
            mapLayers[capa.id] = geojsonLayer;

            // Limites siempre al fondo de su pane
            geojsonLayer.bringToBack();

            legend.update();
        })
        .catch(err => console.error('Error cargando capa:', capa.id, err));
}

// -----------------------
// Función para quitar capa
// -----------------------
function quitarCapa(id) {
    if (mapLayers[id]) {
        map.removeLayer(mapLayers[id]);
        delete mapLayers[id];
        legend.update();
    }
}

// -----------------------
// Control de leyenda
// -----------------------
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info legend');
    this.update();
    return this._div;
};

legend.update = function() {
    let content = '';
    Object.keys(mapLayers).forEach(id => {
        const layer = mapLayers[id].capaInfo;
        if (layer) {
            let iconHtml = '';
            if (layer.tipo === 'puntos') {
                iconHtml = `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${layer.color};margin-right:5px;"></span>`;
            } else if (layer.tipo === 'poligono') {
                iconHtml = `<span style="display:inline-block;width:12px;height:12px;border:2px solid ${layer.color};margin-right:5px;"></span>`;
            }
            content += `${iconHtml}${layer.nombre}<br>`;
        }
    });
    this._div.innerHTML = content || '<i>No hay capas activas</i>';
};

legend.addTo(map);

// -----------------------
// Inicialización
// -----------------------
fetch('../api/catalogo.php')
    .then(res => res.json())
    .then(data => construirSidebar(data.capas))
    .catch(err => console.error('Error cargando catálogo:', err));
