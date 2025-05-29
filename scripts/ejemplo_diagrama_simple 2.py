#!/usr/bin/env python3
"""
Ejemplo Simple de Diagrama
Dashboard de Economía de la Salud

Este es un ejemplo básico para probar que la biblioteca 'diagrams' funciona correctamente.
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.storage import S3
from diagrams.aws.analytics import Athena
from diagrams.programming.framework import React
from diagrams.programming.language import Python
from diagrams.onprem.client import Users

def crear_diagrama_simple():
    """Crea un diagrama simple de ejemplo"""
    
    with Diagram(
        "Dashboard Economía Salud - Ejemplo Simple",
        filename="ejemplo_simple",
        show=False
    ):
        
        # Usuario
        usuario = Users("Director\nFinanciero")
        
        # Frontend
        with Cluster("Frontend"):
            dashboard = React("Dashboard\nNext.js")
        
        # Backend
        with Cluster("Backend AWS"):
            s3 = S3("Datos\nAnonimizados")
            athena = Athena("Consultas\nSQL")
        
        # Algoritmos
        with Cluster("Algoritmos ML"):
            ml_local = Python("Predicción\nLocal")
        
        # Conexiones
        usuario >> dashboard
        dashboard >> [s3, athena]
        dashboard >> ml_local
        s3 >> athena

def main():
    """Función principal"""
    print("🎨 Creando diagrama simple de ejemplo...")
    
    try:
        crear_diagrama_simple()
        print("✅ ¡Diagrama creado exitosamente!")
        print("📁 Archivo: ejemplo_simple.png")
        
    except ImportError as e:
        print(f"❌ Error: {e}")
        print("💡 Instala las dependencias:")
        print("   pip install diagrams")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔧 Asegúrate de tener Graphviz instalado:")
        print("   brew install graphviz  # macOS")

if __name__ == "__main__":
    main() 