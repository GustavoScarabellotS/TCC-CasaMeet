document.addEventListener('DOMContentLoaded', function() {
    var map;
    let userLat, userLon;

    function initializeMap(location) {
        if (map) {
            map.remove();
        }
        map = L.map('map').setView([location.lat, location.lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([location.lat, location.lon]).addTo(map)
            .bindPopup('sua Localização')
            .openPopup();
    }

    function getUserLocationByIP() {
        return fetch('https://ipapi.co/json/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`erro HTTP! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                userLat = data.latitude;
                userLon = data.longitude;
                console.log(`localização do usuário: ${userLat}, ${userLon}`);
                return { lat: userLat, lon: userLon };
            });
    }

    function getUserLocationByBrowser() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    error => {
                        reject(new Error('erro geolocalização: ' + error.message));
                    }
                );
            } else {
                reject(new Error('geolocalização não é suportada para esse navegador.'));
            }
        });
    }

    function showManualLocationInput() {
        const form = document.getElementById('distanceForm');
        if (!document.getElementById('manualLocation')) {
            const manualLocationInput = document.createElement('input');
            manualLocationInput.type = 'text';
            manualLocationInput.id = 'manualLocation';
            manualLocationInput.placeholder = 'Digite sua localização (ex, cidade, rua)';
            form.insertBefore(manualLocationInput, form.firstChild);
        }
    }

    function listNearbyProperties() {
        fetch('/lista-imovel')
            .then(response => response.json())
            .then(imoveis => {
                displayProperties(imoveis);
                updateMap(imoveis);
            })
            .catch(error => {
                console.error('erro ao buscar imóveis:', error);
            });
    }

    function displayProperties(imoveis) {
        const list = document.getElementById('imoveis-list');
        list.innerHTML = '';
        imoveis.forEach(imovel => {
            const item = document.createElement('div');
            item.innerHTML = `
                <h3>${imovel.nome_imovel}</h3>
                <p>CEP: ${imovel.cep}</p>
                <p>Distância: ${imovel.distancia.toFixed(2)} km</p>
                <img src="${imovel.imagemUrl}" alt="${imovel.nome_imovel}" style="max-width: 200px;">
            `;
            list.appendChild(item);
        });
    }

    function updateMap(imoveis) {
  
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

       
        imoveis.forEach(imovel => {
            L.marker([imovel.latitude, imovel.longitude])
                .addTo(map)
                .bindPopup(`${imovel.nome_imovel}<br>Distância: ${imovel.distancia.toFixed(2)} km`);
        });

   
        if (imoveis.length > 0) {
            const bounds = L.latLngBounds(imoveis.map(imovel => [imovel.latitude, imovel.longitude]));
            map.fitBounds(bounds);
        }
    }

    function getCoordsFromCEP(cep) {
        return fetch(`https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`)
            .then(response => response.json())
            .then(results => {
                if (results.length > 0) {
                    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
                } else {
                    console.warn(`CEP não encontrado: ${cep}`);
                    return { lat: null, lon: null };
                }
            })
            .catch(error => {
                console.error(`erro ao buscar coordenadas para CEP ${cep}:`, error);
                return { lat: null, lon: null };
            });
    }

    function haversineDistance(coords1, coords2) {
        function toRad(x) {
            return x * Math.PI / 180;
        }
        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;
        const R = 6371; // Raio da terra em km blah blah blah
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

   
    function initializePage() {
        getUserLocationByIP()
            .then(location => {
                initializeMap(location);
                listNearbyProperties();
            })
            .catch(error => {
                console.error('erro ao obter localização:', error);
                showManualLocationInput();
            });
    }

   
    initializePage();
});
