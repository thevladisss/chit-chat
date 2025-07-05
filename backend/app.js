//TODO: Migrate to ESM & TypeScript
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./database');
const { sessionStore } = require('./session');

const networkRouter = require('./routes/network.route');
const uploadRouter = require('./routes/upload.route');
const chatRouter = require('./routes/chat.route');
const userRouter = require('./routes/user.route');

const app = express();

// Connect to MongoDB
connectDB().catch((err) => console.error('Could not connect to MongoDB', err));

const sessionParser = session({
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: {
    secure: false,
  },
  secret: process.env.SESSION_SECRET,
});

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionParser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/network', networkRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chats', chatRouter);
app.use('/api/users', userRouter);

module.exports = app;
module.exports.sessionParser = sessionParser;
