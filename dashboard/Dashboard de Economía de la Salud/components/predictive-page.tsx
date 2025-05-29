"use client"

import { useState, useEffect } from "react"
import { Calendar, Brain, TrendingUp, AlertTriangle } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PredictiveData {
  demandPredictions: Array<{
    fecha: string;
    pacientes_predichos: number;
    urgencias_estimadas: number;
    hospitalizacion_estimada: number;
  }>;
  costPredictions: Array<{
    name: string;
    actual: number | null;
    prediccion: number;
    tipo: string;
  }>;
  patientSegmentation: Array<{
    servicio: string;
    cluster: number;
    cluster_name: string;
    pacientes: number;
    costo_promedio: number;
    total_facturado?: number;
    porcentaje: number;
    x?: number;
    y?: number;
    z?: number;
  }>;
  predictiveAlerts: Array<{
    id: number;
    service: string;
    prediction: string;
    confidence: string;
    impact: string;
    descripcion: string;
    valor_actual?: number;
    modelo_usado?: string;
  }>;
  modelMetrics: {
    demanda: {
      precision: string;
      algoritmo: string;
      tendencia_diaria: number;
      promedio_historico: number;
    };
    costos: {
      precision: string;
      algoritmo: string;
      crecimiento_mensual: number;
      promedio_mensual: number;
    };
    clustering: {
      precision: string;
      algoritmo: string;
      n_clusters: number;
      n_servicios: number;
    };
  };
  metadata: {
    ultima_actualizacion: string;
    modelos_disponibles: {
      demanda: boolean;
      costos: boolean;
      clustering: boolean;
    };
    version_modelos: string;
    datos_reales: boolean;
    periodo_entrenamiento?: string;
    total_registros?: number;
  };
}

export function PredictivePage() {
  const [forecastPeriod, setForecastPeriod] = useState("month")
  const [data, setData] = useState<PredictiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/predictive')
        if (!response.ok) {
          throw new Error('Error al cargar datos predictivos')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Cargando modelos predictivos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">{error || 'Error al cargar datos'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Transformar datos de demanda para el gráfico
  const demandChartData = data.demandPredictions.slice(0, 7).map((item, index) => ({
    name: `Día ${index + 1}`,
    fecha: item.fecha,
    urgencias: item.urgencias_estimadas,
    hospitalizacion: item.hospitalizacion_estimada,
    total: item.pacientes_predichos,
    tipo: index < 4 ? 'historico' : 'prediccion'
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análisis Predictivo</h2>
          <p className="text-muted-foreground">
            Proyecciones y modelos predictivos para anticipar tendencias
            {data.metadata.datos_reales && (
              <span className="ml-2 text-green-600 font-medium">• Datos Reales</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              {data.metadata.version_modelos}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.metadata.periodo_entrenamiento || 'Proyección: 30 días'}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas de Modelos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo de Demanda</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.modelMetrics.demanda.precision}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.modelMetrics.demanda.algoritmo}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Tendencia: {data.modelMetrics.demanda.tendencia_diaria.toFixed(3)} pacientes/día
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo de Costos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.modelMetrics.costos.precision}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.modelMetrics.costos.algoritmo}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Crecimiento: {data.modelMetrics.costos.crecimiento_mensual.toFixed(1)}%/mes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clustering</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.modelMetrics.clustering.precision}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.modelMetrics.clustering.algoritmo}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              {data.modelMetrics.clustering.n_clusters} clusters, {data.modelMetrics.clustering.n_servicios} servicios
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pronóstico de Demanda</CardTitle>
          <CardDescription>
            Proyección de volumen de pacientes por área - {data.modelMetrics.demanda.algoritmo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Pacientes", angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload
                    return item ? `${label} (${item.fecha})` : label
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="urgencias"
                  name="Urgencias"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="hospitalizacion"
                  name="Hospitalización"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Predicción de Costos</CardTitle>
            <CardDescription>
              Estimación de costos totales - {data.modelMetrics.costos.algoritmo}
            </CardDescription>
          </div>
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensual</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={data.costPredictions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString() || "N/A"}`, "Costo"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="prediccion"
                  name="Predicción"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segmentación de Pacientes</CardTitle>
            <CardDescription>
              Clusters de servicios según patrones de facturación - {data.modelMetrics.clustering.algoritmo}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Volumen"
                    label={{ value: "% del total de pacientes", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Costo"
                    label={{ value: "Costo promedio (K)", angle: -90, position: "insideLeft" }}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 500]} name="Facturación" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="font-medium">{data.servicio}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <div>Cluster: {data.cluster_name}</div>
                              <div>Pacientes: {data.pacientes}</div>
                              <div>Costo promedio: ${data.costo_promedio?.toLocaleString()}</div>
                              <div>Porcentaje: {data.porcentaje}%</div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter 
                    name="Servicios" 
                    data={data.patientSegmentation.map(item => ({
                      ...item,
                      x: item.x || item.porcentaje,
                      y: item.y || (item.costo_promedio / 1000),
                      z: item.z || Math.min(item.pacientes * 2, 500)
                    }))} 
                    fill="#8b5cf6" 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {Array.from(new Set(data.patientSegmentation.map(item => item.cluster_name))).map((clusterName, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" style={{ opacity: 0.7 + (index * 0.1) }}></div>
                  <span>{clusterName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas Predictivas</CardTitle>
            <CardDescription>
              Servicios que podrían experimentar cambios significativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Predicción</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Confianza</TableHead>
                  <TableHead>Impacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.predictiveAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.service}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={alert.prediction.includes("Incremento") ? "text-red-500" : "text-green-500"}>
                          {alert.prediction}
                        </span>
                        {alert.valor_actual && (
                          <span className="text-xs text-muted-foreground">
                            Actual: ${alert.valor_actual.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {alert.modelo_usado || 'ML'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          alert.confidence === "Alta"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : alert.confidence === "Media"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }
                      >
                        {alert.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          alert.impact === "Alto"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : alert.impact === "Medio"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }
                      >
                        {alert.impact}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.predictiveAlerts.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Las predicciones se basan en {data.metadata.datos_reales ? 'datos reales' : 'datos simulados'} 
                  del período {data.metadata.periodo_entrenamiento || 'actual'}.
                  {data.metadata.total_registros && ` Procesados: ${data.metadata.total_registros.toLocaleString()} registros.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
