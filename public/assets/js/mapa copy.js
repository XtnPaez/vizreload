// -----------------------
// Capas base
// -----------------------
var argenmap = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
    minZoom: 1,
    maxZoom: 20,
    attribution: '© IGN Argentina - Argenmap || SIEMPRO | Informática de Datos | Información Social'
});
var argenmap_gris = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
    minZoom: 1,
    maxZoom: 20,
    attribution: '© IGN Argentina - Argenmap Base Gris || SIEMPRO | Informática de Datos | Información Social'
});
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors || SIEMPRO | Informática de Datos | Información Social'
});

// -----------------------
// Inicialización del mapa
// -----------------------
var map = L.map('map', {
    center: [-38.5, -63],
    zoom: 4,
    layers: [argenmap]
});

// Control de capas base
var baseMaps = {
    "Argenmap": argenmap,
    "Argenmap Gris": argenmap_gris,
    "OpenStreetMap": osm
};
L.control.layers(baseMaps).addTo(map);

// -----------------------
// Objeto para guardar las capas activas
// -----------------------
var mapLayers = {};

// -----------------------
// Construir contenido del popup con labels
// -----------------------
function buildPopup(feature, capa) {
    let popupContent = '';

    if (Array.isArray(capa.popup_campos) && capa.popup_campos.length > 0) {
        capa.popup_campos.forEach(campo => {
            if (feature.properties[campo] !== undefined && feature.properties[campo] !== null) {
                let label = (capa.popup_labels && capa.popup_labels[campo]) 
                            ? capa.popup_labels[campo] 
                            : campo;
                popupContent += `<b>${label}:</b> ${feature.properties[campo]}<br>`;
            }
        });
    } else {
        // fallback: mostrar todos los atributos
        for (let key in feature.properties) {
            popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
        }
    }

    return popupContent;
}

function agregarCapa(capa) {
    fetch('../api/api.php?layer=' + encodeURIComponent(capa.id))
        .then(response => response.json())
        .then(data => {
            var geojsonLayer = L.geoJSON(data, {
                style: feature => ({ color: capa.color }),
                pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: capa.color,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }),
                onEachFeature: (feature, layer) => {
                    const popupContent = buildPopup(feature, capa);
                    if (popupContent) layer.bindPopup(popupContent);
                }
            }).addTo(map);

            geojsonLayer.capaInfo = capa; // guardamos info para la leyenda
            mapLayers[capa.id] = geojsonLayer;

            legend.update(); // actualizar leyenda
        })
        .catch(err => console.error('Error cargando capa:', capa.id, err));
}

function quitarCapa(id) {
    if (mapLayers[id]) {
        map.removeLayer(mapLayers[id]);
        delete mapLayers[id];
        legend.update(); // actualizar leyenda
    }
}

// -----------------------
// Construir sidebar dinámico
// -----------------------
function construirSidebar(capas) {
    var accordion = document.getElementById('accordionCapas');
    var grupos = {};

    // Agrupar capas por grupo
    capas.forEach(capa => {
        if (!grupos[capa.grupo]) grupos[capa.grupo] = [];
        grupos[capa.grupo].push(capa);
    });

    // Limpiar sidebar
    accordion.innerHTML = '';

    Object.keys(grupos).forEach((grupo, idx) => {
        var item = document.createElement('div');
        item.className = 'accordion-item';

        var header = document.createElement('h2');
        header.className = 'accordion-header';
        header.id = 'heading' + idx;

        var button = document.createElement('button');
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

        var collapse = document.createElement('div');
        collapse.id = 'collapse' + idx;
        collapse.className = 'accordion-collapse collapse';
        collapse.setAttribute('aria-labelledby', 'heading' + idx);
        collapse.setAttribute('data-bs-parent', '#accordionCapas');

        var body = document.createElement('div');
        body.className = 'accordion-body';

        // Checkboxes para cada capa
        grupos[grupo].forEach(capa => {
            var label = document.createElement('label');
            label.style.display = 'block';
            label.style.cursor = 'pointer';
            label.style.marginBottom = '5px';

            var checkbox = document.createElement('input');
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
// Inicialización: fetch catalogo y construir sidebar
// -----------------------
fetch('../api/catalogo.php')
    .then(response => response.json())
    .then(data => {
        construirSidebar(data.capas);
    })
    .catch(err => console.error('Error cargando catálogo:', err));

// -----------------------
// Control de leyenda
// -----------------------
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info legend');
    this.update();
    return this._div;
};

// Función para actualizar contenido de la leyenda
legend.update = function() {
    let content = '';
    Object.keys(mapLayers).forEach(id => {
        const layer = mapLayers[id].capaInfo; // guardamos info de la capa
        if (layer) {
            content += `<i style="background:${layer.color}; width:12px; height:12px; display:inline-block; margin-right:5px;"></i> ${layer.nombre}<br>`;
        }
    });
    this._div.innerHTML = content || '<i>No hay capas activas</i>';
};

legend.addTo(map);

