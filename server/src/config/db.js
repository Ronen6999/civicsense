import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (env.mongodbDnsServer) {
    dns.setServers([env.mongodbDnsServer]);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
