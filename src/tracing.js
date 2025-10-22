'use strict';

require('./config/environment');

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { ensureMongoConnection, closeMongoConnection } = require('./telemetry/mongoConnection');
const { MongoSpanExporter } = require('./telemetry/mongoSpanExporter');

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'coinlore-api-service',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: process.env.OTEL_SERVICE_NAMESPACE || 'crypto-data',
});

let sdk;

async function buildTraceExporter() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set. Using console span exporter');
    return new ConsoleSpanExporter();
  }

  try {
    await ensureMongoConnection();
    console.log('MongoDB telemetry exporter enabled');
    return new MongoSpanExporter();
  } catch (error) {
    console.error('Failed to initialize MongoDB exporter, falling back to console exporter', error);
    return new ConsoleSpanExporter();
  }
}

async function initializeTelemetry() {
  try {
    const traceExporter = await buildTraceExporter();
    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
      ],
    });

    await sdk.start();
    console.log('OpenTelemetry tracing initialized');
  } catch (error) {
    console.error('Error initializing OpenTelemetry SDK', error);
  }
}

async function shutdownTelemetry() {
  try {
    if (sdk) {
      await sdk.shutdown();
    }
    await closeMongoConnection();
    console.log('OpenTelemetry SDK shut down gracefully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK', error);
  } finally {
    process.exit(0);
  }
}

initializeTelemetry();

process.on('SIGTERM', shutdownTelemetry);
process.on('SIGINT', shutdownTelemetry);
