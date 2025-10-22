'use strict';

require('./config/environment');

const express = require('express');
const cryptoRouter = require('./routes/crypto');
const telemetry = require('./telemetry/mongoTelemetry');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', cryptoRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  telemetry.recordLog('error', 'Unhandled server error', {
    message: err.message,
    stack: err.stack,
  });
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Unexpected error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  telemetry.recordLog('info', 'Server started', { port: PORT });
});
