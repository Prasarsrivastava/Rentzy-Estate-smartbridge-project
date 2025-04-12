import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// console.log('MONGO_URI:', process.env.MONGO_URI);  // Add this
// console.log('JWT_SECRET:', process.env.JWT_SECRET);  // And this


const MONGO_URI = process.env.MONGO_URI;

// to connect the mongodb using the mongodburl if connection is sucessful then it will print the message "Connected to MongoDB!" otherwise it will print the error message
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });


// const __dirname = path.resolve(); // Removed duplicate declaration


// to create instance of express application
const app = express();

// for adding moddleware to incoming requests from the client in json format 
app.use(express.json());

app.use(cookieParser());

// to run the server on port 3000 if the server is running then it will print the message "Server is running on port 3000!" otherwise it will print the error message
app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

//  to route the incoming requests to the respective routers
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);


// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// })


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});