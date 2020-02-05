const moment = require("moment");
const winston = require("winston");


const logger = winston.createLogger({
    exitOnError: false,
    format: winston.format.printf(({ level, message}) => {
            return `${moment().format("[[]HH:mm:ss[]]")} ${level.toUpperCase()}: ${message}`;
        }),
    transports: [
        new winston.transports.File({
            filename: `${moment().format("[]DD-MM-YYYY_HH:mm:ss[]")}.log`,
            dirname: "./src/logs/"
        }),
        new winston.transports.Console()
    ]
});

module.exports = logger;