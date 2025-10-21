# OpenTelemetry Coinlore API

Este proyecto expone un backend en Node.js que consulta la API pública de Coinlore para recuperar información de criptomonedas e instrumenta el servicio con OpenTelemetry para obtener trazabilidad.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
npm install
```

## Ejecución

Inicia el servidor con:

```bash
npm start
```

El servicio se expone en `http://localhost:3000` por defecto y habilita trazas enviadas a la consola estándar mediante el `ConsoleSpanExporter`.

## Endpoints

- `GET /health`: Verificación básica del servicio.
- `GET /api/cryptocurrencies`: Recupera las criptomonedas más populares desde Coinlore. Acepta el parámetro opcional `limit` para indicar la cantidad de resultados.

## Observabilidad

El proyecto inicializa el SDK de OpenTelemetry al arrancar la aplicación (`src/tracing.js`). Se incluyen instrumentaciones para HTTP y Express, y se generan spans personalizados alrededor de la consulta a Coinlore.
