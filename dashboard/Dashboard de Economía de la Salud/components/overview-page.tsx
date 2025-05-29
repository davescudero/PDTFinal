"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, DollarSign, Users, Stethoscope, AlertTriangle, Calendar } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMetrics } from "@/hooks/useMetrics"

const CONTEXTOS = [
  { value: "urgencias", label: "Urgencias" },
  { value: "hospitalizacion", label: "Hospitalización" },
  { value: "combinado", label: "Combinado" },
]

export function OverviewPage() {
  const [period, setPeriod] = useState("month")
  const [contexto, setContexto] = useState("combinado")
  const { metrics, loading, error } = useMetrics()

  if (loading) {
    return <div>Cargando métricas...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!metrics) {
    return <div>No hay datos disponibles</div>
  }

  const contextoData = metrics[contexto]
  const { metricas_principales, distribucion_costos, top_servicios, alertas } = contextoData

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vista General</h2>
          <p className="text-muted-foreground">Resumen ejecutivo del estado económico actual del hospital</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Tabs defaultValue={contexto} className="w-full md:w-auto" onValueChange={setContexto}>
            <TabsList>
              {CONTEXTOS.map((c) => (
                <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs defaultValue={period} className="w-full md:w-auto" onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="quarter">Trimestre</TabsTrigger>
              <TabsTrigger value="year">Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metricas_principales.total_facturado.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${metricas_principales.cambio_porcentual > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metricas_principales.cambio_porcentual > 0 ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDown className="mr-1 h-4 w-4" />
              )}
              <span>{Math.abs(metricas_principales.cambio_porcentual).toFixed(1)}% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio por Paciente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metricas_principales.costo_promedio.toLocaleString()}</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Estancia Promedio</span>
              </div>
              <div className="text-2xl font-bold">
                {metricas_principales.estancia_promedio 
                  ? `${metricas_principales.estancia_promedio.toFixed(1)} días`
                  : 'No disponible'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas_principales.total_pacientes}</div>
            <div className="text-sm text-muted-foreground">
              <span>Total de pacientes en el período</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Más Utilizados</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{top_servicios[0]?.diagnostico || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">
              <span>{top_servicios[0]?.porcentaje.toFixed(1)}% del total de servicios</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Costos</CardTitle>
            <CardDescription>Distribución porcentual de costos por área</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Porcentaje"]}
                    labelFormatter={(name) => `Área: ${name}`}
                  />
                  <Pie
                    data={distribucion_costos.map(item => ({
                      name: item.diagnostico,
                      value: item.porcentaje,
                      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    labelLine={true}
                  >
                    {distribucion_costos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top 10 Servicios por Costo</CardTitle>
            <CardDescription>Servicios que representan mayor costo total</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-right">Costo Total</TableHead>
                  <TableHead className="text-right">Porcentaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top_servicios.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{service.diagnostico}</TableCell>
                    <TableCell className="text-right">${service.sum.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{service.porcentaje.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas y Anomalías</CardTitle>
          <CardDescription>Desviaciones significativas respecto a períodos anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertas.map((alerta, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 rounded-lg border p-4 ${
                  alerta.severidad === 'alta' ? 'border-red-200 bg-red-50' :
                  alerta.severidad === 'media' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${
                  alerta.severidad === 'alta' ? 'text-red-500' :
                  alerta.severidad === 'media' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{alerta.titulo}</p>
                  <p className="text-sm text-muted-foreground">{alerta.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
