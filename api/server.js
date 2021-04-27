const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const apiRouter = require('./api-router');

const server = express();
server.use(express.json());
server.use(helmet());
server.use(cors());

server.use('/api', apiRouter);

server.get('/', (req, res, next) => { // eslint-disable-line
  res.json({ api: "up" });
});

module.exports = server;
