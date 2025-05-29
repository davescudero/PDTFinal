import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      template, 
      format, 
      period, 
      areas, 
      includeComparative, 
      includeGraphics, 
      includePredictions 
    } = body;

    // Leer datos procesados
    const filePath = path.join(process.cwd(), 'datos', 'procesados', 'metricas_completas.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const metricas = JSON.parse(fileContent);

    let reportData: any = {};
    let fileName = '';

    // Generar datos según la plantilla seleccionada
    switch (template) {
      case 'financial':
        reportData = generateFinancialReport(metricas, includeComparative, includePredictions);
        fileName = `Reporte_Financiero_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'areas':
        reportData = generateAreasReport(metricas, areas);
        fileName = `Reporte_Areas_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'services':
        reportData = generateServicesReport(metricas);
        fileName = `Reporte_Servicios_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'trends':
        reportData = generateTrendsReport(metricas);
        fileName = `Reporte_Tendencias_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'custom':
        reportData = generateCustomReport(metricas, body);
        fileName = `Reporte_Personalizado_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        return NextResponse.json({ error: 'Plantilla no válida' }, { status: 400 });
    }

    // Generar archivo según el formato
    if (format === 'excel') {
      const buffer = generateExcelFile(reportData, template);
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
        },
      });
    } else if (format === 'csv') {
      const csvContent = generateCSVFile(reportData);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}.csv"`,
        },
      });
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(reportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}.json"`,
        },
      });
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });

  } catch (error) {
    console.error('Error generando reporte:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function generateFinancialReport(metricas: any, includeComparative: boolean, includePredictions: boolean) {
  const report = {
    resumen_ejecutivo: {
      total_facturado: metricas.metricas_principales.financieras.total_facturado,
      total_pacientes: metricas.metricas_principales.operacionales.total_pacientes,
      costo_promedio: metricas.metricas_principales.financieras.costo_promedio,
      margen_bruto: metricas.metricas_principales.financieras.margen_bruto,
      estancia_promedio: metricas.metricas_principales.operacionales.estancia_promedio,
      tasa_mortalidad: metricas.metricas_principales.operacionales.tasa_mortalidad
    },
    servicios: Object.entries(metricas.analisis_servicios || {}).map(([servicio, datos]: [string, any]) => ({
      servicio,
      total_facturado: datos.total_facturado,
      total_pacientes: datos.total_pacientes,
      costo_promedio: datos.costo_promedio,
      porcentaje_ingresos: datos.porcentaje_ingresos
    })),
    alertas: metricas.alertas || [],
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      periodo_datos: metricas.metadatos?.periodo_datos,
      precision_modelos: getModelPrecisionInfo(metricas),
      nota: "Reporte generado desde Dashboard Web - Datos reales del hospital"
    }
  };

  if (includePredictions && metricas.machine_learning?.disponible) {
    report.predicciones = {
      demanda: metricas.machine_learning.predicciones_demanda || [],
      costos: metricas.machine_learning.predicciones_costos || [],
      alertas_ml: metricas.machine_learning.alertas_ml || []
    };
  }

  return report;
}

function generateAreasReport(metricas: any, selectedAreas: string[]) {
  const servicios = metricas.analisis_servicios || {};
  
  return {
    areas_seleccionadas: selectedAreas,
    analisis_por_area: Object.entries(servicios)
      .filter(([servicio]) => selectedAreas.includes(servicio.toLowerCase()))
      .map(([servicio, datos]: [string, any]) => ({
        area: servicio,
        metricas: datos,
        insumos_estimados: generateInsumosEstimados(servicio, datos)
      })),
    resumen_total: {
      total_facturado: Object.values(servicios).reduce((acc: number, s: any) => acc + s.total_facturado, 0),
      total_pacientes: Object.values(servicios).reduce((acc: number, s: any) => acc + s.total_pacientes, 0)
    },
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      precision_modelos: getModelPrecisionInfo(metricas)
    }
  };
}

function generateServicesReport(metricas: any) {
  return {
    servicios: Object.entries(metricas.analisis_servicios || {}).map(([servicio, datos]: [string, any]) => ({
      servicio,
      ...datos
    })),
    top_10_servicios: Object.entries(metricas.analisis_servicios || {})
      .sort(([,a]: [string, any], [,b]: [string, any]) => b.total_facturado - a.total_facturado)
      .slice(0, 10),
    distribucion_geografica: metricas.analisis_geografico || {},
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      precision_modelos: getModelPrecisionInfo(metricas)
    }
  };
}

function generateTrendsReport(metricas: any) {
  return {
    tendencias_temporales: metricas.tendencias_temporales || {},
    variaciones_mensuales: calculateMonthlyVariations(metricas.tendencias_temporales || {}),
    predicciones_futuras: metricas.machine_learning?.predicciones_demanda || [],
    alertas_tendencias: metricas.alertas?.filter((a: any) => a.tipo === 'operacional') || [],
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      precision_modelos: getModelPrecisionInfo(metricas)
    }
  };
}

function generateCustomReport(metricas: any, options: any) {
  const report: any = {
    configuracion: options,
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      precision_modelos: getModelPrecisionInfo(metricas)
    }
  };

  if (options.areas?.includes('urgencias')) {
    report.urgencias = metricas.analisis_servicios?.URGENCIAS || {};
  }
  if (options.areas?.includes('hospitalizacion')) {
    report.hospitalizacion = Object.entries(metricas.analisis_servicios || {})
      .filter(([servicio]) => servicio !== 'URGENCIAS');
  }
  if (options.areas?.includes('laboratorios')) {
    report.laboratorios = {
      estimacion: "Datos estimados basados en estándares hospitalarios",
      porcentaje_total: 8
    };
  }

  return report;
}

