const mongoose = require('mongoose');
require('dotenv').config();

export default async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    return connection;
    } catch (err) {
        console.error ('Error Connecting: ', err.message);
        process.exit(1);
    }
};


