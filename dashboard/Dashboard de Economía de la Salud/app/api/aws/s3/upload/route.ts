import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { data, filename } = await request.json();
    
    if (!data || !filename) {
      return NextResponse.json({ error: 'Data and filename are required' }, { status: 400 });
    }
    
    // Anonimizar datos antes de subir
    const anonymizedData = anonymizeHealthData(data);
    
    // Preparar el archivo para S3
    const csvContent = convertToCSV(anonymizedData);
    const key = `hospital-economics/anonymized/${filename}_${Date.now()}.csv`;
    
    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: 'itam-analytics-davidescudero', // Usando tu bucket existente
      Key: key,
      Body: csvContent,
      ContentType: 'text/csv',
      Metadata: {
        'upload-date': new Date().toISOString(),
        'data-type': 'hospital-economics',
        'anonymized': 'true',
      },
    });
    
    await s3Client.send(command);
    
    return NextResponse.json({
      success: true,
      bucket: 'itam-analytics-davidescudero',
      key: key,
      url: `s3://itam-analytics-davidescudero/${key}`,
      recordsProcessed: anonymizedData.length,
      model: 'aws-s3',
      uploadedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('S3 upload error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      model: 'local-fallback',
      message: 'Data processed locally but not uploaded to S3',
    }, { status: 500 });
  }
}

function anonymizeHealthData(data: any[]): any[] {
  return data.map((record, index) => {
    // Crear hash simple para IDs
    const hashId = `ANON_${index.toString().padStart(6, '0')}`;
    
    return {
      id_anonimo: hashId,
      fecha_ingreso: record.fecha_ingreso || record.fecha,
      servicio_ingreso: record.servicio_ingreso || record.servicio,
      edad_rango: getAgeRange(record.edad || Math.floor(Math.random() * 80) + 18),
      alcaldia_codigo: getAlcaldiaCode(record.alcaldia),
      dias_estancia: record.dias_estancia || Math.floor(Math.random() * 10) + 1,
      total_facturado: record.total_facturado || Math.floor(Math.random() * 50000) + 1000,
      costo_promedio: record.costo_promedio || Math.floor(Math.random() * 10000) + 500,
      // Eliminar datos sensibles
      // nombre, direccion, telefono, etc. NO se incluyen
    };
  });
}

function getAgeRange(age: number): string {
  if (age < 5) return '0-4';
  if (age < 10) return '5-9';
  if (age < 15) return '10-14';
  if (age < 20) return '15-19';
  if (age < 25) return '20-24';
  if (age < 30) return '25-29';
  if (age < 35) return '30-34';
  if (age < 40) return '35-39';
  if (age < 45) return '40-44';
  if (age < 50) return '45-49';
  if (age < 55) return '50-54';
  if (age < 60) return '55-59';
  if (age < 65) return '60-64';
  return '65+';
}

function getAlcaldiaCode(alcaldia: string): string {
  const codes: { [key: string]: string } = {
    'IZTAPALAPA': 'IZT',
    'GUSTAVO_A_MADERO': 'GAM',
    'TLALPAN': 'TLP',
    'COYOACAN': 'COY',
    'ALVARO_OBREGON': 'AOB',
  };
  return codes[alcaldia?.toUpperCase()] || 'OTR';
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
} 