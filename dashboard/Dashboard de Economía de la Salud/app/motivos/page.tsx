'use client';

import { MotivosChart } from '@/components/ui/MotivosChart';
import { useEffect, useState } from 'react';

export default function MotivosPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/costos-por-motivo');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Análisis de Costos por Motivo de Alta</h1>
      <MotivosChart data={data} />
    </div>
  );
} 