const pino = require('pino');

require('dotenv').config();
let pinoDestination = process.env.PINO_DESTINATION;

const dest = pino.destination(pinoDestination);

const logger = pino({
  prettyPrint: { 
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
   },
}, dest)

process.on('SIGHUP', () => dest.reopen())

module.exports = logger;