"use client"

import { useState, useEffect } from "react"
import { Calendar, Brain, TrendingUp, AlertTriangle, Cloud } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AWSIntegration from "@/components/aws-integration"

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

export function PredictivePageAWS() {
  const [forecastPeriod, setForecastPeriod] = useState("month")
  const [data, setData] = useState<PredictiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedAlcaldia, setSelectedAlcaldia] = useState<string>("")

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

  // Preparar datos para AWS
  const rawData = data.patientSegmentation.map(item => ({
    servicio_ingreso: item.servicio,
    total_facturado: item.total_facturado || item.costo_promedio * item.pacientes,
    dias_estancia: Math.round(Math.random() * 5) + 1, // Simulado
    alcaldia: ['IZTAPALAPA', 'GUSTAVO_A_MADERO', 'TLALPAN', 'COYOACAN'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análisis Predictivo con AWS</h2>
          <p className="text-muted-foreground">
            Proyecciones locales + modelos avanzados de AWS SageMaker
            {data.metadata.datos_reales && (
              <span className="ml-2 text-green-600 font-medium">• Datos Reales</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">AWS + Local</span>
          </div>
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

      <Tabs defaultValue="local" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Modelos Locales</span>
          </TabsTrigger>
          <TabsTrigger value="aws" className="flex items-center space-x-2">
            <Cloud className="w-4 h-4" />
            <span>AWS SageMaker</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-6">
          {/* Métricas de Modelos Locales */}
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
              <CardTitle>Pronóstico de Demanda (Local)</CardTitle>
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
                <CardTitle>Predicción de Costos (Local)</CardTitle>
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
        </TabsContent>

        <TabsContent value="aws" className="space-y-6">
          {/* Controles para AWS */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración de Predicciones</CardTitle>
                <CardDescription>
                  Selecciona parámetros para las predicciones AWS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Servicio</label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENCIAS">Urgencias</SelectItem>
                      <SelectItem value="HOSPITALIZACION">Hospitalización</SelectItem>
                      <SelectItem value="CONSULTA_EXTERNA">Consulta Externa</SelectItem>
                      <SelectItem value="CIRUGIA">Cirugía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Alcaldía</label>
                  <Select value={selectedAlcaldia} onValueChange={setSelectedAlcaldia}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alcaldía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IZTAPALAPA">Iztapalapa</SelectItem>
                      <SelectItem value="GUSTAVO_A_MADERO">Gustavo A. Madero</SelectItem>
                      <SelectItem value="TLALPAN">Tlalpan</SelectItem>
                      <SelectItem value="COYOACAN">Coyoacán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Dataset</CardTitle>
                <CardDescription>
                  Datos disponibles para predicciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Registros:</strong> {rawData.length}
                  </div>
                  <div>
                    <strong>Servicios únicos:</strong> {new Set(rawData.map(d => d.servicio_ingreso)).size}
                  </div>
                  <div>
                    <strong>Alcaldías únicas:</strong> {new Set(rawData.map(d => d.alcaldia)).size}
                  </div>
                  <div>
                    <strong>Última actualización:</strong> {data.metadata.ultima_actualizacion}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integración AWS */}
          <AWSIntegration 
            data={rawData}
            selectedService={selectedService}
            selectedAlcaldia={selectedAlcaldia}
          />
        </TabsContent>
      </Tabs>

      {/* Alertas Predictivas (siempre visible) */}
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
                <strong>Nota:</strong> Las predicciones combinan modelos locales con AWS SageMaker para mayor precisión.
                {data.metadata.total_registros && ` Procesados: ${data.metadata.total_registros.toLocaleString()} registros.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 