import pandas as pd
import numpy as np
import json
import os
import sys
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Agregar el directorio de modelos al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modelos'))

try:
    from modelos_predictivos import ModelosPredictivosHospital, entrenar_modelos_completos
    MODELOS_ML_DISPONIBLES = True
    print("✓ Modelos de Machine Learning cargados correctamente")
except ImportError as e:
    print(f"⚠ No se pudieron cargar los modelos ML avanzados: {e}")
    try:
        from modelos_predictivos_simple import entrenar_modelos_simples
        MODELOS_SIMPLES_DISPONIBLES = True
        MODELOS_ML_DISPONIBLES = False
        print("✓ Modelos simples cargados como fallback")
    except ImportError as e2:
        print(f"⚠ No se pudieron cargar los modelos simples: {e2}")
        MODELOS_ML_DISPONIBLES = False
        MODELOS_SIMPLES_DISPONIBLES = False

class ProcesadorDatosHospital:
    def __init__(self):
        self.df_resumen = None
        self.df_detalle = None
        self.metricas_completas = {}
        self.modelos_ml = None
        
    def cargar_datos(self):
        """Carga los archivos CSV de datos"""
        print("Cargando datos...")
        
        # Cargar archivo resumen
        try:
            self.df_resumen = pd.read_csv('proyecto_final/datos/ejemplos/Resumen Egreso 2025.csv')
            print(f"✓ Archivo resumen cargado: {self.df_resumen.shape[0]} registros")
        except Exception as e:
            print(f"Error cargando archivo resumen: {e}")
            return False
            
        # Cargar archivo detalle (si existe y no es muy grande)
        try:
            # Verificar tamaño del archivo
            import os
            size_mb = os.path.getsize('proyecto_final/datos/ejemplos/Egreso Detalle Ene 2025 a Abr 2025.csv') / (1024*1024)
            if size_mb < 500:  # Solo cargar si es menor a 500MB
                self.df_detalle = pd.read_csv('proyecto_final/datos/ejemplos/Egreso Detalle Ene 2025 a Abr 2025.csv')
                print(f"✓ Archivo detalle cargado: {self.df_detalle.shape[0]} registros")
            else:
                print(f"⚠ Archivo detalle muy grande ({size_mb:.1f}MB), usando solo muestra")
                self.df_detalle = pd.read_csv('proyecto_final/datos/ejemplos/Egreso Detalle Ene 2025 a Abr 2025.csv', nrows=50000)
        except Exception as e:
            print(f"⚠ No se pudo cargar archivo detalle: {e}")
            
        return True
    
    def limpiar_datos(self):
        """Limpia y prepara los datos para análisis"""
        print("Limpiando datos...")
        
        if self.df_resumen is not None:
            # Renombrar columna problemática
            if 'FYF7Y9IB2I2II_L5JF77Y5J5F1B' in self.df_resumen.columns:
                self.df_resumen = self.df_resumen.rename(columns={'FYF7Y9IB2I2II_L5JF77Y5J5F1B': 'servicio_origen'})
            
            # Convertir columnas de costos a numéricas
            columnas_costos = ['gasto_nivel_6', 'gasto_nivel_1']
            for col in columnas_costos:
                if col in self.df_resumen.columns:
                    self.df_resumen[col] = pd.to_numeric(self.df_resumen[col], errors='coerce')
            
            # Convertir fechas
            columnas_fechas = ['fecha_recepcion_urg', 'fecha_egreso_urg', 'fecha_recepcion_hosp', 'fecha_egreso_hosp', 'fecha_egreso_general']
            for col in columnas_fechas:
                if col in self.df_resumen.columns:
                    self.df_resumen[col] = pd.to_datetime(self.df_resumen[col], errors='coerce')
            
            # Calcular días de estancia
            if 'fecha_recepcion_hosp' in self.df_resumen.columns and 'fecha_egreso_hosp' in self.df_resumen.columns:
                self.df_resumen['dias_estancia_calculado'] = (
                    self.df_resumen['fecha_egreso_hosp'] - self.df_resumen['fecha_recepcion_hosp']
                ).dt.days
            
            # Limpiar datos demográficos
            if 'edad' in self.df_resumen.columns:
                self.df_resumen['edad'] = pd.to_numeric(self.df_resumen['edad'], errors='coerce')
                # Filtrar edades razonables (0-120 años)
                self.df_resumen.loc[self.df_resumen['edad'] > 120, 'edad'] = np.nan
                self.df_resumen.loc[self.df_resumen['edad'] < 0, 'edad'] = np.nan
            
            print(f"✓ Datos del resumen limpiados: {self.df_resumen.shape[0]} registros válidos")
        
        # Limpiar datos detalle si están disponibles
        if self.df_detalle is not None:
            print("Limpiando datos detalle...")
            # Aplicar las mismas limpiezas al archivo detalle
            columnas_costos = ['gasto_nivel_6', 'gasto_nivel_1']
            for col in columnas_costos:
                if col in self.df_detalle.columns:
                    self.df_detalle[col] = pd.to_numeric(self.df_detalle[col], errors='coerce')
            
            if 'edad' in self.df_detalle.columns:
                self.df_detalle['edad'] = pd.to_numeric(self.df_detalle['edad'], errors='coerce')
                self.df_detalle.loc[self.df_detalle['edad'] > 120, 'edad'] = np.nan
                self.df_detalle.loc[self.df_detalle['edad'] < 0, 'edad'] = np.nan
            
            print(f"✓ Datos detalle limpiados: {self.df_detalle.shape[0]} registros válidos")
    
    def calcular_metricas_principales(self):
        """Calcula métricas principales del hospital"""
        print("Calculando métricas principales...")
        
        df = self.df_resumen
        
        # Métricas financieras básicas
        total_facturado = df['gasto_nivel_6'].sum()
        total_costo_directo = df['gasto_nivel_1'].sum()
        costo_promedio = df['gasto_nivel_6'].mean()
        total_pacientes = len(df)
        
        # Métricas de estancia
        estancia_promedio = df['dias_estancia_calculado'].mean() if 'dias_estancia_calculado' in df.columns else df.get('dias_hopit', pd.Series([0])).mean()
        
        # Métricas demográficas
        edad_promedio = df['edad'].mean()
        distribucion_sexo = df['sexo'].value_counts(normalize=True).to_dict() if 'sexo' in df.columns else {}
        
        # Métricas de resultados
        distribucion_motivos = df['motivo_alta_hosp'].value_counts(normalize=True).to_dict() if 'motivo_alta_hosp' in df.columns else {}
        tasa_mortalidad = (df['motivo_alta_hosp'] == 'DEFUNCIÓN').sum() / len(df) * 100 if 'motivo_alta_hosp' in df.columns else 0
        
        # Métricas temporales
        df_ultimo_mes = df[df['fecha_egreso_general'] >= (datetime.now() - timedelta(days=30))] if 'fecha_egreso_general' in df.columns else df
        pacientes_ultimo_mes = len(df_ultimo_mes)
        
        return {
            'financieras': {
                'total_facturado': float(total_facturado) if not pd.isna(total_facturado) else 0,
                'total_costo_directo': float(total_costo_directo) if not pd.isna(total_costo_directo) else 0,
                'costo_promedio': float(costo_promedio) if not pd.isna(costo_promedio) else 0,
                'margen_bruto': float((total_facturado - total_costo_directo) / total_facturado * 100) if total_facturado > 0 else 0
            },
            'operacionales': {
                'total_pacientes': int(total_pacientes),
                'pacientes_ultimo_mes': int(pacientes_ultimo_mes),
                'estancia_promedio': float(estancia_promedio) if not pd.isna(estancia_promedio) else 0,
                'tasa_mortalidad': float(tasa_mortalidad)
            },
            'demograficas': {
                'edad_promedio': float(edad_promedio) if not pd.isna(edad_promedio) else 0,
                'distribucion_sexo': distribucion_sexo,
                'distribucion_motivos': distribucion_motivos
            }
        }
    
    def analizar_por_servicio(self):
        """Analiza costos y métricas por servicio/área"""
        print("Analizando por servicio...")
        
        df = self.df_resumen
        
        # Análisis por servicio de origen
        if 'servicio_origen' in df.columns:
            servicios = df.groupby('servicio_origen').agg({
                'gasto_nivel_6': ['sum', 'mean', 'count'],
                'dias_estancia_calculado': 'mean' if 'dias_estancia_calculado' in df.columns else 'dias_hopit'
            }).round(2)
            
            servicios.columns = ['total_facturado', 'costo_promedio', 'total_pacientes', 'estancia_promedio']
            servicios['porcentaje_ingresos'] = (servicios['total_facturado'] / servicios['total_facturado'].sum() * 100).round(2)
            
            return servicios.sort_values('total_facturado', ascending=False).head(20).to_dict('index')
        
        return {}
    
    def analizar_por_motivo_alta(self):
        """Analiza costos por motivo de alta"""
        print("Analizando por motivo de alta...")
        
        df = self.df_resumen
        
        if 'motivo_alta_hosp' in df.columns:
            motivos = df.groupby('motivo_alta_hosp').agg({
                'gasto_nivel_6': ['sum', 'mean', 'count'],
                'dias_estancia_calculado': 'mean' if 'dias_estancia_calculado' in df.columns else 'dias_hopit'
            }).round(2)
            
            motivos.columns = ['total_facturado', 'costo_promedio', 'total_pacientes', 'estancia_promedio']
            motivos['porcentaje_casos'] = (motivos['total_pacientes'] / motivos['total_pacientes'].sum() * 100).round(2)
            
            return motivos.sort_values('total_facturado', ascending=False).to_dict('index')
        
        return {}
    
    def analizar_geografico(self):
        """Analiza distribución geográfica de pacientes y costos"""
        print("Analizando distribución geográfica...")
        
        df = self.df_resumen
        
        # Análisis por alcaldía/municipio
        geografico = {}
        
        if 'alcaldia_municipio' in df.columns:
            df_geo = df.dropna(subset=['alcaldia_municipio'])
            
            alcaldias = df_geo.groupby('alcaldia_municipio').agg({
                'gasto_nivel_6': ['sum', 'mean', 'count']
            }).round(2)
            
            alcaldias.columns = ['total_facturado', 'costo_promedio', 'total_pacientes']
            alcaldias['porcentaje_pacientes'] = (alcaldias['total_pacientes'] / alcaldias['total_pacientes'].sum() * 100).round(2)
            
            geografico['alcaldias'] = alcaldias.sort_values('total_pacientes', ascending=False).head(20).to_dict('index')
        
        # Análisis por estado
        if 'estado' in df.columns:
            df_estado = df.dropna(subset=['estado'])
            
            estados = df_estado.groupby('estado').agg({
                'gasto_nivel_6': ['sum', 'mean', 'count']
            }).round(2)
            
            estados.columns = ['total_facturado', 'costo_promedio', 'total_pacientes']
            estados['porcentaje_pacientes'] = (estados['total_pacientes'] / estados['total_pacientes'].sum() * 100).round(2)
            
            geografico['estados'] = estados.sort_values('total_pacientes', ascending=False).to_dict('index')
        
        return geografico
    
    def analizar_tendencias_temporales(self):
        """Analiza tendencias temporales"""
        print("Analizando tendencias temporales...")
        
        df = self.df_resumen
        
        if 'fecha_egreso_general' in df.columns:
            df_temporal = df.dropna(subset=['fecha_egreso_general'])
            df_temporal['mes'] = df_temporal['fecha_egreso_general'].dt.to_period('M')
            
            tendencias_mes = df_temporal.groupby('mes').agg({
                'gasto_nivel_6': ['sum', 'mean', 'count'],
                'dias_estancia_calculado': 'mean' if 'dias_estancia_calculado' in df.columns else 'dias_hopit'
            }).round(2)
            
            tendencias_mes.columns = ['total_facturado', 'costo_promedio', 'total_pacientes', 'estancia_promedio']
            
            # Convertir índice de período a string para JSON
            tendencias_mes.index = tendencias_mes.index.astype(str)
            
            return tendencias_mes.to_dict('index')
        
        return {}
    
    def entrenar_modelos_ml(self):
        """Entrena modelos de Machine Learning si están disponibles"""
        global MODELOS_SIMPLES_DISPONIBLES
        
        if MODELOS_ML_DISPONIBLES:
            print("=== ENTRENANDO MODELOS DE MACHINE LEARNING AVANZADOS ===")
            
            try:
                # Preparar datos para modelos
                df_servicios = self.analizar_por_servicio()
                
                # Entrenar modelos completos
                resultados_ml = entrenar_modelos_completos(
                    self.df_resumen, 
                    self.df_detalle if self.df_detalle is not None else self.df_resumen,
                    df_servicios
                )
                
                if resultados_ml:
                    self.modelos_ml = resultados_ml['modelos']
                    print("✓ Modelos de Machine Learning avanzados entrenados exitosamente")
                    return {
                        'clustering_ml': resultados_ml['clustering'],
                        'alertas_ml': resultados_ml['alertas_ml'],
                        'resumen_modelos': resultados_ml['resumen'],
                        'predicciones_demanda': self.modelos_ml.predecir_demanda(30) if self.modelos_ml.modelo_demanda else [],
                        'metricas_modelos': self.modelos_ml.metricas_modelo,
                        'disponible': True,
                        'tipo': 'ML_Avanzado'
                    }
                else:
                    print("⚠ Error en entrenamiento de modelos ML avanzados")
                    return self._entrenar_modelos_fallback()
                    
            except Exception as e:
                print(f"⚠ Error entrenando modelos ML avanzados: {e}")
                return self._entrenar_modelos_fallback()
        
        elif 'MODELOS_SIMPLES_DISPONIBLES' in globals() and MODELOS_SIMPLES_DISPONIBLES:
            return self._entrenar_modelos_fallback()
        else:
            print("⚠ No hay modelos disponibles, saltando entrenamiento")
            return {
                'disponible': False,
                'nota': 'Modelos ML no disponibles o error en entrenamiento'
            }
    
    def _entrenar_modelos_fallback(self):
        """Entrena modelos simples como fallback"""
        global MODELOS_SIMPLES_DISPONIBLES
        if 'MODELOS_SIMPLES_DISPONIBLES' not in globals() or not MODELOS_SIMPLES_DISPONIBLES:
            return {
                'disponible': False,
                'nota': 'Modelos simples no disponibles'
            }
        
        print("=== ENTRENANDO MODELOS ESTADÍSTICOS SIMPLES ===")
        
        try:
            # Preparar datos para modelos
            df_servicios = self.analizar_por_servicio()
            
            # Entrenar modelos simples
            resultados_simples = entrenar_modelos_simples(
                self.df_resumen, 
                self.df_detalle if self.df_detalle is not None else self.df_resumen,
                df_servicios
            )
            
            if resultados_simples:
                self.modelos_ml = resultados_simples['modelos']
                print("✓ Modelos estadísticos simples entrenados exitosamente")
                return {
                    'clustering_ml': resultados_simples['clustering'],
                    'alertas_ml': resultados_simples['alertas_ml'],
                    'resumen_modelos': resultados_simples['resumen'],
                    'predicciones_demanda': resultados_simples['predicciones_demanda'],
                    'predicciones_costos': resultados_simples['predicciones_costos'],
                    'metricas_modelos': resultados_simples['modelos'].metricas_modelo,
                    'disponible': True,
                    'tipo': 'Estadistico_Simple'
                }
            else:
                print("⚠ Error en entrenamiento de modelos simples")
                return {
                    'disponible': False,
                    'nota': 'Error en entrenamiento de modelos simples'
                }
                
        except Exception as e:
            print(f"⚠ Error entrenando modelos simples: {e}")
            return {
                'disponible': False,
                'nota': f'Error en modelos simples: {e}'
            }
    
    def generar_alertas(self):
        """Genera alertas basadas en los datos"""
        print("Generando alertas...")
        
        alertas = []
        df = self.df_resumen
        
        # Alerta por costos altos
        if 'gasto_nivel_6' in df.columns:
            costo_promedio = df['gasto_nivel_6'].mean()
            percentil_95 = df['gasto_nivel_6'].quantile(0.95)
            casos_altos = (df['gasto_nivel_6'] > percentil_95).sum()
            
            if casos_altos > 0:
                alertas.append({
                    'titulo': 'Casos de Alto Costo Detectados',
                    'descripcion': f'{casos_altos} casos con costos superiores al percentil 95 (${percentil_95:,.2f})',
                    'severidad': 'alta',
                    'valor': casos_altos,
                    'tipo': 'financiero'
                })
        
        # Alerta por estancias prolongadas
        if 'dias_estancia_calculado' in df.columns:
            estancia_promedio = df['dias_estancia_calculado'].mean()
            estancias_largas = (df['dias_estancia_calculado'] > estancia_promedio * 2).sum()
            
            if estancias_largas > 0:
                alertas.append({
                    'titulo': 'Estancias Prolongadas',
                    'descripcion': f'{estancias_largas} casos con estancias superiores al doble del promedio',
                    'severidad': 'media',
                    'valor': estancias_largas,
                    'tipo': 'operacional'
                })
        
        # Alerta por tasa de mortalidad
        if 'motivo_alta_hosp' in df.columns:
            defunciones = (df['motivo_alta_hosp'] == 'DEFUNCIÓN').sum()
            tasa_mortalidad = defunciones / len(df) * 100
            
            if tasa_mortalidad > 5:  # Umbral del 5%
                alertas.append({
                    'titulo': 'Tasa de Mortalidad Elevada',
                    'descripcion': f'Tasa de mortalidad del {tasa_mortalidad:.2f}% ({defunciones} casos)',
                    'severidad': 'alta',
                    'valor': tasa_mortalidad,
                    'tipo': 'clinico'
                })
        
        return alertas
    
    def procesar_todo(self):
        """Ejecuta todo el procesamiento de datos incluyendo ML"""
        print("=== INICIANDO PROCESAMIENTO AVANZADO DE DATOS CON ML ===")
        
        if not self.cargar_datos():
            return False
        
        self.limpiar_datos()
        
        # Calcular métricas tradicionales
        metricas_principales = self.calcular_metricas_principales()
        analisis_servicios = self.analizar_por_servicio()
        analisis_motivos_alta = self.analizar_por_motivo_alta()
        analisis_geografico = self.analizar_geografico()
        tendencias_temporales = self.analizar_tendencias_temporales()
        alertas_tradicionales = self.generar_alertas()
        
        # Entrenar modelos de Machine Learning
        resultados_ml = self.entrenar_modelos_ml()
        
        # Combinar resultados tradicionales con ML
        self.metricas_completas = {
            'timestamp': datetime.now().isoformat(),
            'metricas_principales': metricas_principales,
            'analisis_servicios': analisis_servicios,
            'analisis_motivos_alta': analisis_motivos_alta,
            'analisis_geografico': analisis_geografico,
            'tendencias_temporales': tendencias_temporales,
            'alertas': alertas_tradicionales,
            'machine_learning': resultados_ml if resultados_ml else {
                'disponible': False,
                'nota': 'Modelos ML no disponibles o error en entrenamiento'
            },
            'metadatos': {
                'total_registros_procesados': len(self.df_resumen),
                'registros_detalle': len(self.df_detalle) if self.df_detalle is not None else 0,
                'periodo_datos': {
                    'inicio': self.df_resumen['fecha_egreso_general'].min().isoformat() if 'fecha_egreso_general' in self.df_resumen.columns and not self.df_resumen['fecha_egreso_general'].isna().all() else None,
                    'fin': self.df_resumen['fecha_egreso_general'].max().isoformat() if 'fecha_egreso_general' in self.df_resumen.columns and not self.df_resumen['fecha_egreso_general'].isna().all() else None
                },
                'calidad_datos': {
                    'completitud_costos': (self.df_resumen['gasto_nivel_6'].notna().sum() / len(self.df_resumen) * 100),
                    'completitud_demograficos': (self.df_resumen['edad'].notna().sum() / len(self.df_resumen) * 100) if 'edad' in self.df_resumen.columns else 0,
                    'completitud_geograficos': (self.df_resumen['alcaldia_municipio'].notna().sum() / len(self.df_resumen) * 100) if 'alcaldia_municipio' in self.df_resumen.columns else 0
                },
                'modelos_ml': {
                    'disponibles': MODELOS_ML_DISPONIBLES,
                    'entrenados': resultados_ml is not None,
                    'version': 'v2.0-ML' if resultados_ml else 'v1.0-estadistico'
                }
            }
        }
        
        return True
    
    def guardar_resultados(self):
        """Guarda los resultados del procesamiento"""
        print("Guardando resultados...")
        
        # Crear directorios necesarios
        os.makedirs('proyecto_final/datos/procesados', exist_ok=True)
        os.makedirs('proyecto_final/dashboard/Dashboard de Economía de la Salud/datos/procesados', exist_ok=True)
        
        # Guardar métricas completas
        with open('proyecto_final/datos/procesados/metricas_completas.json', 'w', encoding='utf-8') as f:
            json.dump(self.metricas_completas, f, indent=2, ensure_ascii=False, default=str)
        
        # Copiar al dashboard
        import shutil
        shutil.copy2(
            'proyecto_final/datos/procesados/metricas_completas.json',
            'proyecto_final/dashboard/Dashboard de Economía de la Salud/datos/procesados/'
        )
        
        # Guardar versión legacy para compatibilidad
        metricas_legacy = {
            'urgencias': {
                'metricas_principales': self.metricas_completas['metricas_principales']['financieras'],
                'distribucion_costos': [
                    {
                        'diagnostico': motivo,
                        'sum': datos['total_facturado'],
                        'count': datos['total_pacientes'],
                        'porcentaje': datos.get('porcentaje_casos', 0)
                    }
                    for motivo, datos in list(self.metricas_completas['analisis_motivos_alta'].items())[:10]
                ],
                'alertas': [a for a in self.metricas_completas['alertas'] if a['tipo'] in ['operacional', 'clinico']]
            },
            'hospitalizacion': {
                'metricas_principales': self.metricas_completas['metricas_principales']['financieras'],
                'distribucion_costos': [
                    {
                        'diagnostico': servicio,
                        'sum': datos['total_facturado'],
                        'count': datos['total_pacientes'],
                        'porcentaje': datos.get('porcentaje_ingresos', 0)
                    }
                    for servicio, datos in list(self.metricas_completas['analisis_servicios'].items())[:10]
                ],
                'alertas': [a for a in self.metricas_completas['alertas'] if a['tipo'] == 'financiero']
            }
        }
        
        with open('proyecto_final/datos/metricas.json', 'w', encoding='utf-8') as f:
            json.dump(metricas_legacy, f, indent=2, ensure_ascii=False, default=str)
        
        # Copiar legacy al dashboard
        shutil.copy2(
            'proyecto_final/datos/metricas.json',
            'proyecto_final/dashboard/Dashboard de Economía de la Salud/datos/procesados/'
        )
        
        print("✓ Resultados guardados exitosamente")
        print(f"✓ Métricas completas: proyecto_final/datos/procesados/metricas_completas.json")
        print(f"✓ Métricas legacy: proyecto_final/datos/metricas.json")
        
        # Generar reportes Excel automáticamente
        self.generar_reportes_excel()
    
    def generar_reportes_excel(self):
        """Genera reportes Excel automáticamente"""
        print("\n=== GENERANDO REPORTES EXCEL AUTOMÁTICAMENTE ===")
        
        try:
            # Importar el generador de reportes
            sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))
            from generar_reportes_excel import GeneradorReportesExcel
            
            # Crear y ejecutar el generador
            generador = GeneradorReportesExcel()
            if generador.guardar_reportes_excel():
                print("✓ Reportes Excel generados automáticamente")
                
                # Listar archivos generados
                import glob
                archivos = glob.glob('proyecto_final/reportes/*.xlsx')
                print(f"✓ {len(archivos)} archivos Excel creados en proyecto_final/reportes/")
            else:
                print("⚠ Error generando reportes Excel automáticamente")
                
        except Exception as e:
            print(f"⚠ Error en generación automática de reportes: {e}")
            print("  Los datos JSON están disponibles para generación manual")

