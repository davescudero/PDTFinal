#!/usr/bin/env python3
"""
Script de demostración completa del Sistema de Dashboard Económico Hospitalario

Este script ejecuta todo el flujo completo:
1. Procesamiento avanzado de datos
2. Entrenamiento de modelos predictivos
3. Generación automática de reportes Excel
4. Resumen de resultados

Autor: Sistema de Dashboard Económico
Fecha: Mayo 2025
"""

import os
import sys
import time
from datetime import datetime

def mostrar_banner():
    """Muestra el banner del sistema"""
    print("=" * 80)
    print("🏥 SISTEMA DE DASHBOARD ECONÓMICO HOSPITALARIO")
    print("=" * 80)
    print("📊 Procesamiento Avanzado + Modelos ML + Reportes Excel")
    print("🤖 Versión: 4.0 - Sistema Completo")
    print("📅 Fecha:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("=" * 80)
    print()

def verificar_ambiente():
    """Verifica que el ambiente esté configurado correctamente"""
    print("🔍 VERIFICANDO AMBIENTE...")
    
    # Verificar archivos de datos
    archivos_requeridos = [
        'proyecto_final/datos/ejemplos/Resumen Egreso 2025.csv',
        'proyecto_final/datos/ejemplos/Egreso Detalle Ene 2025 a Abr 2025.csv'
    ]
    
    for archivo in archivos_requeridos:
        if os.path.exists(archivo):
            size_mb = os.path.getsize(archivo) / (1024*1024)
            print(f"  ✓ {archivo} ({size_mb:.1f} MB)")
        else:
            print(f"  ❌ {archivo} - NO ENCONTRADO")
            return False
    
    # Verificar directorios
    directorios = [
        'proyecto_final/datos/procesados',
        'proyecto_final/reportes',
        'proyecto_final/modelos'
    ]
    
    for directorio in directorios:
        if os.path.exists(directorio):
            print(f"  ✓ {directorio}/")
        else:
            os.makedirs(directorio, exist_ok=True)
            print(f"  📁 {directorio}/ - CREADO")
    
    print("✅ Ambiente verificado correctamente\n")
    return True

def ejecutar_procesamiento():
    """Ejecuta el procesamiento completo de datos"""
    print("🚀 INICIANDO PROCESAMIENTO COMPLETO...")
    print("-" * 50)
    
    # Cambiar al directorio correcto
    os.chdir('/Users/davidescudero/Documents/Github/ArqProd/clase')
    
    # Ejecutar el procesador
    resultado = os.system('python proyecto_final/datos/procesar_datos_avanzado.py')
    
    if resultado == 0:
        print("\n✅ PROCESAMIENTO COMPLETADO EXITOSAMENTE")
        return True
    else:
        print("\n❌ ERROR EN EL PROCESAMIENTO")
        return False

def mostrar_resumen_resultados():
    """Muestra un resumen de los resultados generados"""
    print("\n📋 RESUMEN DE RESULTADOS GENERADOS")
    print("=" * 50)
    
    # Verificar archivos JSON generados
    archivos_json = [
        'proyecto_final/datos/procesados/metricas_completas.json',
        'proyecto_final/datos/metricas.json'
    ]
    
    print("📄 ARCHIVOS JSON:")
    for archivo in archivos_json:
        if os.path.exists(archivo):
            size_kb = os.path.getsize(archivo) / 1024
            print(f"  ✓ {os.path.basename(archivo)} ({size_kb:.1f} KB)")
        else:
            print(f"  ❌ {os.path.basename(archivo)} - NO ENCONTRADO")
    
    # Verificar reportes Excel
    import glob
    reportes_excel = glob.glob('proyecto_final/reportes/*.xlsx')
    
    print(f"\n📊 REPORTES EXCEL ({len(reportes_excel)} archivos):")
    if reportes_excel:
        # Agrupar por timestamp
        reportes_recientes = [r for r in reportes_excel if '20250528' in r]
        reportes_recientes.sort()
        
        for reporte in reportes_recientes[-4:]:  # Últimos 4 reportes
            size_kb = os.path.getsize(reporte) / 1024
            nombre = os.path.basename(reporte)
            print(f"  📈 {nombre} ({size_kb:.1f} KB)")
    else:
        print("  ❌ No se encontraron reportes Excel")
    
    # Mostrar métricas principales si están disponibles
    try:
        import json
        with open('proyecto_final/datos/procesados/metricas_completas.json', 'r') as f:
            datos = json.load(f)
        
        print(f"\n💰 MÉTRICAS PRINCIPALES:")
        metricas = datos['metricas_principales']
        print(f"  💵 Total Facturado: ${metricas['financieras']['total_facturado']:,.2f}")
        print(f"  👥 Total Pacientes: {metricas['operacionales']['total_pacientes']:,}")
        print(f"  📊 Costo Promedio: ${metricas['financieras']['costo_promedio']:,.2f}")
        print(f"  🏥 Estancia Promedio: {metricas['operacionales']['estancia_promedio']:.1f} días")
        print(f"  ⚠️  Alertas Detectadas: {len(datos.get('alertas', []))}")
        
        # Información de modelos ML
        ml_info = datos.get('machine_learning', {})
        if ml_info.get('disponible', False):
            print(f"\n🤖 MODELOS PREDICTIVOS:")
            resumen = ml_info.get('resumen_modelos', {})
            print(f"  🔮 Tipo: {resumen.get('version', 'N/A')}")
            
            metricas_ml = resumen.get('metricas', {})
            if 'demanda' in metricas_ml:
                print(f"  📈 Demanda: {metricas_ml['demanda'].get('precision_estimada', 'N/A')} precisión")
            if 'costos' in metricas_ml:
                print(f"  💰 Costos: {metricas_ml['costos'].get('precision_estimada', 'N/A')} precisión")
            if 'clustering' in metricas_ml:
                print(f"  🎯 Clustering: {metricas_ml['clustering'].get('n_clusters', 'N/A')} clusters")
        
    except Exception as e:
        print(f"\n⚠️  No se pudieron cargar las métricas: {e}")

def mostrar_instrucciones_siguientes():
    """Muestra las instrucciones para los siguientes pasos"""
    print(f"\n🎯 PRÓXIMOS PASOS RECOMENDADOS")
    print("=" * 50)
    print("1. 📊 Revisar los reportes Excel generados en:")
    print("   📁 proyecto_final/reportes/")
    print()
    print("2. 🌐 Iniciar el dashboard web:")
    print("   📂 cd 'proyecto_final/dashboard/Dashboard de Economía de la Salud'")
    print("   🚀 npm run dev")
    print()
    print("3. ☁️  Diseñar arquitectura AWS:")
    print("   📐 Crear diagrama en draw.io")
    print("   🏗️  Implementar en AWS")
    print()
    print("4. 🔄 Para reprocesar datos:")
    print("   🐍 python proyecto_final/datos/procesar_datos_avanzado.py")
    print()
    print("5. 📋 Para generar solo reportes:")
    print("   📊 python proyecto_final/scripts/generar_reportes_excel.py")

def main():
    """Función principal de la demostración"""
    mostrar_banner()
    
    # Verificar ambiente
    if not verificar_ambiente():
        print("❌ Error en la verificación del ambiente. Abortando.")
        return
    
    # Preguntar al usuario si quiere continuar
    respuesta = input("¿Desea ejecutar el procesamiento completo? (s/N): ").lower().strip()
    if respuesta not in ['s', 'si', 'sí', 'y', 'yes']:
        print("🛑 Procesamiento cancelado por el usuario.")
        mostrar_instrucciones_siguientes()
        return
    
    print("\n⏱️  Iniciando procesamiento... (esto puede tomar unos minutos)")
    tiempo_inicio = time.time()
    
    # Ejecutar procesamiento
    if ejecutar_procesamiento():
        tiempo_total = time.time() - tiempo_inicio
        print(f"\n⏱️  Tiempo total de procesamiento: {tiempo_total:.1f} segundos")
        
        # Mostrar resumen
        mostrar_resumen_resultados()
        
        # Mostrar instrucciones
        mostrar_instrucciones_siguientes()
        
        print(f"\n🎉 ¡DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!")
        print("=" * 80)
        
    else:
        print("\n❌ Error durante el procesamiento. Revise los logs anteriores.")

if __name__ == '__main__':
    main() 