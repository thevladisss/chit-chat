import 'dotenv-flow/config';
import express, { Express } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import session from 'express-session';
import connectDB from './database';
import { sessionStore } from './session';
import chatRouter from './routes/chat.route';
import userRouter from './routes/user.route';

const app: Express = express();

// Connect to MongoDB
connectDB().catch((err) => console.error('Could not connect to MongoDB', err));

export const sessionParser = session({
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: {
    secure: false,
  },
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
});

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionParser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/chats', chatRouter);
app.use('/api/users', userRouter);

export default app;
