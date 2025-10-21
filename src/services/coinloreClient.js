'use strict';

const axios = require('axios');
const https = require('https');
const { context, trace, SpanStatusCode } = require('@opentelemetry/api');

const COINLORE_API_URL = 'https://api.coinlore.net/api/tickers/';
const httpsAgent = new https.Agent({ keepAlive: true });

async function getCryptocurrencies(limit, parentSpan) {
  const activeContext = parentSpan
    ? trace.setSpan(context.active(), parentSpan)
    : context.active();

  return context.with(activeContext, async () => {
    const span = trace.getTracer('coinlore-api-tracer').startSpan('coinlore-request');
    try {
      const response = await axios.get(COINLORE_API_URL, {
        params: limit ? { start: 0, limit } : undefined,
        timeout: 5000,
        httpsAgent,
        proxy: false,
      });

      span.setAttribute('http.status_code', response.status);
      span.setAttribute('coinlore.limit', limit ?? null);
      span.addEvent('coinlore.response.received');

      if (!response.data || !Array.isArray(response.data.data)) {
        const error = new Error('Unexpected response from Coinlore API');
        error.status = 502;
        throw error;
      }

      return response.data.data.map((item) => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        rank: Number(item.rank),
        price_usd: Number(item.price_usd),
        percent_change_24h: Number(item.percent_change_24h),
        market_cap_usd: Number(item.market_cap_usd),
      }));
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      if (!error.status) {
        error.status = error.response?.status ?? 503;
      }
      throw error;
    } finally {
      span.end();
    }
  });
}

module.exports = {
  getCryptocurrencies,
};
