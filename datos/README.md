# Datos del Proyecto

Esta carpeta contiene los scripts SQL, datos de muestra y archivos relacionados con la extracción y procesamiento de datos para el HealthEconomics Dashboard.

## Estructura de Carpetas

```
datos/
├── Egresos_Detalle_Completo.sql  # Query principal para extracción de datos
├── ejemplos/                     # Datos de muestra para desarrollo y pruebas
│   └── [pendiente] datos_enero_2025.csv  # Ejemplo de datos extraídos
└── README.md                     # Este archivo
```

## Descripción de los Archivos

### Query Principal (Egresos_Detalle_Completo.sql)

Este archivo contiene el query SQL optimizado que extrae la información financiera del expediente clínico electrónico. El query:

- Combina datos de pacientes de urgencias y hospitalización
- Extrae información de laboratorios y servicios prestados
- Calcula costos por nivel socioeconómico
- Filtra por periodos específicos (actualmente enero 2025)

Este es el query que actualmente se ejecuta manualmente y que será automatizado mediante AWS Lambda.

### Carpeta de Ejemplos

La carpeta `ejemplos` contiene datasets de muestra extraídos de la base de datos para utilizarse durante el desarrollo y pruebas. Estos datos son útiles para:

- Diseñar y probar visualizaciones sin necesidad de acceder a la base de datos real
- Desarrollar modelos predictivos offline
- Validar la funcionalidad de exportación
- Realizar demostraciones del sistema

**Nota importante**: Todos los datos en esta carpeta están anonimizados y no contienen información sensible de pacientes.

## Consideraciones de Uso

- El query actual está configurado para un mes específico (enero 2025). Para la implementación final, se parametrizará para permitir consultas dinámicas por rango de fechas.
- Siempre que se modifique el query, se debe validar que los resultados coincidan con los esperados por el Departamento de Economía de la Salud.
- La estructura de los datos extraídos debe mantener coherencia para garantizar compatibilidad con las visualizaciones y modelos predictivos. 