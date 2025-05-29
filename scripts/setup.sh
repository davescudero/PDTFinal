#!/bin/bash

# Instalar dependencias de Python
pip install -r scripts/requirements.txt

# Instalar dependencias de Node.js
cd "Dashboard de Economía de la Salud"
npm install

# Instalar tipos de TypeScript
npm install --save-dev @types/node @types/react @types/react-dom

# Instalar dependencias adicionales
npm install recharts lucide-react @radix-ui/react-tabs @radix-ui/react-tooltip 