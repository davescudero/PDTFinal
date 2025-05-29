import { sagemakerClient, comprehendClient, AWS_CONFIG } from './aws-config';
import { InvokeEndpointCommand } from '@aws-sdk/client-sagemaker-runtime';
import { DetectSentimentCommand } from '@aws-sdk/client-comprehend';

export interface PredictionInput {
  fecha?: string;
  servicio?: string;
  alcaldia?: string;
  edad_rango?: string;
  dias_estancia?: number;
  total_facturado?: number;
  [key: string]: any;
}

export interface PredictionResult {
  prediction: number | string;
  confidence: number;
  model: string;
  executionTime: number;
}

export class AWSService {
  
  /**
   * Predice la demanda de servicios hospitalarios usando SageMaker
   */
  static async predictDemand(input: PredictionInput): Promise<PredictionResult> {
    const startTime = Date.now();
    
    try {
      // TODO: Implementar SageMaker cuando esté configurado
      // Por ahora, usar fallback local mejorado
      throw new Error('SageMaker endpoints not configured yet');
    } catch (error) {
      console.log('Using local enhanced prediction for demand');
      
      // Fallback a predicción local mejorada
      return this.fallbackDemandPrediction(input, Date.now() - startTime);
    }
  }
  
  /**
   * Predice los costos usando SageMaker
   */
  static async predictCost(input: PredictionInput): Promise<PredictionResult> {
    const startTime = Date.now();
    
    try {
      // TODO: Implementar SageMaker cuando esté configurado
      throw new Error('SageMaker endpoints not configured yet');
    } catch (error) {
      console.log('Using local enhanced prediction for cost');
      
      // Fallback a predicción local
      return this.fallbackCostPrediction(input, Date.now() - startTime);
    }
  }
  
  /**
   * Detecta anomalías usando SageMaker
   */
  static async detectAnomalies(input: PredictionInput): Promise<PredictionResult> {
    const startTime = Date.now();
    
    try {
      // TODO: Implementar SageMaker cuando esté configurado
      throw new Error('SageMaker endpoints not configured yet');
    } catch (error) {
      console.log('Using local enhanced anomaly detection');
      
      // Fallback a detección local
      return this.fallbackAnomalyDetection(input, Date.now() - startTime);
    }
  }
  
  /**
   * Analiza sentimiento usando Comprehend a través de API route
   */
  static async analyzeSentiment(text: string): Promise<any> {
    try {
      // Usar API route para AWS Comprehend
      const response = await fetch('/api/aws/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.log('API call failed, using local sentiment analysis');
      
      // Fallback básico mejorado
      const sentiment = this.analyzeLocalSentiment(text);
      return {
        sentiment: sentiment.sentiment,
        confidence: sentiment.confidence,
        scores: sentiment.scores,
        model: 'local-enhanced',
      };
    }
  }
  
  /**
   * Verifica si AWS está disponible
   */
  static async isAWSAvailable(): Promise<boolean> {
    try {
      // Intentar una operación simple con Comprehend
      const result = await this.analyzeSentiment('test');
      return result.model === 'aws-comprehend';
    } catch (error) {
      return false;
    }
  }
  
  // Análisis de sentimiento local mejorado
  private static analyzeLocalSentiment(text: string): any {
    const positiveWords = ['excelente', 'bueno', 'mejor', 'mejoría', 'recuperación', 'estable', 'satisfactorio'];
    const negativeWords = ['malo', 'peor', 'deterioro', 'complicación', 'grave', 'crítico', 'preocupante'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore += 1;
    });
    
    let sentiment = 'NEUTRAL';
    let confidence = 0.5;
    
    if (positiveScore > negativeScore) {
      sentiment = 'POSITIVE';
      confidence = Math.min(0.8, 0.5 + (positiveScore * 0.1));
    } else if (negativeScore > positiveScore) {
      sentiment = 'NEGATIVE';
      confidence = Math.min(0.8, 0.5 + (negativeScore * 0.1));
    }
    
    return {
      sentiment,
      confidence,
      scores: {
        Positive: sentiment === 'POSITIVE' ? confidence : 1 - confidence,
        Negative: sentiment === 'NEGATIVE' ? confidence : 1 - confidence,
        Neutral: sentiment === 'NEUTRAL' ? confidence : 0.2,
        Mixed: 0.1
      }
    };
  }
  
  // Métodos privados para preparar características
  private static prepareDemandFeatures(input: PredictionInput): string {
    const fecha = new Date(input.fecha || Date.now());
    const mes = fecha.getMonth() + 1;
    const diaSemana = fecha.getDay();
    
    const servicios = ['URGENCIAS', 'CONSULTA_EXTERNA', 'HOSPITALIZACION', 'CIRUGIA'];
    const servicioEncoded = servicios.indexOf(input.servicio || 'URGENCIAS');
    
    const alcaldias = ['IZTAPALAPA', 'GUSTAVO_A_MADERO', 'TLALPAN', 'COYOACAN', 'ALVARO_OBREGON'];
    const alcaldiaEncoded = alcaldias.indexOf(input.alcaldia || 'IZTAPALAPA');
    
    return `${mes},${diaSemana},${servicioEncoded},${alcaldiaEncoded}`;
  }
  
