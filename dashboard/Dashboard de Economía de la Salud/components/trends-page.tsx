"use client"

import { useState, useEffect } from "react"
import { Calendar, AlertCircle } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Datos de ejemplo para patrones estacionales (mantenemos estos como demo)
const seasonalPatternData = {
  weekday: [
    { name: "Lun", urgencias: 85, hospitalizacion: 70, laboratorios: 90 },
    { name: "Mar", urgencias: 75, hospitalizacion: 75, laboratorios: 95 },
    { name: "Mié", urgencias: 70, hospitalizacion: 80, laboratorios: 100 },
    { name: "Jue", urgencias: 65, hospitalizacion: 85, laboratorios: 90 },
    { name: "Vie", urgencias: 80, hospitalizacion: 90, laboratorios: 85 },
    { name: "Sáb", urgencias: 100, hospitalizacion: 65, laboratorios: 60 },
    { name: "Dom", urgencias: 95, hospitalizacion: 60, laboratorios: 50 },
  ],
  month: [
    { name: "Ene", urgencias: 80, hospitalizacion: 90, laboratorios: 70 },
    { name: "Feb", urgencias: 85, hospitalizacion: 85, laboratorios: 75 },
    { name: "Mar", urgencias: 90, hospitalizacion: 95, laboratorios: 85 },
    { name: "Abr", urgencias: 85, hospitalizacion: 100, laboratorios: 90 },
    { name: "May", urgencias: 95, hospitalizacion: 90, laboratorios: 85 },
    { name: "Jun", urgencias: 100, hospitalizacion: 85, laboratorios: 95 },
    { name: "Jul", urgencias: 95, hospitalizacion: 80, laboratorios: 100 },
    { name: "Ago", urgencias: 90, hospitalizacion: 75, laboratorios: 90 },
    { name: "Sep", urgencias: 85, hospitalizacion: 80, laboratorios: 85 },
    { name: "Oct", urgencias: 90, hospitalizacion: 85, laboratorios: 80 },
    { name: "Nov", urgencias: 95, hospitalizacion: 90, laboratorios: 85 },
    { name: "Dic", urgencias: 100, hospitalizacion: 95, laboratorios: 75 },
  ],
}

interface TrendsData {
  timeSeriesData: any[];
  changeRateData: any[];
  rawData: any[];
  metadatos: {
    periodo_inicio?: string;
    periodo_fin?: string;
    total_registros?: number;
    nota: string;
  };
}

export function TrendsPage() {
  const [seasonalView, setSeasonalView] = useState("weekday")
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const seasonalData = seasonalPatternData[seasonalView as keyof typeof seasonalPatternData]

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        const response = await fetch('/api/tendencias')
        if (!response.ok) {
          throw new Error('Error al cargar datos de tendencias')
        }
        const data = await response.json()
        setTrendsData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendsData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando datos de tendencias...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-500">Error: {error}</div>
  }

  if (!trendsData) {
    return <div className="flex items-center justify-center h-96">No hay datos disponibles</div>
  }

  // Datos para comparativo interanual (simulado)
  const yearlyComparisonData = trendsData.rawData.map(mes => ({
    name: mes.name,
    actual: mes.total_facturado,
    anterior: mes.total_facturado * 0.92 // Simulamos 8% de crecimiento interanual
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tendencias Temporales</h2>
          <p className="text-muted-foreground">Análisis de la evolución temporal de métricas clave</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Datos: {trendsData.metadatos.periodo_inicio ? new Date(trendsData.metadatos.periodo_inicio).toLocaleDateString() : 'Ene 2025'} - 
            {trendsData.metadatos.periodo_fin ? new Date(trendsData.metadatos.periodo_fin).toLocaleDateString() : 'Abr 2025'}
          </span>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {trendsData.metadatos.nota} | Registros procesados: {trendsData.metadatos.total_registros?.toLocaleString() || 'N/A'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Series Temporales</CardTitle>
          <CardDescription>Evolución de costos totales con líneas para cada área (datos reales)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Costo"]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="urgencias"
                  name="Urgencias"
                  stackId="1"
                  fill="#10b981"
                  stroke="#10b981"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="hospitalizacion"
                  name="Hospitalización"
                  stackId="1"
                  fill="#3b82f6"
                  stroke="#3b82f6"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="laboratorios"
                  name="Laboratorios (estimado)"
                  stackId="1"
                  fill="#8b5cf6"
                  stroke="#8b5cf6"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patrones Estacionales</CardTitle>
            <CardDescription>Visualización de patrones por día de semana y mes (datos de ejemplo para DEMO)</CardDescription>
          </div>
          <Select value={seasonalView} onValueChange={setSeasonalView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekday">Por día de semana</SelectItem>
              <SelectItem value="month">Por mes</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Índice relativo"]} />
                <Legend />
                <Bar dataKey="urgencias" name="Urgencias" fill="#10b981" />
                <Bar dataKey="hospitalizacion" name="Hospitalización" fill="#3b82f6" />
                <Bar dataKey="laboratorios" name="Laboratorios" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo Interanual</CardTitle>
            <CardDescription>Comparación con período anterior (simulado para DEMO)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Costo"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="2025 (Real)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anterior"
                    name="2024 (Estimado)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Velocidad de Cambio</CardTitle>
            <CardDescription>Tasa de cambio de métricas clave (% mensual, datos reales)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData.changeRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                  <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Cambio"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cambio_facturado"
                    name="Facturación"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cambio_pacientes"
                    name="Pacientes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cambio_costo_promedio"
                    name="Costo Promedio"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
