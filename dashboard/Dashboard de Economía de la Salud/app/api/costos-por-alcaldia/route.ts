import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Intentar leer el archivo de métricas completas
    const filePath = path.join(process.cwd(), 'datos', 'procesados', 'metricas_completas.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const metricas = JSON.parse(fileContent);
    
    // Transformar datos de alcaldías
    const data = Object.entries(metricas.analisis_geografico?.alcaldias || {}).map(([alcaldia, datos]: [string, any]) => ({
      alcaldia: alcaldia,
      costo_promedio: datos.costo_promedio,
      total_casos: datos.total_pacientes,
      total_facturado: datos.total_facturado,
      porcentaje_pacientes: datos.porcentaje_pacientes
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading metrics:', error);
    
    // Fallback al archivo CSV original si existe
    try {
      const csvPath = path.join(process.cwd(), 'datos', 'costos_por_alcaldia.csv');
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      return {
        alcaldia: values[0],
        costo_promedio: parseFloat(values[1]),
        total_casos: parseInt(values[2])
      };
    });

    return NextResponse.json(data);
    } catch (csvError) {
      console.error('Error reading CSV fallback:', csvError);
    return NextResponse.json({ error: 'Error reading data' }, { status: 500 });
    }
  }
} 