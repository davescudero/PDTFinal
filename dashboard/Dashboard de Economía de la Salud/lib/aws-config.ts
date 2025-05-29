import { S3Client } from '@aws-sdk/client-s3';
import { AthenaClient } from '@aws-sdk/client-athena';
import { SageMakerRuntimeClient } from '@aws-sdk/client-sagemaker-runtime';
import { ComprehendClient } from '@aws-sdk/client-comprehend';

// Configuración AWS
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCOUNT_ID = process.env.AWS_ACCOUNT_ID;

// Configuración de credenciales (solo en el servidor)
const getCredentials = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, no usar credenciales
    return undefined;
  }
  
  // En el servidor, usar variables de entorno
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  
  return undefined;
};

// Clientes AWS (solo en el servidor)
export const s3Client = typeof window === 'undefined' ? new S3Client({
  region: AWS_REGION,
  credentials: getCredentials(),
}) : null;

export const athenaClient = typeof window === 'undefined' ? new AthenaClient({
  region: AWS_REGION,
  credentials: getCredentials(),
}) : null;

export const sagemakerClient = typeof window === 'undefined' ? new SageMakerRuntimeClient({
  region: AWS_REGION,
  credentials: getCredentials(),
}) : null;

export const comprehendClient = typeof window === 'undefined' ? new ComprehendClient({
  region: AWS_REGION,
  credentials: getCredentials(),
}) : null;

// Configuración del proyecto
export const AWS_CONFIG = {
  region: AWS_REGION,
  accountId: AWS_ACCOUNT_ID,
  
  // S3 Buckets
  buckets: {
    rawData: `hospital-economics-dev-data-${AWS_ACCOUNT_ID}`,
    processedData: `hospital-economics-dev-processed-${AWS_ACCOUNT_ID}`,
    results: `hospital-economics-dev-results-${AWS_ACCOUNT_ID}`,
  },
  
  // Athena
  athena: {
    database: 'hospital_economics_dev',
    workgroup: 'primary',
    outputLocation: `s3://hospital-economics-dev-results-${AWS_ACCOUNT_ID}/athena-results/`,
  },
  
  // SageMaker Endpoints
  sagemaker: {
    endpoints: {
      demandPrediction: 'hospital-economics-dev-demand-endpoint',
      costPrediction: 'hospital-economics-dev-cost-endpoint',
      anomalyDetection: 'hospital-economics-dev-anomaly-endpoint',
    },
  },
  
  // Tablas de datos
  tables: {
    resumenAnonimizado: 'resumen_anonimizado',
    detalleAnonimizado: 'detalle_anonimizado',
    metricasCompletas: 'metricas_completas',
  },
};

export default AWS_CONFIG; 