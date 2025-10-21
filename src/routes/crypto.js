'use strict';

const express = require('express');
const { getCryptocurrencies } = require('../services/coinloreClient');
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const router = express.Router();
const tracer = trace.getTracer('coinlore-api-tracer');

router.get('/cryptocurrencies', async (req, res, next) => {
  const span = tracer.startSpan('fetch-cryptocurrencies');
  try {
    const { limit: limitQuery } = req.query;
    let limit;
    if (limitQuery !== undefined) {
      limit = Number.parseInt(limitQuery, 10);
      if (Number.isNaN(limit) || limit <= 0) {
        const error = new Error('The "limit" query parameter must be a positive integer');
        error.status = 400;
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      }
    }

    const cryptocurrencies = await getCryptocurrencies(limit, span);
    res.json({ data: cryptocurrencies });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    next(error);
  } finally {
    span.end();
  }
});

module.exports = router;
