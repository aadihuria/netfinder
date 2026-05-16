import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics',
      maxzoom: 19,
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
};

const CENTER = [-83.35, 42.38];
const ZOOM = 9.5;

const TYPE_COLORS = {
  tennis: '#4da6ff',
  pickleball: '#00ff88',
  both: '#ffb800',
};

function makeMarkerEl(court) {
  const el = document.createElement('div');
  el.className = 'court-marker';

  const dot = document.createElement('div');
  dot.className = `marker-dot ${court.availability}`;
  dot.style.borderColor = TYPE_COLORS[court.type] || '#fff';

  const label = document.createElement('div');
  label.className = 'marker-label';
  label.textContent = court.type === 'pickleball' ? 'P' : court.type === 'tennis' ? 'T' : '✦';

  dot.appendChild(label);
  el.appendChild(dot);
  return el;
}

export default function Map({ courts, selectedCourt, onSelectCourt, userLocation, satelliteMode }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: DARK_STYLE,
      center: CENTER,
      zoom: ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const style = satelliteMode ? SATELLITE_STYLE : DARK_STYLE;

    const onStyleLoad = () => {
      const loc = userLocationRef.current;
      if (loc) addUserCircle(map, loc);
    };

    map.once('style.load', onStyleLoad);
    map.setStyle(style);
  }, [satelliteMode]);

  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !courts.length) return;

    const addMarkers = () => {
      clearMarkers();
      courts.forEach(court => {
        const el = makeMarkerEl(court);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([court.lng, court.lat])
          .addTo(map);
        el.addEventListener('click', () => onSelectCourt(court));
        markersRef.current[court.id] = marker;
      });
    };

    if (map.isStyleLoaded()) addMarkers();
    else map.once('load', addMarkers);

    const onStyleLoad = () => addMarkers();
    map.on('style.load', onStyleLoad);
    return () => map.off('style.load', onStyleLoad);
  }, [courts, clearMarkers, onSelectCourt]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedCourt) return;
    map.flyTo({
      center: [selectedCourt.lng, selectedCourt.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 800,
      essential: true,
    });
  }, [selectedCourt]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userLocation) return;

    userLocationRef.current = userLocation;

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.className = 'user-location-dot';
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 12, duration: 1200 });

    if (map.isStyleLoaded()) addUserCircle(map, userLocation);
    else map.once('load', () => addUserCircle(map, userLocation));
  }, [userLocation]);

  return <div ref={mapRef} className="map-container" />;
}

function addUserCircle(map, loc) {
  const srcId = 'user-radius';
  if (map.getLayer('user-radius-fill')) map.removeLayer('user-radius-fill');
  if (map.getLayer('user-radius-outline')) map.removeLayer('user-radius-outline');
  if (map.getSource(srcId)) map.removeSource(srcId);

  map.addSource(srcId, { type: 'geojson', data: makeCircle([loc.lng, loc.lat], 8) });
  map.addLayer({ id: 'user-radius-fill', type: 'fill', source: srcId, paint: { 'fill-color': '#4da6ff', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'user-radius-outline', type: 'line', source: srcId, paint: { 'line-color': '#4da6ff', 'line-width': 1.5, 'line-opacity': 0.4 } });
}

function makeCircle([lng, lat], radiusMiles) {
  const R = 3958.8;
  const steps = 64;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = (i * 360) / steps;
    const rad = (bearing * Math.PI) / 180;
    const dLat = (radiusMiles / R) * (180 / Math.PI) * Math.cos(rad);
    const dLng = (radiusMiles / R) * (180 / Math.PI) * Math.sin(rad) / Math.cos(lat * Math.PI / 180);
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } };
}
