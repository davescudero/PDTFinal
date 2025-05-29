#!/usr/bin/env python3
"""
Generador de Diagrama de Arquitectura
Dashboard de Economía de la Salud con AWS Híbrido

Este script genera un diagrama visual de la arquitectura del sistema
usando la biblioteca 'diagrams' de Python.

Autor: David Escudero
Fecha: Mayo 2025
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.analytics import Athena
from diagrams.aws.storage import S3
from diagrams.aws.ml import Sagemaker, Comprehend
from diagrams.aws.security import IAM
from diagrams.onprem.client import Users, Client
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis
from diagrams.programming.framework import React
from diagrams.programming.language import Python, TypeScript, Nodejs
from diagrams.generic.database import SQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.generic.network import Switch

def generar_diagrama_principal():
    """Genera el diagrama principal de arquitectura"""
    
    # Configuración del diagrama
    graph_attr = {
        "fontsize": "16",
        "fontcolor": "#2D3748",
        "bgcolor": "#F7FAFC",
        "rankdir": "TB",  # Top to Bottom
        "margin": "0.5",
        "splines": "ortho"
    }
    
    node_attr = {
        "fontsize": "12",
        "fontcolor": "#2D3748"
    }
    
    edge_attr = {
        "color": "#4A5568",
        "fontsize": "10"
    }
    
    with Diagram(
        "Dashboard Economía de la Salud - Arquitectura Híbrida AWS-Local",
        filename="arquitectura_dashboard_salud",
        direction="TB",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
        show=False
    ):
        
        # =====================================================
        # CAPA DE USUARIOS
        # =====================================================
        with Cluster("👥 USUARIOS", graph_attr={"bgcolor": "#EDF2F7", "fontsize": "14"}):
            usuarios = [
                Users("Directores\nFinancieros"),
                Users("Analistas\nDatos"),
                Users("Administradores\nTI")
            ]
        
        # =====================================================
        # CAPA FRONTEND
        # =====================================================
        with Cluster("🖥️ FRONTEND LAYER - Next.js 15 + TypeScript", 
                    graph_attr={"bgcolor": "#E3F2FD", "fontsize": "14"}):
            
            with Cluster("📊 Páginas del Dashboard"):
                dashboard_main = React("Dashboard\nPrincipal")
                aws_hybrid = React("AWS Hybrid\n⭐")
                predictive = React("Análisis\nPredictivo")
                trends = React("Tendencias")
                reports = React("Reportes")
                
                frontend_pages = [dashboard_main, aws_hybrid, predictive, trends, reports]
            
            with Cluster("🎨 UI/UX Components"):
                tailwind = TypeScript("Tailwind CSS")
                shadcn = TypeScript("Shadcn/ui")
                recharts = TypeScript("Recharts")
        
        # =====================================================
        # CAPA API
        # =====================================================
        with Cluster("🔌 API LAYER - Next.js API Routes", 
                    graph_attr={"bgcolor": "#F3E5F5", "fontsize": "14"}):
            
            api_s3 = Nodejs("/api/aws/s3/upload")
            api_athena = Nodejs("/api/aws/athena/query")
            api_sentiment = Nodejs("/api/aws/sentiment")
            api_predictive = Nodejs("/api/predictive")
            api_metrics = Nodejs("/api/metrics")
            api_areas = Nodejs("/api/areas")
            
            apis = [api_s3, api_athena, api_sentiment, api_predictive, api_metrics, api_areas]
        
        # =====================================================
        # CAPA DE SERVICIOS HÍBRIDOS
        # =====================================================
        with Cluster("☁️ HYBRID SERVICE LAYER", 
                    graph_attr={"bgcolor": "#E8F5E8", "fontsize": "14"}):
            
            # Servicios AWS Reales
            with Cluster("AWS SERVICES (Real)", graph_attr={"bgcolor": "#FFE0B2"}):
                s3_real = S3("S3 Bucket\n✅ Real")
                athena_real = Athena("Athena\n✅ Real")
                iam_service = IAM("IAM User\n✅ Configurado")
            
            # Servicios AWS Preparados
            with Cluster("AWS SERVICES (Preparado)", graph_attr={"bgcolor": "#FFECB3"}):
                comprehend_prep = Comprehend("Comprehend\n🔄 Preparado")
                sagemaker_prep = Sagemaker("SageMaker\n🔄 Preparado")
            
            # Lógica de Fallback
            with Cluster("FALLBACK LOGIC", graph_attr={"bgcolor": "#E1F5FE"}):
                circuit_breaker = Server("Circuit\nBreaker")
                error_handler = Server("Error\nHandler")
                retry_logic = Server("Retry\nLogic")
                health_monitor = Server("Health\nMonitor")
            
            # Algoritmos Locales
            with Cluster("LOCAL ALGORITHMS", graph_attr={"bgcolor": "#E8F5E8"}):
                ml_models = Python("ML Models\nPredictivos")
                sentiment_local = Python("Sentiment\nLocal")
                clustering = Python("Clustering\nServicios")
                anomaly_detection = Python("Detección\nAnomalías")
        
        # =====================================================
        # CAPA DE DATOS
        # =====================================================
        with Cluster("💾 DATA LAYER", 
                    graph_attr={"bgcolor": "#FFF3E0", "fontsize": "14"}):
            
            with Cluster("📁 Datos Locales"):
                csv_files = Storage("CSV Files\n($265M+ procesados)")
                json_processed = Storage("Processed JSON\n(Métricas)")
                cache_local = Redis("Cache Local\n(Rendimiento)")
            
            with Cluster("☁️ Datos AWS"):
                s3_anonymized = S3("S3 Anonymized\n(HIPAA/GDPR)")
                athena_db = SQL("Base de Datos\n'econ'")
            
            with Cluster("🔒 Datos Anonimizados"):
                anonimizacion = Storage("Pipeline\nAnonimización")
        
        # =====================================================
        # CONEXIONES PRINCIPALES
        # =====================================================
        
        # Usuarios -> Frontend
        for usuario in usuarios:
            usuario >> Edge(label="HTTPS", style="solid", color="#2196F3") >> dashboard_main
        
        # Frontend -> APIs
        dashboard_main >> Edge(label="REST API", color="#4CAF50") >> api_metrics
        aws_hybrid >> Edge(label="AWS APIs", color="#FF9800") >> [api_s3, api_athena, api_sentiment]
        predictive >> Edge(label="ML APIs", color="#9C27B0") >> api_predictive
        trends >> Edge(label="Analytics", color="#607D8B") >> api_areas
        reports >> Edge(label="Export", color="#795548") >> api_metrics
        
        # APIs -> Servicios AWS Reales
        api_s3 >> Edge(label="Upload\nAnonimizado", color="#FF6B35") >> s3_real
        api_athena >> Edge(label="SQL Query", color="#FF6B35") >> athena_real
        
        # APIs -> Fallback Logic
        api_s3 >> Edge(label="Fallback", style="dashed", color="#F44336") >> circuit_breaker
        api_sentiment >> Edge(label="Fallback", style="dashed", color="#F44336") >> error_handler
        
        # Fallback -> Algoritmos Locales
        circuit_breaker >> Edge(label="Local ML", color="#4CAF50") >> ml_models
        error_handler >> Edge(label="Local Sentiment", color="#4CAF50") >> sentiment_local
        retry_logic >> Edge(label="Local Analytics", color="#4CAF50") >> clustering
        
        # Servicios -> Datos
        s3_real >> Edge(label="Store", color="#FF9800") >> s3_anonymized
        athena_real >> Edge(label="Query", color="#FF9800") >> athena_db
        ml_models >> Edge(label="Process", color="#4CAF50") >> csv_files
        sentiment_local >> Edge(label="Analyze", color="#4CAF50") >> json_processed
        
        # Anonimización
        csv_files >> Edge(label="HIPAA/GDPR\nCompliant", color="#E91E63") >> anonimizacion
        anonimizacion >> Edge(label="Safe Data", color="#E91E63") >> s3_anonymized

def generar_diagrama_flujo_datos():
    """Genera un diagrama específico del flujo de datos"""
    
    with Diagram(
        "Flujo de Datos - Anonimización y Procesamiento",
        filename="flujo_datos_anonimizacion",
        direction="LR",
        show=False
    ):
        
        # Datos originales
        with Cluster("📊 Datos Originales", graph_attr={"bgcolor": "#FFEBEE"}):
            datos_sensibles = Storage("Datos Médicos\nSensibles")
            pacientes_info = Storage("Info Personal\nPacientes")
        
        # Pipeline de anonimización
        with Cluster("🔒 Pipeline Anonimización", graph_attr={"bgcolor": "#E8F5E8"}):
            eliminacion = Python("Eliminación\nIdentificadores")
            hash_ids = Python("Hash SHA-256\nIDs Únicos")
            generalizacion = Python("Generalización\nEdades/Ubicación")
            validacion = Python("Validación\nK-Anonymity")
        
        # Datos anonimizados
        with Cluster("✅ Datos Seguros", graph_attr={"bgcolor": "#E3F2FD"}):
            datos_anonimos = Storage("Datos\nAnonimizados")
            metricas_agregadas = Storage("Métricas\nAgregadas")
        
        # AWS Storage
        with Cluster("☁️ AWS Storage", graph_attr={"bgcolor": "#FFF3E0"}):
            s3_bucket = S3("S3 Bucket\nSecure")
            athena_tables = Athena("Athena\nTables")
        
        # Flujo de datos
        [datos_sensibles, pacientes_info] >> eliminacion
        eliminacion >> hash_ids >> generalizacion >> validacion
        validacion >> [datos_anonimos, metricas_agregadas]
        datos_anonimos >> s3_bucket
        metricas_agregadas >> athena_tables

def generar_diagrama_ml_models():
    """Genera un diagrama de los modelos ML implementados"""
    
    with Diagram(
        "Modelos ML y Algoritmos Predictivos",
        filename="modelos_ml_predictivos",
        direction="TB",
        show=False
    ):
        
        # Datos de entrada
        with Cluster("📥 Datos de Entrada"):
            datos_historicos = Storage("Datos Históricos\n1,678 pacientes")
            transacciones = Storage("Transacciones\n555,233 registros")
        
        # Modelos implementados
        with Cluster("🧠 Modelos Predictivos", graph_attr={"bgcolor": "#E8F5E8"}):
            
            with Cluster("📈 Predicción Demanda", graph_attr={"bgcolor": "#E3F2FD"}):
                regresion_lineal = Python("Regresión Lineal\n+ Ajustes Estacionales")
                factores_temporales = Python("Factores\nTemporales")
                precision_demanda = Storage("Precisión: 60%")
            
            with Cluster("💰 Predicción Costos", graph_attr={"bgcolor": "#F3E5F5"}):
                analisis_tendencias = Python("Análisis\nTendencias")
                factores_estacionales = Python("Factores\nEstacionales")
                precision_costos = Storage("Precisión: 75-85%")
            
            with Cluster("🎯 Clustering Servicios", graph_attr={"bgcolor": "#FFF3E0"}):
                percentiles = Python("Segmentación\nPercentiles")
                clusters_resultado = Storage("5 Clusters\nIdentificados")
            
            with Cluster("🚨 Detección Anomalías", graph_attr={"bgcolor": "#FFEBEE"}):
                umbrales = Python("Umbrales\nContextuales")
                casos_detectados = Storage("263 Casos\nCríticos")
        
        # Resultados
        with Cluster("📊 Resultados y Alertas"):
            predicciones = Storage("Predicciones\nFuturas")
            alertas = Storage("Alertas\nAutomáticas")
            reportes = Storage("Reportes\nML")
        
        # Conexiones
        [datos_historicos, transacciones] >> regresion_lineal
        regresion_lineal >> factores_temporales >> precision_demanda
        
        [datos_historicos, transacciones] >> analisis_tendencias
        analisis_tendencias >> factores_estacionales >> precision_costos
        
        [datos_historicos, transacciones] >> percentiles >> clusters_resultado
        [datos_historicos, transacciones] >> umbrales >> casos_detectados
        
        [precision_demanda, precision_costos, clusters_resultado, casos_detectados] >> predicciones
        predicciones >> [alertas, reportes]

def generar_diagrama_aws_services():
    """Genera un diagrama específico de los servicios AWS"""
    
    with Diagram(
        "Servicios AWS - Real vs Preparado",
        filename="servicios_aws_hibrido",
        direction="TB",
        show=False
    ):
        
        # Configuración AWS
        with Cluster("⚙️ AWS Configuration", graph_attr={"bgcolor": "#FFF3E0"}):
            aws_account = IAM("AWS Account\nConfigurado")
            aws_region = Server("Region:\nus-east-1")
            aws_credentials = IAM("IAM User\nConfigurado")
        
        # Servicios Activos
        with Cluster("✅ Servicios AWS ACTIVOS", graph_attr={"bgcolor": "#E8F5E8"}):
            s3_activo = S3("S3 Bucket\nData Analytics\n✅ VERIFICADO")
            athena_activo = Athena("Athena Database\n'healthcare_econ'\n✅ VERIFICADO")
            iam_activo = IAM("IAM Permissions\n✅ CONFIGURADO")
        
        # Servicios Preparados
        with Cluster("🔄 Servicios AWS PREPARADOS", graph_attr={"bgcolor": "#E3F2FD"}):
            comprehend_prep = Comprehend("Comprehend\nAnálisis Sentimiento\n🔄 PREPARADO")
            sagemaker_prep = Sagemaker("SageMaker\nEndpoints ML\n🔄 PREPARADO")
        
        # Fallback Local
        with Cluster("🏠 Algoritmos LOCALES", graph_attr={"bgcolor": "#F3E5F5"}):
            sentiment_fallback = Python("Sentiment Local\nDiccionario Español")
            ml_fallback = Python("ML Local\nModelos Estadísticos")
        
        # Datos procesados
        with Cluster("📊 Datos Procesados", graph_attr={"bgcolor": "#FFEBEE"}):
            datos_reales = Storage("$265M+ MXN\nProcesados")
            metricas = Storage("1,515% ROI\nDemostrado")
        
        # Conexiones
        aws_account >> s3_activo
        aws_region >> athena_activo
        aws_credentials >> iam_activo
        
        # Servicios activos procesan datos reales
        s3_activo >> datos_reales
        athena_activo >> datos_reales
        datos_reales >> metricas
        
        # Fallback connections (líneas punteadas)
        comprehend_prep >> Edge(style="dashed", color="#F44336", label="fallback") >> sentiment_fallback
        sagemaker_prep >> Edge(style="dashed", color="#F44336", label="fallback") >> ml_fallback
        
        # Local también procesa datos
        sentiment_fallback >> datos_reales
        ml_fallback >> datos_reales

def main():
    """Función principal que genera todos los diagramas"""
    print("🎨 Generando diagramas de arquitectura...")
    print("=" * 60)
    
    try:
        print("📐 1. Generando diagrama principal de arquitectura...")
        generar_diagrama_principal()
        print("   ✅ Completado: arquitectura_dashboard_salud.png")
        
        print("📊 2. Generando diagrama de flujo de datos...")
        generar_diagrama_flujo_datos()
        print("   ✅ Completado: flujo_datos_anonimizacion.png")
        
        print("🧠 3. Generando diagrama de modelos ML...")
        generar_diagrama_ml_models()
        print("   ✅ Completado: modelos_ml_predictivos.png")
        
        print("☁️ 4. Generando diagrama de servicios AWS...")
        generar_diagrama_aws_services()
        print("   ✅ Completado: servicios_aws_hibrido.png")
        
        print("\n🎉 ¡Todos los diagramas generados exitosamente!")
        print("📁 Los archivos se encuentran en el directorio actual")
        print("\n📊 Diagramas generados:")
        print("   • arquitectura_dashboard_salud.png - Arquitectura completa")
        print("   • flujo_datos_anonimizacion.png - Flujo de anonimización")
        print("   • modelos_ml_predictivos.png - Modelos de ML")
        print("   • servicios_aws_hibrido.png - Servicios AWS híbridos")
        
    except ImportError as e:
        print(f"❌ Error: {e}")
        print("\n💡 Para instalar las dependencias necesarias:")
        print("   pip install diagrams")
        print("   # O si estás usando conda:")
        print("   conda install -c conda-forge diagrams")
        
    except Exception as e:
        print(f"❌ Error generando diagramas: {e}")
        print("🔧 Verifica que tienes instalado Graphviz:")
        print("   # En macOS:")
        print("   brew install graphviz")
        print("   # En Ubuntu:")
        print("   sudo apt-get install graphviz")

if __name__ == "__main__":
    main() 