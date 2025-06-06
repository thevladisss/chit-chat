const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');

const networkRouter = require('./routes/network.route');
const uploadRouter = require('./routes/upload.route');
const chatRouter = require('./routes/chat.route');
const userRouter = require('./routes/user.route');

const ping = require('net-ping');
const fs = require('node:fs');

const app = express();

const sessionParser = session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
  secret: process.env.SESSION_SECRET || 'secret',
});

app.use(
  cors({
    credentials: true,
    origin: ['http://10.0.0.38:5173', 'http://localhost:5173'],
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
