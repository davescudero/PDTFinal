import pandas as pd
import numpy as np
from datetime import datetime
import json
from pathlib import Path

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.float64):
            return float(obj)
        if isinstance(obj, np.int64):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)

def procesar_contexto(df, prefijo_fecha_recepcion, prefijo_fecha_egreso, prefijo_diag, prefijo_gasto, prefijo_estancia=None):
    # Fechas
    df = df.copy()
    df["fecha_recepcion"] = pd.to_datetime(df[prefijo_fecha_recepcion], errors='coerce')
    df["fecha_egreso"] = pd.to_datetime(df[prefijo_fecha_egreso], errors='coerce')
    # Gastos
    df["gasto"] = pd.to_numeric(df[prefijo_gasto], errors='coerce').fillna(0)
    # Diagnóstico
    df["diagnostico"] = df[prefijo_diag].fillna("Sin diagnóstico")
    # Estancia
    if prefijo_estancia and prefijo_estancia in df.columns:
        df["estancia"] = pd.to_numeric(df[prefijo_estancia], errors='coerce')
    else:
        df["estancia"] = (df["fecha_egreso"] - df["fecha_recepcion"]).dt.days
    # Métricas principales
    total_facturado = df["gasto"].sum()
    costo_promedio = df["gasto"].mean()
    total_pacientes = len(df)
    # Cambio porcentual respecto al mes anterior
    mes_actual = df["fecha_egreso"].dt.to_period('M').max()
    mes_anterior = mes_actual - 1
    gasto_mes_actual = df[df["fecha_egreso"].dt.to_period('M') == mes_actual]["gasto"].sum()
    gasto_mes_anterior = df[df["fecha_egreso"].dt.to_period('M') == mes_anterior]["gasto"].sum()
    cambio_porcentual = ((gasto_mes_actual - gasto_mes_anterior) / gasto_mes_anterior) * 100 if gasto_mes_anterior != 0 else 0
    # Distribución de costos
    distribucion_costos = df.groupby("diagnostico")["gasto"].agg(['sum', 'count']).reset_index()
    distribucion_costos['porcentaje'] = (distribucion_costos['sum'] / total_facturado) * 100
    distribucion_costos = distribucion_costos.sort_values('sum', ascending=False)
    top_servicios = distribucion_costos.head(10).to_dict('records')
    estancia_promedio = df["estancia"].mean()
    # Alertas
    alertas = []
    if cambio_porcentual > 10:
        alertas.append({
            'titulo': 'Aumento significativo en costos',
            'descripcion': f'Los costos han aumentado un {cambio_porcentual:.1f}% respecto al mes anterior',
            'severidad': 'alta'
        })
    if estancia_promedio > 7:
        alertas.append({
            'titulo': 'Estancia hospitalaria elevada',
            'descripcion': f'La estancia hospitalaria promedio es de {estancia_promedio:.1f} días',
            'severidad': 'media'
        })
    return {
        'metricas_principales': {
            'total_facturado': float(total_facturado),
            'costo_promedio': float(costo_promedio),
            'total_pacientes': int(total_pacientes),
            'cambio_porcentual': float(cambio_porcentual),
            'estancia_promedio': float(estancia_promedio) if not pd.isna(estancia_promedio) else None
        },
        'distribucion_costos': distribucion_costos.to_dict('records'),
        'top_servicios': top_servicios,
        'alertas': alertas
    }

def main():
    # Definir rutas
    ruta_csv = Path('../datos/ejemplos/Resumen Egreso 2025.csv')
    ruta_salida = Path('../datos/procesados/metricas.json')
    
    # Crear directorio de salida si no existe
    ruta_salida.parent.mkdir(parents=True, exist_ok=True)
    
    # Procesar datos
    df = pd.read_csv(ruta_csv)
    # Urgencias
    urgencias = procesar_contexto(
        df,
        prefijo_fecha_recepcion='fecha_recepcion_urg',
        prefijo_fecha_egreso='fecha_egreso_urg',
        prefijo_diag='diagnostico_urg',
        prefijo_gasto='diagnostico_hosp',
        prefijo_estancia=None
    )
    # Hospitalización
    hospitalizacion = procesar_contexto(
        df,
        prefijo_fecha_recepcion='fecha_recepcion_hosp',
        prefijo_fecha_egreso='fecha_egreso_hosp',
        prefijo_diag='diagnostico_hosp',
        prefijo_gasto='diagnostico_hosp',
        prefijo_estancia='estancia_hosp'
    )
    # Combinado (usando fecha_egreso_general y sumando ambos diagnósticos)
    df_comb = df.copy()
    df_comb['fecha_recepcion'] = pd.to_datetime(df_comb['fecha_recepcion_urg'], errors='coerce')
    df_comb['fecha_egreso'] = pd.to_datetime(df_comb['fecha_egreso_general'], errors='coerce')
    df_comb['gasto'] = pd.to_numeric(df_comb['diagnostico_hosp'], errors='coerce').fillna(0)
    # Diagnóstico combinado: prioriza hospitalización, si no hay usa urgencias
    df_comb['diagnostico'] = df_comb['diagnostico_hosp'].fillna(df_comb['diagnostico_urg']).fillna('Sin diagnóstico')
    df_comb['estancia'] = pd.to_numeric(df_comb['estancia_hosp'], errors='coerce')
    combinado = procesar_contexto(
        df_comb,
        prefijo_fecha_recepcion='fecha_recepcion',
        prefijo_fecha_egreso='fecha_egreso',
        prefijo_diag='diagnostico',
        prefijo_gasto='gasto',
        prefijo_estancia='estancia'
    )
    # Guardar resultado
    resultado = {
        'urgencias': urgencias,
        'hospitalizacion': hospitalizacion,
        'combinado': combinado
    }
    with open(ruta_salida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2, cls=NumpyEncoder)
    print(f"Datos procesados y guardados en {ruta_salida}")

if __name__ == "__main__":
    main() 