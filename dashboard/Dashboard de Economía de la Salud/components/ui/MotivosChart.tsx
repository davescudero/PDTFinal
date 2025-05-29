'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface MotivosChartProps {
  data: {
    motivo: string;
    costo_promedio: number;
    total_casos: number;
  }[];
}

export function MotivosChart({ data }: MotivosChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Costos por Motivo de Alta Hospitalización</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="motivo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="costo_promedio" name="Costo Promedio" fill="#8884d8" />
              <Bar dataKey="total_casos" name="Total Casos" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Nota: Los costos se muestran en pesos mexicanos. Los datos incluyen todos los motivos de alta registrados.
        </div>
      </CardContent>
    </Card>
  );
} 