import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Leer el archivo de métricas completas
    const filePath = path.join(process.cwd(), 'datos', 'procesados', 'metricas_completas.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const metricas = JSON.parse(fileContent);
    
    // Extraer datos de servicios
    const servicios = metricas.analisis_servicios || {};
    const motivosAlta = metricas.analisis_motivos_alta || {};
    
    // Datos específicos por área basados en datos reales
    const areaData = {
      urgencias: {
        title: "Urgencias",
        metricas_principales: {
          costo_total: servicios.URGENCIAS?.total_facturado || 0,
          pacientes_atendidos: servicios.URGENCIAS?.total_pacientes || 0,
          costo_promedio: servicios.URGENCIAS?.costo_promedio || 0,
          estancia_promedio: servicios.URGENCIAS?.estancia_promedio || 0,
          porcentaje_total: servicios.URGENCIAS?.porcentaje_ingresos || 0
        },
        costBreakdown: [
          { name: "Personal médico", value: 42, valor_absoluto: (servicios.URGENCIAS?.total_facturado || 0) * 0.42 },
          { name: "Medicamentos", value: 28, valor_absoluto: (servicios.URGENCIAS?.total_facturado || 0) * 0.28 },
          { name: "Equipamiento médico", value: 18, valor_absoluto: (servicios.URGENCIAS?.total_facturado || 0) * 0.18 },
          { name: "Insumos generales", value: 12, valor_absoluto: (servicios.URGENCIAS?.total_facturado || 0) * 0.12 }
        ],
        insumos_especificos: [
          { nombre: "Suero fisiológico", cantidad_mensual: 2450, costo_unitario: 25, categoria: "Medicamentos" },
          { nombre: "Gasas estériles", cantidad_mensual: 1800, costo_unitario: 15, categoria: "Insumos generales" },
          { nombre: "Jeringas desechables", cantidad_mensual: 3200, costo_unitario: 8, categoria: "Insumos generales" },
          { nombre: "Oxígeno medicinal", cantidad_mensual: 850, costo_unitario: 120, categoria: "Medicamentos" },
          { nombre: "Monitor de signos vitales", cantidad_mensual: 12, costo_unitario: 15000, categoria: "Equipamiento médico" }
        ],
        distribucion_motivos: Object.entries(motivosAlta).slice(0, 5).map(([motivo, datos]: [string, any]) => ({
          name: motivo,
          value: datos.porcentaje_casos || 0,
          pacientes: datos.total_pacientes || 0,
          costo_promedio: datos.costo_promedio || 0
        }))
      },
      hospitalizacion: {
        title: "Hospitalización",
        metricas_principales: {
          costo_total: Object.values(servicios).reduce((acc: number, serv: any) => 
            serv.total_facturado && serv !== servicios.URGENCIAS ? acc + serv.total_facturado : acc, 0),
          pacientes_atendidos: Object.values(servicios).reduce((acc: number, serv: any) => 
            serv.total_pacientes && serv !== servicios.URGENCIAS ? acc + serv.total_pacientes : acc, 0),
          costo_promedio: 0, // Se calculará después
          estancia_promedio: Object.values(servicios).reduce((acc: number, serv: any) => 
            serv.estancia_promedio && serv !== servicios.URGENCIAS ? acc + serv.estancia_promedio : acc, 0) / 
            (Object.keys(servicios).length - 1),
          porcentaje_total: 100 - (servicios.URGENCIAS?.porcentaje_ingresos || 0)
        },
        costBreakdown: [
          { name: "Personal médico", value: 35, valor_absoluto: 0 },
          { name: "Medicamentos", value: 25, valor_absoluto: 0 },
          { name: "Equipamiento médico", value: 22, valor_absoluto: 0 },
          { name: "Alimentación", value: 8, valor_absoluto: 0 },
          { name: "Insumos generales", value: 10, valor_absoluto: 0 }
        ],
        insumos_especificos: [
          { nombre: "Cama hospitalaria", cantidad_mensual: 45, costo_unitario: 2500, categoria: "Equipamiento médico" },
          { nombre: "Antibióticos IV", cantidad_mensual: 680, costo_unitario: 180, categoria: "Medicamentos" },
          { nombre: "Sondas urinarias", cantidad_mensual: 320, costo_unitario: 45, categoria: "Insumos generales" },
          { nombre: "Nutrición enteral", cantidad_mensual: 890, costo_unitario: 85, categoria: "Alimentación" },
          { nombre: "Ventilador mecánico", cantidad_mensual: 8, costo_unitario: 45000, categoria: "Equipamiento médico" }
        ],
        distribucion_motivos: Object.entries(motivosAlta).slice(0, 4).map(([motivo, datos]: [string, any]) => ({
          name: motivo,
          value: datos.porcentaje_casos || 0,
          pacientes: datos.total_pacientes || 0,
          costo_promedio: datos.costo_promedio || 0
        }))
      },
      laboratorios: {
        title: "Laboratorios y Diagnóstico",
        metricas_principales: {
          costo_total: (metricas.metricas_principales?.financieras?.total_facturado || 0) * 0.08, // Estimado 8%
          pacientes_atendidos: Math.floor((metricas.metricas_principales?.operacionales?.total_pacientes || 0) * 1.5), // Múltiples estudios por paciente
          costo_promedio: 0, // Se calculará después
          estancia_promedio: 0.5, // Estudios ambulatorios
          porcentaje_total: 8
        },
        costBreakdown: [
          { name: "Personal técnico", value: 32, valor_absoluto: 0 },
          { name: "Reactivos", value: 38, valor_absoluto: 0 },
          { name: "Equipamiento", value: 22, valor_absoluto: 0 },
          { name: "Insumos generales", value: 8, valor_absoluto: 0 }
        ],
        insumos_especificos: [
          { nombre: "Reactivos bioquímica", cantidad_mensual: 1200, costo_unitario: 35, categoria: "Reactivos" },
          { nombre: "Tubos de ensayo", cantidad_mensual: 4500, costo_unitario: 12, categoria: "Insumos generales" },
          { nombre: "Contraste radiológico", cantidad_mensual: 180, costo_unitario: 250, categoria: "Reactivos" },
          { nombre: "Placas radiográficas", cantidad_mensual: 890, costo_unitario: 28, categoria: "Insumos generales" },
          { nombre: "Analizador automático", cantidad_mensual: 2, costo_unitario: 85000, categoria: "Equipamiento" }
        ],
        distribucion_motivos: [
          { name: "Diagnóstico inicial", value: 45, pacientes: 0, costo_promedio: 0 },
          { name: "Seguimiento", value: 35, pacientes: 0, costo_promedio: 0 },
          { name: "Control post-operatorio", value: 15, pacientes: 0, costo_promedio: 0 },
          { name: "Estudios preventivos", value: 5, pacientes: 0, costo_promedio: 0 }
        ]
      }
    };

    // Calcular costos promedio y valores absolutos
    Object.keys(areaData).forEach(area => {
      const data = areaData[area as keyof typeof areaData];
      if (data.metricas_principales.pacientes_atendidos > 0) {
        data.metricas_principales.costo_promedio = 
          data.metricas_principales.costo_total / data.metricas_principales.pacientes_atendidos;
      }
      
      // Actualizar valores absolutos en costBreakdown
      data.costBreakdown.forEach(item => {
        item.valor_absoluto = data.metricas_principales.costo_total * (item.value / 100);
      });
    });

    const response = {
      areas: areaData,
      metadatos: {
        periodo_inicio: metricas.metadatos?.periodo_datos?.inicio,
        periodo_fin: metricas.metadatos?.periodo_datos?.fin,
        total_registros: metricas.metadatos?.total_registros_procesados,
        nota: "DEMO - Datos reales de servicios con estimaciones de insumos específicos basadas en estándares hospitalarios"
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading areas data:', error);
    
    // Fallback con datos de ejemplo
    const fallbackData = {
      areas: {
        urgencias: {
          title: "Urgencias",
          metricas_principales: {
            costo_total: 223672146,
            pacientes_atendidos: 1218,
            costo_promedio: 183639,
            estancia_promedio: 11.5,
            porcentaje_total: 86
          },
          costBreakdown: [
            { name: "Personal médico", value: 42, valor_absoluto: 93962301 },
            { name: "Medicamentos", value: 28, valor_absoluto: 62628201 },
            { name: "Equipamiento médico", value: 18, valor_absoluto: 40260986 },
            { name: "Insumos generales", value: 12, valor_absoluto: 26840658 }
          ],
          insumos_especificos: [
            { nombre: "Suero fisiológico", cantidad_mensual: 2450, costo_unitario: 25, categoria: "Medicamentos" },
            { nombre: "Gasas estériles", cantidad_mensual: 1800, costo_unitario: 15, categoria: "Insumos generales" }
          ]
        }
      },
      metadatos: {
        nota: "DEMO - Datos de ejemplo debido a error en carga de datos reales"
      }
    };
    
    return NextResponse.json(fallbackData);
  }
} 