  private static prepareCostFeatures(input: PredictionInput): string {
    const diasEstancia = input.dias_estancia || 1;
    const edadRango = this.encodeEdadRango(input.edad_rango || '30-34');
    const servicioEncoded = this.encodeServicio(input.servicio || 'URGENCIAS');
    
    return `${diasEstancia},${edadRango},${servicioEncoded}`;
  }
  
  private static prepareAnomalyFeatures(input: PredictionInput): string {
    const costo = input.total_facturado || 0;
    const diasEstancia = input.dias_estancia || 1;
    const costoPorDia = costo / diasEstancia;
    const servicioEncoded = this.encodeServicio(input.servicio || 'URGENCIAS');
    
    return `${costo},${diasEstancia},${costoPorDia},${servicioEncoded}`;
  }
  
  private static encodeEdadRango(edadRango: string): number {
    const rangos = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+'];
    return rangos.indexOf(edadRango);
  }
  
  private static encodeServicio(servicio: string): number {
    const servicios = ['URGENCIAS', 'CONSULTA_EXTERNA', 'HOSPITALIZACION', 'CIRUGIA', 'PEDIATRIA'];
    return servicios.indexOf(servicio);
  }
  
  // Métodos fallback mejorados
  private static fallbackDemandPrediction(input: PredictionInput, executionTime: number): PredictionResult {
    const fecha = new Date(input.fecha || Date.now());
    const mes = fecha.getMonth() + 1;
    const diaSemana = fecha.getDay();
    
    let demandaBase = 100;
    
    // Ajustes estacionales
    if ([12, 1, 2].includes(mes)) demandaBase *= 1.2; // Invierno
    if ([6, 7, 8].includes(mes)) demandaBase *= 0.9; // Verano
    
    // Ajustes por día de la semana
    if ([1, 2].includes(diaSemana)) demandaBase *= 1.3; // Lunes/Martes
    if ([6, 0].includes(diaSemana)) demandaBase *= 0.7; // Fin de semana
    
    // Ajustes por servicio
    if (input.servicio === 'URGENCIAS') demandaBase *= 1.5;
    if (input.servicio === 'CONSULTA_EXTERNA') demandaBase *= 0.8;
    
    // Agregar variabilidad realista
    const variacion = (Math.random() - 0.5) * 0.2; // ±10%
    demandaBase *= (1 + variacion);
    
    return {
      prediction: Math.round(demandaBase),
      confidence: 0.75,
      model: 'local-enhanced',
      executionTime,
    };
  }
  
  private static fallbackCostPrediction(input: PredictionInput, executionTime: number): PredictionResult {
    const diasEstancia = input.dias_estancia || 1;
    
    const costosBase: { [key: string]: number } = {
      'URGENCIAS': 5000,
      'CONSULTA_EXTERNA': 800,
      'HOSPITALIZACION': 3000,
      'CIRUGIA': 15000,
      'PEDIATRIA': 2500,
    };
    
    const costoBase = costosBase[input.servicio || 'URGENCIAS'] || 3000;
    let costoTotal = costoBase * diasEstancia;
    
    // Ajustes por alcaldía (simulando diferencias socioeconómicas)
    if (input.alcaldia === 'IZTAPALAPA') costoTotal *= 0.9;
    if (input.alcaldia === 'COYOACAN') costoTotal *= 1.1;
    
    // Agregar variabilidad
    const variacion = (Math.random() - 0.5) * 0.3; // ±15%
    costoTotal *= (1 + variacion);
    
    return {
      prediction: Math.round(costoTotal),
      confidence: 0.8,
      model: 'local-enhanced',
      executionTime,
    };
  }
  
  private static fallbackAnomalyDetection(input: PredictionInput, executionTime: number): PredictionResult {
    const costo = input.total_facturado || 0;
    const diasEstancia = input.dias_estancia || 1;
    const costoPorDia = costo / diasEstancia;
    
    const umbrales: { [key: string]: number } = {
      'URGENCIAS': 8000,
      'CONSULTA_EXTERNA': 2000,
      'HOSPITALIZACION': 5000,
      'CIRUGIA': 25000,
      'PEDIATRIA': 4000,
    };
    
    const umbral = umbrales[input.servicio || 'URGENCIAS'] || 5000;
    let anomalyScore = costoPorDia / umbral;
    
    // Normalizar entre 0 y 2
    anomalyScore = Math.min(anomalyScore, 2.0);
    
    // Agregar algo de ruido realista
    const ruido = (Math.random() - 0.5) * 0.1;
    anomalyScore += ruido;
    anomalyScore = Math.max(0, Math.min(2, anomalyScore));
    
    return {
      prediction: Number(anomalyScore.toFixed(2)),
      confidence: 0.7,
      model: 'local-enhanced',
      executionTime,
    };
  }
} 