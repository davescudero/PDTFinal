"use client"

import { useState } from "react"
import { Clock, Download, FileSpreadsheet, FileIcon as FilePdf, FileJson, Mail, Printer, Settings, Info, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para plantillas de reportes
const reportTemplates = [
  { 
    id: "financial", 
    name: "Reporte Financiero Completo",
    description: "Análisis integral de métricas financieras, servicios y alertas",
    includes: ["Resumen ejecutivo", "Análisis por servicios", "Alertas críticas", "Metadatos de modelos"]
  },
  { 
    id: "areas", 
    name: "Análisis por Áreas",
    description: "Desglose detallado por urgencias, hospitalización y laboratorios",
    includes: ["Métricas por área", "Insumos específicos", "Distribución de costos"]
  },
  { 
    id: "services", 
    name: "Top Servicios",
    description: "Ranking de servicios por facturación y volumen de pacientes",
    includes: ["Top 10 servicios", "Distribución geográfica", "Análisis comparativo"]
  },
  { 
    id: "trends", 
    name: "Tendencias Mensuales",
    description: "Evolución temporal con predicciones y variaciones",
    includes: ["Tendencias históricas", "Predicciones futuras", "Alertas de tendencias"]
  },
  { 
    id: "custom", 
    name: "Reporte Personalizado",
    description: "Configuración personalizada según áreas seleccionadas",
    includes: ["Configuración flexible", "Áreas específicas", "Opciones avanzadas"]
  },
]

// Información sobre precisión de modelos
const modelPrecisionInfo = {
  demanda: {
    algoritmo: "Regresión Lineal + Patrones Estacionales",
    precision: "60%",
    horizonte: "30 días",
    limitaciones: "Válido para horizontes cortos, requiere actualización periódica"
  },
  costos: {
    algoritmo: "Análisis de Tendencias + Factores Estacionales", 
    precision: "75-85%",
    horizonte: "6 meses",
    limitaciones: "Basado en tendencias históricas, sensible a cambios estructurales"
  },
  clustering: {
    algoritmo: "Clustering por Percentiles de Facturación",
    clusters: "5 grupos",
    servicios: "11 áreas analizadas",
    limitaciones: "Segmentación estática, requiere recalibración trimestral"
  }
}

export function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("financial")
  const [exportFormat, setExportFormat] = useState("excel")
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [selectedAreas, setSelectedAreas] = useState(["urgencias", "hospitalizacion", "laboratorios"])
  const [includeComparative, setIncludeComparative] = useState(true)
  const [includeGraphics, setIncludeGraphics] = useState(true)
  const [includePredictions, setIncludePredictions] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate)

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const requestBody = {
        template: selectedTemplate,
        format: exportFormat,
        areas: selectedAreas,
        includeComparative,
        includeGraphics,
        includePredictions
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Error al generar el reporte')
      }

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `reporte_${selectedTemplate}_${new Date().toISOString().split('T')[0]}.${exportFormat}`

      // Crear blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error descargando reporte:', error)
      alert('Error al descargar el reporte. Por favor, inténtelo de nuevo.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setSelectedAreas([...selectedAreas, area])
    } else {
      setSelectedAreas(selectedAreas.filter(a => a !== area))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes y Exportación</h2>
          <p className="text-muted-foreground">Genera y exporta reportes estandarizados con datos reales del hospital</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Info className="mr-1 h-3 w-3" />
          Datos reales: $265M+ facturado, 1,678 pacientes
        </Badge>
      </div>

      {/* Información sobre modelos predictivos */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Información de Modelos:</strong> Los reportes incluyen predicciones basadas en modelos estadísticos simples. 
          Demanda: {modelPrecisionInfo.demanda.precision} precisión, Costos: {modelPrecisionInfo.costos.precision} precisión, 
          Clustering: {modelPrecisionInfo.clustering.clusters} clusters de servicios.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Selector de Plantillas</CardTitle>
            <CardDescription>Diferentes formatos preconfigurados de reportes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla de Reporte</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplateData && (
                <div className="text-sm text-muted-foreground">
                  <p>{selectedTemplateData.description}</p>
                  <div className="mt-2">
                    <strong>Incluye:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {selectedTemplateData.includes.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Periodo de Reporte</Label>
              <RadioGroup defaultValue="month">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="week" id="week" />
                  <Label htmlFor="week">Semanal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month">Mensual (Enero-Abril 2025)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarter" id="quarter" />
                  <Label htmlFor="quarter">Trimestral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="year" id="year" />
                  <Label htmlFor="year">Anual</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Áreas a Incluir</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="urgencias" 
                    checked={selectedAreas.includes("urgencias")}
                    onCheckedChange={(checked) => handleAreaChange("urgencias", checked as boolean)}
                  />
                  <Label htmlFor="urgencias">Urgencias (86% ingresos, 1,218 pacientes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hospitalizacion" 
                    checked={selectedAreas.includes("hospitalizacion")}
                    onCheckedChange={(checked) => handleAreaChange("hospitalizacion", checked as boolean)}
                  />
                  <Label htmlFor="hospitalizacion">Hospitalización (14% ingresos)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="laboratorios" 
                    checked={selectedAreas.includes("laboratorios")}
                    onCheckedChange={(checked) => handleAreaChange("laboratorios", checked as boolean)}
                  />
                  <Label htmlFor="laboratorios">Laboratorios (8% estimado)</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opciones Adicionales</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="comparativo" 
                    checked={includeComparative}
                    onCheckedChange={(checked) => setIncludeComparative(checked as boolean)}
                  />
                  <Label htmlFor="comparativo">Incluir comparativo con periodo anterior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="graficos" 
                    checked={includeGraphics}
                    onCheckedChange={(checked) => setIncludeGraphics(checked as boolean)}
                  />
                  <Label htmlFor="graficos">Incluir gráficos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="predicciones" 
                    checked={includePredictions}
                    onCheckedChange={(checked) => setIncludePredictions(checked as boolean)}
                  />
                  <Label htmlFor="predicciones">Incluir predicciones ML</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">Generar Vista Previa</Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Vista Previa del Reporte</CardTitle>
            <CardDescription>Configuración actual y información de modelos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Información del reporte seleccionado */}
              <div className="rounded-md border border-dashed p-4">
                <div className="flex items-center justify-center space-y-2 text-center">
                  <div>
                    <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground" />
                    <div className="mt-2 text-xl font-medium">
                      {selectedTemplateData?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTemplateData?.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de modelos predictivos */}
              {includePredictions && (
                <div className="space-y-3">
                  <h4 className="font-medium">Modelos Predictivos Incluidos:</h4>
                  <div className="grid gap-3 md:grid-cols-1">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Predicción de Demanda</span>
                        <Badge variant="secondary">{modelPrecisionInfo.demanda.precision}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {modelPrecisionInfo.demanda.algoritmo} - {modelPrecisionInfo.demanda.horizonte}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Predicción de Costos</span>
                        <Badge variant="secondary">{modelPrecisionInfo.costos.precision}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {modelPrecisionInfo.costos.algoritmo} - {modelPrecisionInfo.costos.horizonte}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Clustering de Servicios</span>
                        <Badge variant="secondary">{modelPrecisionInfo.clustering.clusters}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {modelPrecisionInfo.clustering.algoritmo} - {modelPrecisionInfo.clustering.servicios}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración actual */}
              <div className="space-y-2">
                <h4 className="font-medium">Configuración Actual:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Áreas:</strong> {selectedAreas.join(", ")}</p>
                  <p><strong>Formato:</strong> {exportFormat.toUpperCase()}</p>
                  <p><strong>Comparativo:</strong> {includeComparative ? "Sí" : "No"}</p>
                  <p><strong>Predicciones:</strong> {includePredictions ? "Sí" : "No"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-2">
              <Label>Formato de Exportación</Label>
              <div className="flex space-x-2">
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setExportFormat("excel")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setExportFormat("csv")}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setExportFormat("json")}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
            <div className="flex w-full space-x-2">
              <Button 
                className="flex-1" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Generando..." : "Descargar"}
              </Button>
              <Button variant="outline" className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Sección de programación automática */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Programación Automática
          </CardTitle>
          <CardDescription>
            Configura la generación automática de reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-toggle">Habilitar programación</Label>
              <div className="text-sm text-muted-foreground">
                Genera reportes automáticamente según el cronograma configurado
              </div>
            </div>
            <Switch
              id="schedule-toggle"
              checked={scheduleEnabled}
              onCheckedChange={setScheduleEnabled}
            />
          </div>

          {scheduleEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-frequency">Frecuencia</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger id="schedule-frequency">
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-day">Día</Label>
                  <Select defaultValue="monday">
                    <SelectTrigger id="schedule-day">
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Lunes</SelectItem>
                      <SelectItem value="tuesday">Martes</SelectItem>
                      <SelectItem value="wednesday">Miércoles</SelectItem>
                      <SelectItem value="thursday">Jueves</SelectItem>
                      <SelectItem value="friday">Viernes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Hora</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input id="schedule-time" type="time" defaultValue="08:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-format">Formato</Label>
                  <Select defaultValue="excel">
                    <SelectTrigger id="schedule-format">
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="schedule-email">Enviar por correo a:</Label>
                <Input
                  id="schedule-email"
                  type="email"
                  placeholder="admin@hospital.com"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Guardar Programación</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
