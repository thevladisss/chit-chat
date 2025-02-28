const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const { initWebSocketServer } = require('./ws/ws-server');

const networkRouter = require('./routes/network.route');
const uploadRouter = require('./routes/upload.route');

const ping = require('net-ping');
const fs = require('node:fs');

const app = express();

app.use(
  cors({
    origin: '*',
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
  }),
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/network', networkRouter);
app.use('/api/upload', uploadRouter);

const subnet = '192.168.1'; // Adjust based on your network
const start = 1;
const end = 254;
const _session = ping.createSession();

initWebSocketServer();

module.exports = app;
