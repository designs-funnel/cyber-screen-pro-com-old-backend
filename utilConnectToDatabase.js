const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Connection URL
const url = process.env.MONGO_URL;

// Function to connect to MongoDB and return the client
const connectToDatabase = async () => {
  const client = new MongoClient(url);

  await client.connect();
  console.log('✅ Connected to MongoDB');
  return client;
};

module.exports = connectToDatabase;
