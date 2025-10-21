'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: 'coinlore-api-service',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'crypto-data',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

(async () => {
  try {
    await sdk.start();
    console.log('OpenTelemetry tracing initialized');
  } catch (error) {
    console.error('Error initializing OpenTelemetry SDK', error);
  }
})();

process.on('SIGTERM', async () => {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down gracefully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK', error);
  } finally {
    process.exit(0);
  }
});
