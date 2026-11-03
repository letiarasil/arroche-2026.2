import { useState, useEffect } from 'react';
import { getActiveTrails } from '../services/trailService';

export function useTrails() {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      const data = await getActiveTrails();
      setTrails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrails();
  }, []);

  return { trails, loading, error, refreshTrails: fetchTrails };
}