'use strict';

const { hrTimeToMilliseconds, ExportResultCode } = require('@opentelemetry/core');
const { SpanKind } = require('@opentelemetry/api');
const { getDb, closeMongoConnection } = require('./mongoConnection');

const SPAN_KIND_LABELS = {
  [SpanKind.INTERNAL]: 'INTERNAL',
  [SpanKind.SERVER]: 'SERVER',
  [SpanKind.CLIENT]: 'CLIENT',
  [SpanKind.PRODUCER]: 'PRODUCER',
  [SpanKind.CONSUMER]: 'CONSUMER',
};

function toMillis(hrTime) {
  return hrTimeToMilliseconds(hrTime);
}

function serializeSpan(span) {
  return {
    traceId: span.spanContext().traceId,
    spanId: span.spanContext().spanId,
    parentSpanId: span.parentSpanId || null,
    name: span.name,
    kind: SPAN_KIND_LABELS[span.kind] || 'INTERNAL',
    status: span.status,
    startTime: new Date(toMillis(span.startTime)),
    durationMs: toMillis(span.duration),
    attributes: span.attributes,
    events: span.events?.map((event) => ({
      name: event.name,
      time: new Date(toMillis(event.time)),
      attributes: event.attributes,
    })) || [],
    links: span.links?.map((link) => ({
      traceId: link.context.traceId,
      spanId: link.context.spanId,
      attributes: link.attributes,
    })) || [],
    resource: span.resource?.attributes || {},
    instrumentationLibrary: span.instrumentationLibrary,
  };
}

class MongoSpanExporter {
  constructor(options = {}) {
    this._collectionName = options.collectionName || process.env.MONGODB_TRACES_COLLECTION || 'otel_traces';
  }

  async export(spans, resultCallback) {
    if (!process.env.MONGODB_URI) {
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    try {
      const db = await getDb();
      if (!spans.length) {
        resultCallback({ code: ExportResultCode.SUCCESS });
        return;
      }

      const documents = spans.map(serializeSpan);
      await db.collection(this._collectionName).insertMany(documents, { ordered: false });
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Failed to export spans to MongoDB', error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  async shutdown() {
    await closeMongoConnection();
  }
}

module.exports = { MongoSpanExporter };
