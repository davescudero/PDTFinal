'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Database, Brain, MessageSquare, Cloud, HardDrive } from 'lucide-react';

export default function AWSHybridIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [sentimentText, setSentimentText] = useState('El paciente presenta mejoría notable en su estado general');
  const [uploadData, setUploadData] = useState('');
  const [filename, setFilename] = useState('datos_hospital');

  // Subir datos a S3 (AWS real)
  const handleS3Upload = async () => {
    setIsLoading(true);
    try {
      // Generar datos de ejemplo si no hay datos
      const sampleData = uploadData ? JSON.parse(uploadData) : generateSampleData();
      
      const response = await fetch('/api/aws/s3/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: sampleData, filename }),
      });
      
      const result = await response.json();
      setResults(result);
    } catch (error) {
      setResults({ error: 'Error en upload', model: 'error' });
    }
    setIsLoading(false);
  };

  // Consulta Athena (AWS real)
  const handleAthenaQuery = async () => {
    setIsLoading(true);
    try {
      const query = `
        SELECT servicio, COUNT(*) as total_pacientes, AVG(costo) as costo_promedio
        FROM hospital_data 
        WHERE fecha >= '2024-01-01'
        GROUP BY servicio
        ORDER BY total_pacientes DESC
      `;
      
      const response = await fetch('/api/aws/athena/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, database: 'econ' }),
      });
      
      const result = await response.json();
      setResults(result);
    } catch (error) {
      setResults({ error: 'Error en Athena', model: 'error' });
    }
    setIsLoading(false);
  };

  // Análisis de sentimiento (Local mejorado)
  const handleSentimentAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/aws/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentimentText }),
      });
      
      const result = await response.json();
      setResults(result);
    } catch (error) {
      setResults({ error: 'Error en análisis', model: 'error' });
    }
    setIsLoading(false);
  };

  // Predicción ML (Local mejorado)
  const handleMLPrediction = async () => {
    setIsLoading(true);
    try {
      const input = {
        servicio: 'URGENCIAS',
        alcaldia: 'IZTAPALAPA',
        fecha: new Date().toISOString(),
        dias_estancia: 3,
        total_facturado: 15000,
      };
      
      const response = await fetch('/api/predictive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'demand',
          input,
        }),
      });
      
      const result = await response.json();
      setResults(result);
    } catch (error) {
      setResults({ error: 'Error en predicción', model: 'error' });
    }
    setIsLoading(false);
  };

  const generateSampleData = () => [
    {
      fecha_ingreso: '2024-05-28',
      servicio: 'URGENCIAS',
      edad: 45,
      alcaldia: 'IZTAPALAPA',
      dias_estancia: 2,
      total_facturado: 8500,
    },
    {
      fecha_ingreso: '2024-05-28',
      servicio: 'HOSPITALIZACION',
      edad: 67,
      alcaldia: 'GUSTAVO_A_MADERO',
      dias_estancia: 5,
      total_facturado: 25000,
    },
  ];

  const getServiceBadge = (model: string) => {
    if (model?.includes('aws')) {
      return <Badge className="bg-orange-500"><Cloud className="w-3 h-3 mr-1" />AWS Real</Badge>;
    }
    return <Badge variant="secondary"><HardDrive className="w-3 h-3 mr-1" />Local Mejorado</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Sistema Híbrido AWS + Local
          </CardTitle>
          <CardDescription>
            Integración real con S3 y Athena, fallback local inteligente para otros servicios
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="s3" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="s3">S3 Upload</TabsTrigger>
          <TabsTrigger value="athena">Athena Query</TabsTrigger>
          <TabsTrigger value="sentiment">Sentimiento</TabsTrigger>
          <TabsTrigger value="ml">Predicción ML</TabsTrigger>
        </TabsList>

        <TabsContent value="s3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Subir Datos a S3 (AWS Real)
              </CardTitle>
              <CardDescription>
                Anonimización automática y upload a tu bucket de S3
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre del archivo:</label>
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="datos_hospital"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Datos JSON (opcional):</label>
                <Textarea
                  value={uploadData}
                  onChange={(e) => setUploadData(e.target.value)}
                  placeholder="Deja vacío para usar datos de ejemplo"
                  rows={4}
                />
              </div>
              <Button onClick={handleS3Upload} disabled={isLoading}>
                {isLoading ? 'Subiendo...' : 'Subir a S3'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="athena">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Consulta Athena (AWS Real)
              </CardTitle>
              <CardDescription>
                Ejecutar consultas SQL en tu base de datos 'econ'
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAthenaQuery} disabled={isLoading}>
                {isLoading ? 'Ejecutando...' : 'Ejecutar Consulta'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Análisis de Sentimiento (Local Mejorado)
              </CardTitle>
              <CardDescription>
                Análisis médico especializado en español
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                placeholder="Ingresa texto médico para analizar..."
                rows={3}
              />
              <Button onClick={handleSentimentAnalysis} disabled={isLoading}>
                {isLoading ? 'Analizando...' : 'Analizar Sentimiento'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Predicción ML (Local Mejorado)
              </CardTitle>
              <CardDescription>
                Algoritmos locales con patrones realistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleMLPrediction} disabled={isLoading}>
                {isLoading ? 'Prediciendo...' : 'Ejecutar Predicción'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultados
              {getServiceBadge(results.model)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <Alert>
                <AlertDescription>{results.error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
                {results.note && (
                  <Alert>
                    <AlertDescription>{results.note}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 