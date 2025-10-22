'use strict';

const dotenv = require('dotenv');

const result = dotenv.config();

if (result.error && result.error.code !== 'ENOENT') {
  console.warn('Could not load environment variables from .env file:', result.error);
}
