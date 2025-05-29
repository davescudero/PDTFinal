"use client"

import { useState, useEffect } from "react"
import { BarChartIcon, DollarSign, Users, AlertCircle, Package } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Colores para los gráficos
const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"]

interface AreasData {
  areas: {
    [key: string]: {
      title: string;
      metricas_principales: {
        costo_total: number;
        pacientes_atendidos: number;
        costo_promedio: number;
        estancia_promedio: number;
        porcentaje_total: number;
      };
      costBreakdown: Array<{
        name: string;
        value: number;
        valor_absoluto: number;
      }>;
      insumos_especificos: Array<{
        nombre: string;
        cantidad_mensual: number;
        costo_unitario: number;
        categoria: string;
      }>;
      distribucion_motivos: Array<{
        name: string;
        value: number;
        pacientes: number;
        costo_promedio: number;
      }>;
    };
  };
  metadatos: {
    periodo_inicio?: string;
    periodo_fin?: string;
    total_registros?: number;
    nota: string;
  };
}

export function AreasPage() {
  const [selectedArea, setSelectedArea] = useState("urgencias")
  const [areasData, setAreasData] = useState<AreasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAreasData = async () => {
      try {
        const response = await fetch('/api/areas')
        if (!response.ok) {
          throw new Error('Error al cargar datos de áreas')
        }
        const data = await response.json()
        setAreasData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchAreasData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando datos de áreas...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-500">Error: {error}</div>
  }

  if (!areasData) {
    return <div className="flex items-center justify-center h-96">No hay datos disponibles</div>
  }

  const data = areasData.areas[selectedArea]
  if (!data) {
    return <div className="flex items-center justify-center h-96">Área no encontrada</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análisis por Áreas</h2>
          <p className="text-muted-foreground">Análisis detallado por área de servicio con datos reales</p>
        </div>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgencias">Urgencias</SelectItem>
            <SelectItem value="hospitalizacion">Hospitalización</SelectItem>
            <SelectItem value="laboratorios">Laboratorios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {areasData.metadatos.nota} | Registros: {areasData.metadatos.total_registros?.toLocaleString() || 'N/A'}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Seleccionada</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.title}</div>
            <p className="text-xs text-muted-foreground">Análisis detallado de costos y servicios</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.metricas_principales.costo_total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.metricas_principales.porcentaje_total.toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metricas_principales.pacientes_atendidos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En el período analizado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.metricas_principales.costo_promedio.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Estancia: {data.metricas_principales.estancia_promedio.toFixed(1)} días
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="costos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="costos">Análisis de Costos</TabsTrigger>
          <TabsTrigger value="insumos">Insumos Específicos</TabsTrigger>
          <TabsTrigger value="motivos">Distribución por Motivos</TabsTrigger>
        </TabsList>

        <TabsContent value="costos" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Costos</CardTitle>
                <CardDescription>Desglose de costos dentro del área seleccionada (datos reales)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.costBreakdown}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value}% ($${data.costBreakdown.find(item => item.name === name)?.valor_absoluto.toLocaleString()})`,
                          "Porcentaje"
                        ]} 
                      />
                  <Legend />
                  <Bar dataKey="value" name="Porcentaje" fill="#10b981">
                    {data.costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
                <CardTitle>Resumen de Costos</CardTitle>
                <CardDescription>Valores absolutos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.costBreakdown.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">${item.valor_absoluto.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.value}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Insumos Específicos
              </CardTitle>
              <CardDescription>
                Detalle de insumos principales utilizados en {data.title} (estimaciones basadas en estándares)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad/Mes</TableHead>
                    <TableHead className="text-right">Costo Unitario</TableHead>
                    <TableHead className="text-right">Costo Total/Mes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.insumos_especificos.map((insumo, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{insumo.nombre}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          insumo.categoria === 'Medicamentos' ? 'bg-blue-100 text-blue-800' :
                          insumo.categoria === 'Equipamiento médico' ? 'bg-purple-100 text-purple-800' :
                          insumo.categoria === 'Reactivos' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {insumo.categoria}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{insumo.cantidad_mensual.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${insumo.costo_unitario.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        ${(insumo.cantidad_mensual * insumo.costo_unitario).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivos" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
                <CardTitle>Distribución por Motivos</CardTitle>
                <CardDescription>
                  {selectedArea === "urgencias"
                    ? "Distribución por motivo de alta (datos reales)"
                    : selectedArea === "hospitalizacion"
                      ? "Distribución por motivo de egreso (datos reales)"
                      : "Distribución por motivo de solicitud (estimado)"}
                </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.distribucion_motivos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Porcentaje"]} />
                  <Legend />
                      <Bar dataKey="value" name="Porcentaje" fill="#10b981">
                        {data.distribucion_motivos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
                <CardTitle>Detalle por Motivos</CardTitle>
                <CardDescription>Información detallada de cada motivo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">%</TableHead>
                      <TableHead className="text-right">Pacientes</TableHead>
                      <TableHead className="text-right">Costo Prom.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {data.distribucion_motivos.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.value.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{item.pacientes.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {item.costo_promedio > 0 ? `$${item.costo_promedio.toLocaleString()}` : 'N/A'}
                        </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
