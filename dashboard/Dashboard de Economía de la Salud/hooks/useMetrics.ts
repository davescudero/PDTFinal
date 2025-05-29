import { useState, useEffect } from 'react'

interface MetricasPrincipales {
  total_facturado: number
  costo_promedio: number
  total_pacientes: number
  cambio_porcentual: number
  estancia_promedio: number
}

interface Servicio {
  diagnostico: string
  sum: number
  count: number
  porcentaje: number
}

interface Alerta {
  titulo: string
  descripcion: string
  severidad: 'alta' | 'media' | 'baja'
}

interface MetricasContexto {
  metricas_principales: MetricasPrincipales
  distribucion_costos: Servicio[]
  top_servicios: Servicio[]
  alertas: Alerta[]
}

interface MetricasMulti {
  urgencias: MetricasContexto
  hospitalizacion: MetricasContexto
  combinado: MetricasContexto
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricasMulti | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics')
        if (!response.ok) {
          throw new Error('Error al cargar las métricas')
        }
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return { metrics, loading, error }
} 