def main():
    procesador = ProcesadorDatosHospital()
    
    if procesador.procesar_todo():
        procesador.guardar_resultados()
        print("\n=== PROCESAMIENTO COMPLETADO EXITOSAMENTE ===")
        
        # Mostrar resumen de métricas principales
        metricas = procesador.metricas_completas['metricas_principales']
        print(f"\nRESUMEN DE MÉTRICAS:")
        print(f"- Total Facturado: ${metricas['financieras']['total_facturado']:,.2f}")
        print(f"- Total Pacientes: {metricas['operacionales']['total_pacientes']:,}")
        print(f"- Costo Promedio: ${metricas['financieras']['costo_promedio']:,.2f}")
        print(f"- Estancia Promedio: {metricas['operacionales']['estancia_promedio']:.1f} días")
        print(f"- Alertas Generadas: {len(procesador.metricas_completas['alertas'])}")
        
        # Mostrar información de modelos ML
        ml_info = procesador.metricas_completas.get('machine_learning', {})
        if ml_info.get('disponible', False):
            print(f"\nMODELOS DE MACHINE LEARNING:")
            resumen = ml_info.get('resumen_modelos', {})
            modelos_disponibles = resumen.get('modelos_disponibles', {})
            print(f"- Modelo de Demanda: {'✓' if modelos_disponibles.get('demanda') else '✗'}")
            print(f"- Modelo de Costos: {'✓' if modelos_disponibles.get('costos') else '✗'}")
            print(f"- Clustering: {'✓' if modelos_disponibles.get('clustering') else '✗'}")
            
            if 'metricas_modelos' in ml_info:
                metricas_ml = ml_info['metricas_modelos']
                if 'demanda' in metricas_ml:
                    print(f"- Precisión Demanda: {metricas_ml['demanda']['precision_estimada']}")
                if 'costos' in metricas_ml:
                    print(f"- Precisión Costos: {metricas_ml['costos']['precision_estimada']}")
        else:
            print(f"\nMODELOS ML: No disponibles")
        
    else:
        print("❌ Error en el procesamiento de datos")

if __name__ == '__main__':
    main() 