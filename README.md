# OpenTelemetry Coinlore API

Este proyecto expone un backend en Node.js que consulta la API pública de Coinlore para recuperar información de criptomonedas e instrumenta el servicio con OpenTelemetry. Las trazas, métricas y logs se almacenan en MongoDB mediante un exportador personalizado.

## Requisitos

- Node.js 18 o superior (Node.js 20 recomendado)
- npm
- Instancia de MongoDB accesible para la aplicación

## Variables de entorno

La conexión con MongoDB y la configuración del servicio se realiza mediante variables de entorno:

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `PORT` | Puerto HTTP que expone la API | `3000` |
| `MONGODB_URI` | Cadena de conexión de MongoDB | _(requerido para almacenar telemetría)_ |
| `MONGODB_DB_NAME` | Base de datos donde se guardará la telemetría | `telemetry` |
| `MONGODB_TRACES_COLLECTION` | Colección para spans de OpenTelemetry | `otel_traces` |
| `MONGODB_LOGS_COLLECTION` | Colección para logs de aplicación | `otel_logs` |
| `MONGODB_METRICS_COLLECTION` | Colección para métricas personalizadas | `otel_metrics` |
| `OTEL_SERVICE_NAME` | Nombre del servicio para OpenTelemetry | `coinlore-api-service` |
| `OTEL_SERVICE_NAMESPACE` | Namespace del servicio | `crypto-data` |

> Puedes definir estas variables en un archivo `.env` en la raíz del proyecto para que sean consumidas tanto por Docker como por el devcontainer.

## Uso en desarrollo local

Instala las dependencias y ejecuta el servidor:

```bash
npm install
npm start
```

El servicio se expone en `http://localhost:3000`.

## Devcontainer para VS Code

El directorio `.devcontainer/` contiene la configuración necesaria para abrir el proyecto directamente en un contenedor de desarrollo en VS Code:

1. Asegúrate de tener Docker y la extensión **Dev Containers** instalados.
2. Crea un archivo `.env` con las variables de entorno anteriores.
3. Abre la carpeta en VS Code y selecciona _Reopen in Container_.
4. El contenedor instalará automáticamente las dependencias mediante `npm install`.

## Ejecución con Docker

Construye la imagen y levanta el servicio con Docker Compose:

```bash
docker compose up --build
```

El servicio expondrá el puerto `3000` (puede personalizarse con la variable `PORT`). Asegúrate de que `MONGODB_URI` apunte a la instancia de MongoDB accesible desde el contenedor.

Para ejecutar únicamente la imagen:

```bash
docker build -t opentelemetry-node-service .
docker run --rm -p 3000:3000 \
  -e MONGODB_URI="mongodb://usuario:password@host:27017" \
  -e MONGODB_DB_NAME=telemetry \
  opentelemetry-node-service
```

## Endpoints

- `GET /health`: Verificación básica del servicio.
- `GET /api/cryptocurrencies`: Recupera las criptomonedas más populares desde Coinlore. Acepta el parámetro opcional `limit` para indicar la cantidad de resultados.

## Observabilidad

- `src/tracing.js` inicializa el SDK de OpenTelemetry y, si se configura MongoDB, utiliza un `MongoSpanExporter` para persistir los spans.
- `src/telemetry/mongoTelemetry.js` ofrece funciones auxiliares para almacenar logs y métricas personalizadas en MongoDB.
- Las rutas principales registran eventos en MongoDB, lo que permite consultar posteriormente los registros y métricas generados por la API.
