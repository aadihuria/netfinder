import { useState, useEffect, useCallback } from 'react';
import { haversine } from '../utils/distance.js';

export const API_BASE = import.meta.env.VITE_API_URL || '';

export function useCourts() {
  const [allCourts, setAllCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/courts`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAllCourts(data);
    } catch (e) {
      setError('Cannot reach server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourts(); }, [fetchCourts]);
  return { allCourts, loading, error, refetch: fetchCourts };
}

export function filterAndSort(courts, filters, userLocation) {
  let result = [...courts];
  if (filters.type && filters.type !== 'all') result = result.filter(c => c.type === filters.type);
  if (filters.surface && filters.surface !== 'all') result = result.filter(c => c.surface === filters.surface);
  if (filters.lights === 'yes') result = result.filter(c => c.lights);
  if (filters.lights === 'no') result = result.filter(c => !c.lights);
  if (filters.indoor === 'indoor') result = result.filter(c => c.indoor);
  if (filters.indoor === 'outdoor') result = result.filter(c => !c.indoor);
  if (filters.availability && filters.availability !== 'all') result = result.filter(c => c.availability === filters.availability);
  if (filters.free === 'true') result = result.filter(c => c.free === true);
  if (filters.free === 'false') result = result.filter(c => c.free === false);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
  }
  if (userLocation && filters.maxMiles < 99) {
    result = result.filter(c => haversine(userLocation.lat, userLocation.lng, c.lat, c.lng) <= filters.maxMiles);
  }
  if (userLocation && filters.sort === 'distance') {
    result.sort((a, b) =>
      haversine(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      haversine(userLocation.lat, userLocation.lng, b.lat, b.lng)
    );
  } else if (filters.sort === 'availability') {
    const order = { open: 0, busy: 1, full: 2 };
    result.sort((a, b) => (order[a.availability] ?? 9) - (order[b.availability] ?? 9));
  } else if (filters.sort === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }
  return result;
}
