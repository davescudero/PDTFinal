'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { LatLngExpression, GeoJSON as LeafletGeoJSON, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface MapProps {
  data: {
    alcaldia: string;
    costo_promedio: number;
    total_casos: number;
  }[];
}

interface GeoJSONFeature {
  type: string;
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export function CostMap({ data }: MapProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const mapRef = useRef<LeafletMap>(null);

  useEffect(() => {
    // Cargar el GeoJSON
    fetch('/datos/alcaldias.json')
      .then(response => response.json())
      .then(data => setGeoData(data));
  }, []);

  // Función para colorear las alcaldías según el costo
  const getColor = (costo: number) => {
    if (costo > 200000) return '#ff0000';
    if (costo > 150000) return '#ff4d4d';
    if (costo > 100000) return '#ff8080';
    if (costo > 50000) return '#ffb3b3';
    return '#ffe6e6';
  };

  // Función para obtener el estilo de cada alcaldía
  const getStyle = (feature: GeoJSONFeature) => {
    const alcaldiaData = data.find(d => d.alcaldia === feature.properties.name);
    return {
      fillColor: alcaldiaData ? getColor(alcaldiaData.costo_promedio) : '#ccc',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Función para mostrar información al hacer hover
  const onEachFeature = (feature: GeoJSONFeature, layer: LeafletGeoJSON) => {
    const alcaldiaData = data.find(d => d.alcaldia === feature.properties.name);
    if (alcaldiaData) {
      layer.bindPopup(`
        <strong>${feature.properties.name}</strong><br/>
        Costo Promedio: $${alcaldiaData.costo_promedio.toLocaleString()}<br/>
        Total Casos: ${alcaldiaData.total_casos}
      `);
    }
  };

  const mapCenter: LatLngExpression = [19.4326, -99.1332]; // Coordenadas de CDMX

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Distribución de Costos por Alcaldía</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] w-full">
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {geoData && (
              <GeoJSON
                data={geoData}
                style={getStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Nota: Los datos mostrados son una muestra representativa. Algunas alcaldías no aparecen debido a valores nulos en los datos demográficos.
        </div>
      </CardContent>
    </Card>
  );
} 