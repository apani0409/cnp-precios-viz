# Precios Agrícolas CNP — Costa Rica

Visualización interactiva de 4 años de precios agrícolas semanales publicados por el
Consejo Nacional de Producción (CNP) de Costa Rica: **9,184 registros, 56 productos,
2021–2024**.

**Demo en vivo:** https://cnp-precios-viz.vercel.app

## Qué hace

- Serie temporal interactiva por producto, con selector múltiple y filtro de rango de fechas
- Tabla de estadísticas por producto (media, mediana, mínimo, máximo, desviación estándar)
- Descarga del subconjunto de datos filtrado como CSV
- Renderizado 100% en el cliente — sin backend, sin base de datos

## Stack

React 19 + TypeScript + Vite · Plotly.js para las gráficas · PapaParse para el parseo del CSV.

## Datos

Los datos provienen del histórico de boletines de precios del CNP, recopilados originalmente
para el proyecto deferia.cr (UCR × FAO). El CSV crudo vive en `public/raw_prices.csv`.

## Desarrollo local

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```
