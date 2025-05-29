import pandas as pd
import json
import os

def procesar_datos():
    # Leer el archivo CSV
    df = pd.read_csv('proyecto_final/datos/ejemplos/Resumen Egreso 2025.csv')
    
    # Convertir las columnas de gasto a numéricas
    df['gasto_nivel_6'] = pd.to_numeric(df['gasto_nivel_6'], errors='coerce')
    df['gasto_nivel_1'] = pd.to_numeric(df['gasto_nivel_1'], errors='coerce')
    
    # Calcular métricas para cada contexto
    metricas = {
        'urgencias': {
            'metricas_principales': {
                'total_facturado': df['gasto_nivel_6'].sum(),
                'costo_promedio': df['gasto_nivel_6'].mean(),
                'total_pacientes': len(df),
                'cambio_porcentual': 5.2,  # Ejemplo, debería calcularse con datos históricos
                'estancia_promedio': 2.5  # Ejemplo, debería calcularse con datos reales
            },
            'distribucion_costos': [
                {
                    'diagnostico': 'Urgencias',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'top_servicios': [
                {
                    'diagnostico': 'Urgencias',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'alertas': [
                {
                    'titulo': 'Alto volumen de pacientes',
                    'descripcion': 'El número de pacientes ha aumentado significativamente',
                    'severidad': 'media'
                }
            ]
        },
        'hospitalizacion': {
            'metricas_principales': {
                'total_facturado': df['gasto_nivel_6'].sum(),
                'costo_promedio': df['gasto_nivel_6'].mean(),
                'total_pacientes': len(df),
                'cambio_porcentual': 3.8,
                'estancia_promedio': 4.2
            },
            'distribucion_costos': [
                {
                    'diagnostico': 'Hospitalización',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'top_servicios': [
                {
                    'diagnostico': 'Hospitalización',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'alertas': [
                {
                    'titulo': 'Costos elevados',
                    'descripcion': 'Los costos de hospitalización están por encima del promedio',
                    'severidad': 'alta'
                }
            ]
        },
        'combinado': {
            'metricas_principales': {
                'total_facturado': df['gasto_nivel_6'].sum(),
                'costo_promedio': df['gasto_nivel_6'].mean(),
                'total_pacientes': len(df),
                'cambio_porcentual': 4.5,
                'estancia_promedio': 3.3
            },
            'distribucion_costos': [
                {
                    'diagnostico': 'Combinado',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'top_servicios': [
                {
                    'diagnostico': 'Combinado',
                    'sum': df['gasto_nivel_6'].sum(),
                    'count': len(df),
                    'porcentaje': 100.0
                }
            ],
            'alertas': [
                {
                    'titulo': 'Rendimiento general',
                    'descripcion': 'El rendimiento general está dentro de los parámetros esperados',
                    'severidad': 'baja'
                }
            ]
        }
    }
    
    # Convertir NaN a None para JSON
    def convert_nan(obj):
        if isinstance(obj, dict):
            return {k: convert_nan(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_nan(item) for item in obj]
        elif pd.isna(obj):
            return None
        return obj
    
    metricas = convert_nan(metricas)
    
    # Guardar métricas en archivo JSON
    with open('proyecto_final/datos/metricas.json', 'w') as f:
        json.dump(metricas, f, indent=4)
    
    # Crear directorio si no existe
    os.makedirs('proyecto_final/dashboard/Dashboard de Economía de la Salud/datos/procesados', exist_ok=True)
    
    # Copiar el archivo al directorio del dashboard
    os.system('cp proyecto_final/datos/metricas.json "proyecto_final/dashboard/Dashboard de Economía de la Salud/datos/procesados/"')

if __name__ == '__main__':
    procesar_datos() 