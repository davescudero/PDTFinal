'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Cloud, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { AWSService, PredictionInput, PredictionResult } from '@/lib/aws-service';

interface AWSIntegrationProps {
  data?: any[];
  selectedService?: string;
  selectedAlcaldia?: string;
}

export default function AWSIntegration({ data, selectedService, selectedAlcaldia }: AWSIntegrationProps) {
  const [isAWSAvailable, setIsAWSAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<{
    demand?: PredictionResult;
    cost?: PredictionResult;
    anomaly?: PredictionResult;
  }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAWSAvailability();
  }, []);

  const checkAWSAvailability = async () => {
    try {
      const available = await AWSService.isAWSAvailable();
      setIsAWSAvailable(available);
    } catch (error) {
      setIsAWSAvailable(false);
    }
  };

  const runPredictions = async () => {
    if (!data || data.length === 0) {
      setError('No hay datos disponibles para predicciones');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar input basado en los datos actuales
      const sampleData = data[0];
      const input: PredictionInput = {
        fecha: new Date().toISOString().split('T')[0],
        servicio: selectedService || sampleData?.servicio_ingreso || 'URGENCIAS',
        alcaldia: selectedAlcaldia || sampleData?.alcaldia || 'IZTAPALAPA',
        dias_estancia: sampleData?.dias_estancia || 2,
        total_facturado: sampleData?.total_facturado || 5000,
        edad_rango: '30-34',
      };

      // Ejecutar predicciones en paralelo
      const [demandResult, costResult, anomalyResult] = await Promise.all([
        AWSService.predictDemand(input),
        AWSService.predictCost(input),
        AWSService.detectAnomalies(input),
      ]);

      setPredictions({
        demand: demandResult,
        cost: costResult,
        anomaly: anomalyResult,
      });
    } catch (error) {
      setError(`Error en predicciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentiment = async () => {
    setLoading(true);
    try {
      const sampleText = "El paciente presenta mejoría notable en su estado general después del tratamiento";
      const result = await AWSService.analyzeSentiment(sampleText);
      
      // Mostrar resultado en una alerta
      setError(null);
      alert(`Análisis de Sentimiento:\nTexto: "${sampleText}"\nSentimiento: ${result.sentiment}\nConfianza: ${(result.confidence * 100).toFixed(1)}%\nModelo: ${result.model}`);
    } catch (error) {
      setError(`Error en análisis de sentimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (isAWSAvailable === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Verificando conectividad AWS...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estado de AWS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Integración AWS</span>
            <Badge variant={isAWSAvailable ? "default" : "destructive"}>
              {isAWSAvailable ? "Conectado" : "Sin conexión"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isAWSAvailable 
              ? "Servicios AWS disponibles: SageMaker, Comprehend, S3, Athena"
              : "Usando modelos locales mejorados como fallback"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={runPredictions} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              <span>Ejecutar Predicciones ML</span>
            </Button>
            
            <Button 
              onClick={analyzeSentiment} 
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              <span>Análisis de Sentimiento</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resultados de Predicciones */}
      {Object.keys(predictions).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Predicción de Demanda */}
          {predictions.demand && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predicción de Demanda</CardTitle>
                <CardDescription>
                  Modelo: {predictions.demand.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {predictions.demand.prediction} pacientes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confianza: {(predictions.demand.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tiempo: {predictions.demand.executionTime}ms
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predicción de Costos */}
          {predictions.cost && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predicción de Costos</CardTitle>
                <CardDescription>
                  Modelo: {predictions.cost.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    ${typeof predictions.cost.prediction === 'number' 
                      ? predictions.cost.prediction.toLocaleString() 
                      : predictions.cost.prediction}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confianza: {(predictions.cost.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tiempo: {predictions.cost.executionTime}ms
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detección de Anomalías */}
          {predictions.anomaly && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detección de Anomalías</CardTitle>
                <CardDescription>
                  Modelo: {predictions.anomaly.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {typeof predictions.anomaly.prediction === 'number' 
                      ? predictions.anomaly.prediction.toFixed(2) 
                      : predictions.anomaly.prediction}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typeof predictions.anomaly.prediction === 'number' && predictions.anomaly.prediction > 1.5 
                      ? "⚠️ Anomalía detectada" 
                      : "✅ Normal"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confianza: {(predictions.anomaly.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tiempo: {predictions.anomaly.executionTime}ms
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información AWS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Servicios integrados:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Amazon SageMaker - Modelos de ML para predicciones</li>
                <li>Amazon Comprehend - Análisis de texto y sentimiento</li>
                <li>Amazon S3 - Almacenamiento de datos anonimizados</li>
                <li>Amazon Athena - Consultas SQL serverless</li>
              </ul>
            </div>
            <div>
              <strong>Fallback inteligente:</strong> Si AWS no está disponible, se usan modelos locales mejorados.
            </div>
            <div>
              <strong>Datos:</strong> {data ? `${data.length} registros cargados` : 'No hay datos cargados'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 