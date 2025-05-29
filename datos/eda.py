import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

def detectar_columna_costos(df):
    posibles = ['costo_nivel_6', 'gasto_nivel_6', 'monto_nivel_6']
    for col in posibles:
        if col in df.columns:
            return col
    # Si no encuentra ninguna, busca la primera columna que contenga 'costo', 'gasto' o 'monto'
    for col in df.columns:
        if any(x in col.lower() for x in ['costo', 'gasto', 'monto']):
            return col
    return None

def analizar_archivo_detalle():
    print("\n=== ANÁLISIS DEL ARCHIVO DETALLADO ===")
    df = pd.read_csv('proyecto_final/datos/ejemplos/Egreso Detalle Ene 2025 a Abr 2025.csv')
    
    # Información básica
    print("\nInformación del DataFrame:")
    print(f"Dimensiones: {df.shape}")
    print("\nColumnas disponibles:")
    for col in df.columns:
        print(f"- {col}")
    
    # Tipos de datos
    print("\nTipos de datos:")
    print(df.dtypes)
    
    # Valores nulos
    print("\nValores nulos por columna:")
    print(df.isnull().sum())
    
    # Estadísticas descriptivas
    print("\nEstadísticas descriptivas de columnas numéricas:")
    print(df.describe())
    
    # Análisis de costos
    print("\nAnálisis de costos:")
    costos_cols = [col for col in df.columns if 'costo' in col.lower() or 'monto' in col.lower() or 'gasto' in col.lower()]
    for col in costos_cols:
        print(f"\nEstadísticas de {col}:")
        print(df[col].describe())
    
    # Detectar columna de costos principal
    col_costos = detectar_columna_costos(df)
    if col_costos:
        print(f"\nColumna de costos principal detectada: {col_costos}")
        # Guardar gráficos
        plt.figure(figsize=(15, 10))
        # Distribución de costos
        plt.subplot(2, 2, 1)
        sns.histplot(data=df, x=col_costos, bins=50)
        plt.title(f'Distribución de {col_costos}')
        plt.xlabel('Costo')
        plt.ylabel('Frecuencia')
        # Box plot de costos
        plt.subplot(2, 2, 2)
        sns.boxplot(data=df, y=col_costos)
        plt.title(f'Box Plot de {col_costos}')
        plt.ylabel('Costo')
        # Guardar gráficos
        plt.tight_layout()
        plt.savefig('proyecto_final/datos/graficos/analisis_detalle.png')
        plt.close()
    else:
        print("No se encontró columna de costos principal para graficar.")

def analizar_archivo_resumen():
    print("\n=== ANÁLISIS DEL ARCHIVO RESUMEN ===")
    df = pd.read_csv('proyecto_final/datos/ejemplos/Resumen Egreso 2025.csv')
    
    # Renombrar columna de servicios
    df = df.rename(columns={'FYF7Y9IB2I2II_L5JF77Y5J5F1B': 'servicio_origen'})
    
    # Información básica
    print("\nInformación del DataFrame:")
    print(f"Dimensiones: {df.shape}")
    print("\nColumnas disponibles:")
    for col in df.columns:
        print(f"- {col}")
    
    # Tipos de datos
    print("\nTipos de datos:")
    print(df.dtypes)
    
    # Valores nulos
    print("\nValores nulos por columna:")
    print(df.isnull().sum())
    
    # Estadísticas descriptivas
    print("\nEstadísticas descriptivas de columnas numéricas:")
    print(df.describe())
    
    # Análisis de costos
    print("\nAnálisis de costos:")
    costos_cols = [col for col in df.columns if 'costo' in col.lower() or 'monto' in col.lower() or 'gasto' in col.lower()]
    for col in costos_cols:
        print(f"\nEstadísticas de {col}:")
        print(df[col].describe())
    
    # Detectar columna de costos principal
    col_costos = detectar_columna_costos(df)
    if col_costos:
        print(f"\nColumna de costos principal detectada: {col_costos}")
        
        # Análisis por motivo de alta
        print("\nAnálisis de costos por motivo de alta hospitalización:")
        costos_por_motivo = df.groupby('motivo_alta_hosp')[col_costos].agg(['mean', 'sum', 'count']).sort_values('sum', ascending=False)
        print(costos_por_motivo)
        
        # Análisis por alcaldía
        print("\nAnálisis de costos por alcaldía (solo registros completos):")
        df_alcaldias = df.dropna(subset=['alcaldia_municipio', col_costos])
        costos_por_alcaldia = df_alcaldias.groupby('alcaldia_municipio')[col_costos].agg(['mean', 'sum', 'count']).sort_values('sum', ascending=False)
        print(costos_por_alcaldia)
        
        # Guardar gráficos
        plt.figure(figsize=(20, 15))
        
        # Distribución de costos
        plt.subplot(2, 2, 1)
        sns.histplot(data=df, x=col_costos, bins=50)
        plt.title(f'Distribución de {col_costos}')
        plt.xlabel('Costo')
        plt.ylabel('Frecuencia')
        
        # Box plot de costos
        plt.subplot(2, 2, 2)
        sns.boxplot(data=df, y=col_costos)
        plt.title(f'Box Plot de {col_costos}')
        plt.ylabel('Costo')
        
        # Costos por motivo de alta (top 10)
        plt.subplot(2, 2, 3)
        top_motivos = costos_por_motivo.head(10)
        sns.barplot(data=top_motivos.reset_index(), x='mean', y='motivo_alta_hosp')
        plt.title('Top 10 Costos Promedio por Motivo de Alta')
        plt.xlabel('Costo Promedio')
        plt.ylabel('Motivo de Alta')
        
        # Costos por alcaldía (top 10)
        plt.subplot(2, 2, 4)
        top_alcaldias = costos_por_alcaldia.head(10)
        sns.barplot(data=top_alcaldias.reset_index(), x='mean', y='alcaldia_municipio')
        plt.title('Top 10 Costos Promedio por Alcaldía')
        plt.xlabel('Costo Promedio')
        plt.ylabel('Alcaldía')
        
        # Guardar gráficos
        plt.tight_layout()
        plt.savefig('proyecto_final/datos/graficos/analisis_resumen.png')
        plt.close()
        
        # Guardar datos procesados
        costos_por_motivo.to_csv('proyecto_final/datos/costos_por_motivo.csv')
        costos_por_alcaldia.to_csv('proyecto_final/datos/costos_por_alcaldia.csv')
    else:
        print("No se encontró columna de costos principal para graficar.")

def main():
    # Crear directorio para gráficos si no existe
    Path('proyecto_final/datos/graficos').mkdir(parents=True, exist_ok=True)
    
    # Analizar ambos archivos
    analizar_archivo_detalle()
    analizar_archivo_resumen()

if __name__ == '__main__':
    main() 