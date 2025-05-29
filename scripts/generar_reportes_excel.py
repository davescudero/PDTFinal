import pandas as pd
import json
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class GeneradorReportesExcel:
    """
    Clase para generar reportes Excel automáticamente a partir de los datos procesados
    """
    
    def __init__(self):
        self.datos_completos = None
        self.fecha_reporte = datetime.now().strftime('%Y%m%d_%H%M')
        
    def cargar_datos_procesados(self):
        """Carga los datos procesados desde el JSON"""
        try:
            with open('proyecto_final/datos/procesados/metricas_completas.json', 'r', encoding='utf-8') as f:
                self.datos_completos = json.load(f)
            print("✓ Datos procesados cargados correctamente")
            return True
        except Exception as e:
            print(f"❌ Error cargando datos procesados: {e}")
            return False
    
    def generar_reporte_resumen_ejecutivo(self):
        """Genera reporte resumen ejecutivo"""
        print("Generando reporte resumen ejecutivo...")
        
        try:
            # Crear DataFrame con métricas principales
            metricas = self.datos_completos['metricas_principales']
            
            resumen_data = {
                'Métrica': [
                    'Total Facturado',
                    'Total Costo Directo', 
                    'Costo Promedio por Paciente',
                    'Margen Bruto (%)',
                    'Total Pacientes',
                    'Pacientes Último Mes',
                    'Estancia Promedio (días)',
                    'Tasa de Mortalidad (%)',
                    'Edad Promedio'
                ],
                'Valor': [
                    f"${metricas['financieras']['total_facturado']:,.2f}",
                    f"${metricas['financieras']['total_costo_directo']:,.2f}",
                    f"${metricas['financieras']['costo_promedio']:,.2f}",
                    f"{metricas['financieras']['margen_bruto']:.2f}%",
                    f"{metricas['operacionales']['total_pacientes']:,}",
                    f"{metricas['operacionales']['pacientes_ultimo_mes']:,}",
                    f"{metricas['operacionales']['estancia_promedio']:.1f}",
                    f"{metricas['operacionales']['tasa_mortalidad']:.2f}%",
                    f"{metricas['demograficas']['edad_promedio']:.1f} años"
                ]
            }
            
            df_resumen = pd.DataFrame(resumen_data)
            
            # Crear DataFrame con alertas
            alertas_data = []
            for alerta in self.datos_completos.get('alertas', []):
                alertas_data.append({
                    'Título': alerta['titulo'],
                    'Descripción': alerta['descripcion'],
                    'Severidad': alerta['severidad'].upper(),
                    'Tipo': alerta['tipo'].title(),
                    'Valor': alerta['valor']
                })
            
            df_alertas = pd.DataFrame(alertas_data)
            
            return df_resumen, df_alertas
            
        except Exception as e:
            print(f"❌ Error generando reporte resumen: {e}")
            return None, None
    
    def generar_reporte_servicios(self):
        """Genera reporte detallado por servicios"""
        print("Generando reporte por servicios...")
        
        try:
            servicios_data = []
            for servicio, datos in self.datos_completos['analisis_servicios'].items():
                servicios_data.append({
                    'Servicio': servicio,
                    'Total Facturado': datos['total_facturado'],
                    'Costo Promedio': datos['costo_promedio'],
                    'Total Pacientes': datos['total_pacientes'],
                    'Estancia Promedio': datos['estancia_promedio'],
                    '% de Ingresos': datos['porcentaje_ingresos']
                })
            
            df_servicios = pd.DataFrame(servicios_data)
            df_servicios = df_servicios.sort_values('Total Facturado', ascending=False)
            
            # Formatear columnas monetarias
            df_servicios['Total Facturado Formateado'] = df_servicios['Total Facturado'].apply(lambda x: f"${x:,.2f}")
            df_servicios['Costo Promedio Formateado'] = df_servicios['Costo Promedio'].apply(lambda x: f"${x:,.2f}")
            
            return df_servicios
            
        except Exception as e:
            print(f"❌ Error generando reporte servicios: {e}")
            return None
    
    def generar_reporte_geografico(self):
        """Genera reporte geográfico"""
        print("Generando reporte geográfico...")
        
        try:
            # Reporte por alcaldías
            alcaldias_data = []
            for alcaldia, datos in self.datos_completos['analisis_geografico']['alcaldias'].items():
                alcaldias_data.append({
                    'Alcaldía': alcaldia,
                    'Total Facturado': datos['total_facturado'],
                    'Costo Promedio': datos['costo_promedio'],
                    'Total Pacientes': datos['total_pacientes'],
                    '% de Pacientes': datos['porcentaje_pacientes']
                })
            
            df_alcaldias = pd.DataFrame(alcaldias_data)
            df_alcaldias = df_alcaldias.sort_values('Total Pacientes', ascending=False)
            
            # Reporte por estados
            estados_data = []
            for estado, datos in self.datos_completos['analisis_geografico']['estados'].items():
                estados_data.append({
                    'Estado': estado,
                    'Total Facturado': datos['total_facturado'],
                    'Costo Promedio': datos['costo_promedio'],
                    'Total Pacientes': datos['total_pacientes'],
                    '% de Pacientes': datos['porcentaje_pacientes']
                })
            
            df_estados = pd.DataFrame(estados_data)
            df_estados = df_estados.sort_values('Total Pacientes', ascending=False)
            
            return df_alcaldias, df_estados
            
        except Exception as e:
            print(f"❌ Error generando reporte geográfico: {e}")
            return None, None
    
    def generar_reporte_tendencias(self):
        """Genera reporte de tendencias temporales"""
        print("Generando reporte de tendencias...")
        
        try:
            tendencias_data = []
            for periodo, datos in self.datos_completos['tendencias_temporales'].items():
                tendencias_data.append({
                    'Período': periodo,
                    'Total Facturado': datos['total_facturado'],
                    'Costo Promedio': datos['costo_promedio'],
                    'Total Pacientes': datos['total_pacientes'],
                    'Estancia Promedio': datos['estancia_promedio']
                })
            
            df_tendencias = pd.DataFrame(tendencias_data)
            df_tendencias = df_tendencias.sort_values('Período')
            
            # Calcular variaciones mes a mes
            df_tendencias['Variación Facturación (%)'] = df_tendencias['Total Facturado'].pct_change() * 100
            df_tendencias['Variación Pacientes (%)'] = df_tendencias['Total Pacientes'].pct_change() * 100
            
            return df_tendencias
            
        except Exception as e:
            print(f"❌ Error generando reporte tendencias: {e}")
            return None
    
    def generar_reporte_motivos_alta(self):
        """Genera reporte por motivos de alta"""
        print("Generando reporte por motivos de alta...")
        
        try:
            motivos_data = []
            for motivo, datos in self.datos_completos['analisis_motivos_alta'].items():
                motivos_data.append({
                    'Motivo de Alta': motivo,
                    'Total Facturado': datos['total_facturado'],
                    'Costo Promedio': datos['costo_promedio'],
                    'Total Pacientes': datos['total_pacientes'],
                    'Estancia Promedio': datos['estancia_promedio'],
                    '% de Casos': datos['porcentaje_casos']
                })
            
            df_motivos = pd.DataFrame(motivos_data)
            df_motivos = df_motivos.sort_values('Total Facturado', ascending=False)
            
            return df_motivos
            
        except Exception as e:
            print(f"❌ Error generando reporte motivos: {e}")
            return None
    
    def generar_reporte_modelos_ml(self):
        """Genera reporte de modelos predictivos"""
        print("Generando reporte de modelos ML...")
        
        try:
            ml_data = self.datos_completos.get('machine_learning', {})
            
            if not ml_data.get('disponible', False):
                return pd.DataFrame({'Información': ['Modelos ML no disponibles']})
            
            # Información de modelos
            resumen_modelos = ml_data.get('resumen_modelos', {})
            modelos_info = []
            
            if 'metricas' in resumen_modelos:
                metricas = resumen_modelos['metricas']
                
                if 'demanda' in metricas:
                    modelos_info.append({
                        'Modelo': 'Predicción de Demanda',
                        'Algoritmo': 'Regresión Lineal + Patrones Estacionales',
                        'Precisión': metricas['demanda'].get('precision_estimada', 'N/A'),
                        'Tendencia': f"{metricas['demanda'].get('tendencia_diaria', 0):.2f} pacientes/día"
                    })
                
                if 'costos' in metricas:
                    modelos_info.append({
                        'Modelo': 'Predicción de Costos',
                        'Algoritmo': 'Análisis de Tendencias + Factores Estacionales',
                        'Precisión': metricas['costos'].get('precision_estimada', 'N/A'),
                        'Crecimiento': f"{metricas['costos'].get('crecimiento_mensual_pct', 0):.2f}%/mes"
                    })
                
                if 'clustering' in metricas:
                    modelos_info.append({
                        'Modelo': 'Segmentación de Servicios',
                        'Algoritmo': 'Clustering por Percentiles',
                        'Clusters': metricas['clustering'].get('n_clusters', 'N/A'),
                        'Servicios': metricas['clustering'].get('n_servicios', 'N/A')
                    })
            
            df_modelos = pd.DataFrame(modelos_info)
            
            # Alertas predictivas
            alertas_ml = []
            for alerta in ml_data.get('alertas_ml', []):
                alertas_ml.append({
                    'Servicio': alerta.get('service', 'N/A'),
                    'Predicción': alerta.get('prediction', 'N/A'),
                    'Confianza': alerta.get('confidence', 'N/A'),
                    'Impacto': alerta.get('impact', 'N/A'),
                    'Modelo': alerta.get('modelo_usado', 'N/A')
                })
            
            df_alertas_ml = pd.DataFrame(alertas_ml)
            
            return df_modelos, df_alertas_ml
            
        except Exception as e:
            print(f"❌ Error generando reporte ML: {e}")
            return None, None
    
    def guardar_reportes_excel(self):
        """Guarda todos los reportes en archivos Excel"""
        print("=== GENERANDO REPORTES EXCEL ===")
        
        if not self.cargar_datos_procesados():
            return False
        
        try:
            # Crear directorio de reportes
            os.makedirs('proyecto_final/reportes', exist_ok=True)
            
            # Generar todos los reportes
            df_resumen, df_alertas = self.generar_reporte_resumen_ejecutivo()
            df_servicios = self.generar_reporte_servicios()
            df_alcaldias, df_estados = self.generar_reporte_geografico()
            df_tendencias = self.generar_reporte_tendencias()
            df_motivos = self.generar_reporte_motivos_alta()
            df_modelos, df_alertas_ml = self.generar_reporte_modelos_ml()
            
            # Guardar reporte completo
            nombre_archivo = f'proyecto_final/reportes/Reporte_Hospital_Completo_{self.fecha_reporte}.xlsx'
            
            with pd.ExcelWriter(nombre_archivo, engine='openpyxl') as writer:
                # Hoja de resumen ejecutivo
                if df_resumen is not None:
                    df_resumen.to_excel(writer, sheet_name='Resumen Ejecutivo', index=False)
                
                if df_alertas is not None and not df_alertas.empty:
                    df_alertas.to_excel(writer, sheet_name='Alertas', index=False)
                
                # Hoja de servicios
                if df_servicios is not None:
                    df_servicios.to_excel(writer, sheet_name='Análisis por Servicios', index=False)
                
                # Hojas geográficas
                if df_alcaldias is not None:
                    df_alcaldias.to_excel(writer, sheet_name='Análisis por Alcaldías', index=False)
                
                if df_estados is not None:
                    df_estados.to_excel(writer, sheet_name='Análisis por Estados', index=False)
                
                # Hoja de tendencias
                if df_tendencias is not None:
                    df_tendencias.to_excel(writer, sheet_name='Tendencias Temporales', index=False)
                
                # Hoja de motivos de alta
                if df_motivos is not None:
                    df_motivos.to_excel(writer, sheet_name='Motivos de Alta', index=False)
                
                # Hojas de modelos ML
                if df_modelos is not None:
                    df_modelos.to_excel(writer, sheet_name='Modelos Predictivos', index=False)
                
                if df_alertas_ml is not None and not df_alertas_ml.empty:
                    df_alertas_ml.to_excel(writer, sheet_name='Alertas Predictivas', index=False)
                
                # Hoja de metadatos
                metadatos = self.datos_completos.get('metadatos', {})
                df_metadatos = pd.DataFrame([
                    ['Fecha de Generación', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
                    ['Total Registros Procesados', metadatos.get('total_registros_procesados', 'N/A')],
                    ['Registros Detalle', metadatos.get('registros_detalle', 'N/A')],
                    ['Período de Datos', f"{metadatos.get('periodo_datos', {}).get('inicio', 'N/A')} a {metadatos.get('periodo_datos', {}).get('fin', 'N/A')}"],
                    ['Completitud Costos (%)', f"{metadatos.get('calidad_datos', {}).get('completitud_costos', 0):.1f}%"],
                    ['Completitud Demográficos (%)', f"{metadatos.get('calidad_datos', {}).get('completitud_demograficos', 0):.1f}%"],
                    ['Versión Modelos', metadatos.get('modelos_ml', {}).get('version', 'N/A')]
                ], columns=['Atributo', 'Valor'])
                
                df_metadatos.to_excel(writer, sheet_name='Metadatos', index=False)
            
            print(f"✓ Reporte completo guardado: {nombre_archivo}")
            
            # Generar reportes individuales por área
            self.generar_reportes_individuales()
            
            return True
            
        except Exception as e:
            print(f"❌ Error guardando reportes Excel: {e}")
            return False
    
    def generar_reportes_individuales(self):
        """Genera reportes individuales por área"""
        print("Generando reportes individuales...")
        
        try:
            # Reporte solo de servicios
            df_servicios = self.generar_reporte_servicios()
            if df_servicios is not None:
                archivo_servicios = f'proyecto_final/reportes/Reporte_Servicios_{self.fecha_reporte}.xlsx'
                df_servicios.to_excel(archivo_servicios, index=False)
                print(f"✓ Reporte de servicios: {archivo_servicios}")
            
            # Reporte solo geográfico
            df_alcaldias, df_estados = self.generar_reporte_geografico()
            if df_alcaldias is not None and df_estados is not None:
                archivo_geo = f'proyecto_final/reportes/Reporte_Geografico_{self.fecha_reporte}.xlsx'
                with pd.ExcelWriter(archivo_geo, engine='openpyxl') as writer:
                    df_alcaldias.to_excel(writer, sheet_name='Por Alcaldías', index=False)
                    df_estados.to_excel(writer, sheet_name='Por Estados', index=False)
                print(f"✓ Reporte geográfico: {archivo_geo}")
            
            # Reporte de tendencias
            df_tendencias = self.generar_reporte_tendencias()
            if df_tendencias is not None:
                archivo_tendencias = f'proyecto_final/reportes/Reporte_Tendencias_{self.fecha_reporte}.xlsx'
                df_tendencias.to_excel(archivo_tendencias, index=False)
                print(f"✓ Reporte de tendencias: {archivo_tendencias}")
            
        except Exception as e:
            print(f"❌ Error generando reportes individuales: {e}")

def main():
    """Función principal para generar todos los reportes"""
    generador = GeneradorReportesExcel()
    
    if generador.guardar_reportes_excel():
        print("\n=== REPORTES EXCEL GENERADOS EXITOSAMENTE ===")
        print(f"📁 Ubicación: proyecto_final/reportes/")
        print(f"📅 Fecha: {generador.fecha_reporte}")
        
        # Listar archivos generados
        import glob
        archivos = glob.glob('proyecto_final/reportes/*.xlsx')
        print(f"\n📊 Archivos generados ({len(archivos)}):")
        for archivo in sorted(archivos):
            size_kb = os.path.getsize(archivo) / 1024
            print(f"  - {os.path.basename(archivo)} ({size_kb:.1f} KB)")
    else:
        print("❌ Error generando reportes Excel")

if __name__ == '__main__':
    main() 