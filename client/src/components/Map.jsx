import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

// Free CARTO dark-matter style — no token, no credit card
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CENTER = [-83.35, 42.38];
const ZOOM = 9.5;

function makeMarkerEl(availability) {
  const el = document.createElement('div');
  el.className = 'court-marker';
  const dot = document.createElement('div');
  dot.className = `marker-dot ${availability}`;
  el.appendChild(dot);
  return el;
}

export default function Map({ courts, selectedCourt, onSelectCourt, userLocation, heatmapMode }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

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
        const el = makeMarkerEl(court.availability);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([court.lng, court.lat])
          .addTo(map);
        el.addEventListener('click', () => onSelectCourt(court));
        markersRef.current[court.id] = marker;
      });
    };

    if (map.isStyleLoaded()) addMarkers();
    else map.once('load', addMarkers);
  }, [courts, clearMarkers, onSelectCourt]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedCourt) return;
    map.flyTo({
      center: [selectedCourt.lng, selectedCourt.lat],
      zoom: Math.max(map.getZoom(), 13),
      duration: 800,
      essential: true,
    });
  }, [selectedCourt]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.cssText = `
      width:16px;height:16px;border-radius:50%;
      background:#4da6ff;border:3px solid #fff;
      box-shadow:0 0 12px #4da6ff;
    `;
    userMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 12, duration: 1200 });

    const addCircle = () => {
      const srcId = 'user-radius';
      if (map.getLayer('user-radius-fill')) map.removeLayer('user-radius-fill');
      if (map.getLayer('user-radius-outline')) map.removeLayer('user-radius-outline');
      if (map.getSource(srcId)) map.removeSource(srcId);

      map.addSource(srcId, { type: 'geojson', data: makeCircle([userLocation.lng, userLocation.lat], 8) });
      map.addLayer({ id: 'user-radius-fill', type: 'fill', source: srcId, paint: { 'fill-color': '#4da6ff', 'fill-opacity': 0.06 } });
      map.addLayer({ id: 'user-radius-outline', type: 'line', source: srcId, paint: { 'line-color': '#4da6ff', 'line-width': 1.5, 'line-opacity': 0.4 } });
    };

    if (map.isStyleLoaded()) addCircle();
    else map.once('load', addCircle);
  }, [userLocation]);

  return <div ref={mapRef} className={`map-container${heatmapMode ? ' heatmap-active' : ''}`} />;
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
