import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Leer el archivo de métricas completas
    const filePath = path.join(process.cwd(), 'datos', 'procesados', 'metricas_completas.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const metricas = JSON.parse(fileContent);
    
    // Transformar datos de tendencias temporales
    const tendenciasTemporales = metricas.tendencias_temporales || {};
    
    // Convertir a formato para gráficos
    const timeSeriesData = Object.entries(tendenciasTemporales).map(([periodo, datos]: [string, any]) => {
      const [year, month] = periodo.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = monthNames[parseInt(month) - 1];
      
      return {
        name: monthName,
        periodo: periodo,
        total_facturado: datos.total_facturado,
        costo_promedio: datos.costo_promedio,
        total_pacientes: datos.total_pacientes,
        estancia_promedio: datos.estancia_promedio
      };
    });

    // Calcular velocidad de cambio
    const changeRateData = timeSeriesData.map((current, index) => {
      if (index === 0) {
        return {
          name: current.name,
          cambio_facturado: 0,
          cambio_pacientes: 0,
          cambio_costo_promedio: 0
        };
      }
      
      const previous = timeSeriesData[index - 1];
      return {
        name: current.name,
        cambio_facturado: ((current.total_facturado - previous.total_facturado) / previous.total_facturado * 100),
        cambio_pacientes: ((current.total_pacientes - previous.total_pacientes) / previous.total_pacientes * 100),
        cambio_costo_promedio: ((current.costo_promedio - previous.costo_promedio) / previous.costo_promedio * 100)
      };
    });

    // Análisis de servicios por mes (simulado basado en datos disponibles)
    const serviciosPorMes = timeSeriesData.map(mes => ({
      name: mes.name,
      urgencias: mes.total_facturado * 0.86, // Basado en el 86% que representa urgencias
      hospitalizacion: mes.total_facturado * 0.14, // El resto
      laboratorios: mes.total_facturado * 0.05 // Estimado
    }));

    const response = {
      timeSeriesData: serviciosPorMes,
      changeRateData,
      rawData: timeSeriesData,
      metadatos: {
        periodo_inicio: metricas.metadatos?.periodo_datos?.inicio,
        periodo_fin: metricas.metadatos?.periodo_datos?.fin,
        total_registros: metricas.metadatos?.total_registros_procesados,
        nota: "DEMO - Datos reales del hospital con algunas estimaciones para visualización"
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading trends data:', error);
    
    // Fallback con datos de ejemplo
    const fallbackData = {
      timeSeriesData: [
        { name: "Ene", urgencias: 69560814, hospitalizacion: 8000000, laboratorios: 3000000 },
        { name: "Feb", urgencias: 61198406, hospitalizacion: 7500000, laboratorios: 2800000 },
        { name: "Mar", urgencias: 69807376, hospitalizacion: 8200000, laboratorios: 3100000 },
        { name: "Abr", urgencias: 64573943, hospitalizacion: 7800000, laboratorios: 2900000 }
      ],
      changeRateData: [
        { name: "Ene", cambio_facturado: 0, cambio_pacientes: 0, cambio_costo_promedio: 0 },
        { name: "Feb", cambio_facturado: -12.0, cambio_pacientes: -1.1, cambio_costo_promedio: -11.0 },
        { name: "Mar", cambio_facturado: 14.1, cambio_pacientes: -4.8, cambio_costo_promedio: 19.8 },
        { name: "Abr", cambio_facturado: -7.5, cambio_pacientes: -12.6, cambio_costo_promedio: 5.8 }
      ],
      metadatos: {
        nota: "DEMO - Datos de ejemplo debido a error en carga de datos reales"
      }
    };
    
    return NextResponse.json(fallbackData);
  }
} 