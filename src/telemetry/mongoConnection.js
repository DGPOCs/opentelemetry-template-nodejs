'use strict';

require('../config/environment');

const { MongoClient } = require('mongodb');

let client;
let db;
let connectionPromise;

function getMongoOptions() {
  return {
    maxPoolSize: Number.parseInt(process.env.MONGODB_POOL_SIZE || '5', 10),
    serverSelectionTimeoutMS: Number.parseInt(process.env.MONGODB_TIMEOUT_MS || '5000', 10),
  };
}

async function connectToMongo() {
  if (db) {
    return db;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    const dbName = process.env.MONGODB_DB_NAME || 'telemetry';
    const mongoClient = new MongoClient(uri, getMongoOptions());

    connectionPromise = mongoClient.connect()
      .then(() => {
        client = mongoClient;
        db = client.db(dbName);
        return db;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

async function getDb() {
  if (db) {
    return db;
  }

  return connectToMongo();
}

async function ensureMongoConnection() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  return connectToMongo();
}

async function closeMongoConnection() {
  if (client) {
    await client.close();
  }

  client = undefined;
  db = undefined;
  connectionPromise = undefined;
}

module.exports = {
  getDb,
  ensureMongoConnection,
  closeMongoConnection,
};