function getModelPrecisionInfo(metricas: any) {
  const mlInfo = metricas.machine_learning || {};
  
  if (!mlInfo.disponible) {
    return {
      disponible: false,
      nota: "Modelos predictivos no disponibles en este conjunto de datos"
    };
  }

  const resumen = mlInfo.resumen_modelos || {};
  const metricas_ml = resumen.metricas || {};

  return {
    disponible: true,
    tipo_modelos: mlInfo.tipo || 'Estadistico_Simple',
    version: resumen.version || 'v1.0',
    modelos: {
      demanda: {
        algoritmo: "Regresión Lineal + Patrones Estacionales",
        precision: metricas_ml.demanda?.precision_estimada || "60%",
        tendencia_diaria: metricas_ml.demanda?.tendencia_diaria || 0,
        nota: "Predicción basada en tendencias históricas y patrones estacionales"
      },
      costos: {
        algoritmo: "Análisis de Tendencias + Factores Estacionales",
        precision: metricas_ml.costos?.precision_estimada || "75-85%",
        crecimiento_mensual: metricas_ml.costos?.crecimiento_mensual_pct || 0,
        nota: "Predicción basada en análisis de series temporales"
      },
      clustering: {
        algoritmo: "Clustering por Percentiles de Facturación",
        clusters: metricas_ml.clustering?.n_clusters || 5,
        servicios_analizados: metricas_ml.clustering?.n_servicios || 0,
        nota: "Segmentación de servicios por volumen de facturación"
      }
    },
    limitaciones: [
      "Los modelos son estadísticos simples, no ML avanzado",
      "Precisión estimada basada en validación cruzada simple",
      "Predicciones válidas para horizontes cortos (30-90 días)",
      "Requiere actualización periódica con nuevos datos"
    ]
  };
}

function generateInsumosEstimados(servicio: string, datos: any) {
  // Generar insumos estimados basados en el tipo de servicio
  const insumos_base = {
    'URGENCIAS': [
      { nombre: "Suero fisiológico", costo_estimado: datos.total_facturado * 0.05 },
      { nombre: "Medicamentos de urgencia", costo_estimado: datos.total_facturado * 0.15 },
      { nombre: "Material de curación", costo_estimado: datos.total_facturado * 0.08 }
    ],
    'CIRUGÍA': [
      { nombre: "Material quirúrgico", costo_estimado: datos.total_facturado * 0.25 },
      { nombre: "Anestésicos", costo_estimado: datos.total_facturado * 0.12 },
      { nombre: "Suturas", costo_estimado: datos.total_facturado * 0.06 }
    ]
  };

  return insumos_base[servicio as keyof typeof insumos_base] || [
    { nombre: "Insumos generales", costo_estimado: datos.total_facturado * 0.10 }
  ];
}

function calculateMonthlyVariations(tendencias: any) {
  const meses = Object.keys(tendencias).sort();
  const variaciones = [];

  for (let i = 1; i < meses.length; i++) {
    const mesActual = tendencias[meses[i]];
    const mesAnterior = tendencias[meses[i-1]];
    
    variaciones.push({
      periodo: meses[i],
      variacion_facturado: ((mesActual.total_facturado - mesAnterior.total_facturado) / mesAnterior.total_facturado * 100).toFixed(2),
      variacion_pacientes: ((mesActual.total_pacientes - mesAnterior.total_pacientes) / mesAnterior.total_pacientes * 100).toFixed(2),
      variacion_costo_promedio: ((mesActual.costo_promedio - mesAnterior.costo_promedio) / mesAnterior.costo_promedio * 100).toFixed(2)
    });
  }

  return variaciones;
}

function generateExcelFile(data: any, template: string): Buffer {
  const workbook = XLSX.utils.book_new();

  if (template === 'financial') {
    // Hoja de resumen ejecutivo
    const resumenWS = XLSX.utils.json_to_sheet([data.resumen_ejecutivo]);
    XLSX.utils.book_append_sheet(workbook, resumenWS, 'Resumen Ejecutivo');

    // Hoja de servicios
    if (data.servicios) {
      const serviciosWS = XLSX.utils.json_to_sheet(data.servicios);
      XLSX.utils.book_append_sheet(workbook, serviciosWS, 'Servicios');
    }

    // Hoja de alertas
    if (data.alertas) {
      const alertasWS = XLSX.utils.json_to_sheet(data.alertas);
      XLSX.utils.book_append_sheet(workbook, alertasWS, 'Alertas');
    }

    // Hoja de metadatos
    const metadatosWS = XLSX.utils.json_to_sheet([data.metadatos]);
    XLSX.utils.book_append_sheet(workbook, metadatosWS, 'Metadatos');
  } else {
    // Para otros templates, crear una hoja principal
    const mainWS = XLSX.utils.json_to_sheet([data]);
    XLSX.utils.book_append_sheet(workbook, mainWS, 'Datos');
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function generateCSVFile(data: any): string {
  // Convertir el objeto a formato CSV simple
  if (Array.isArray(data)) {
    return convertArrayToCSV(data);
  } else if (data.servicios) {
    return convertArrayToCSV(data.servicios);
  } else {
    return convertObjectToCSV(data);
  }
}

function convertArrayToCSV(array: any[]): string {
  if (array.length === 0) return '';
  
  const headers = Object.keys(array[0]);
  const csvContent = [
    headers.join(','),
    ...array.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

function convertObjectToCSV(obj: any): string {
  const rows = Object.entries(obj).map(([key, value]) => `"${key}","${value}"`);
  return ['Atributo,Valor', ...rows].join('\n');
} 