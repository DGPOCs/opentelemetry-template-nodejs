'use strict';

require('../config/environment');

const { getDb } = require('./mongoConnection');

const LOGS_COLLECTION = process.env.MONGODB_LOGS_COLLECTION || 'otel_logs';
const METRICS_COLLECTION = process.env.MONGODB_METRICS_COLLECTION || 'otel_metrics';

function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

async function recordLog(level, message, context = {}) {
  if (!isMongoConfigured()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection(LOGS_COLLECTION).insertOne({
      timestamp: new Date(),
      level,
      message,
      context,
    });
  } catch (error) {
    console.error('Failed to persist log entry to MongoDB', error);
  }
}

async function recordMetric(name, value, labels = {}) {
  if (!isMongoConfigured()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection(METRICS_COLLECTION).insertOne({
      timestamp: new Date(),
      name,
      value,
      labels,
    });
  } catch (error) {
    console.error('Failed to persist metric to MongoDB', error);
  }
}

module.exports = {
  recordLog,
  recordMetric,
};
