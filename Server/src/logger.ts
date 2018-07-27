import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`;
});

export const logger = createLogger({
    format: combine(colorize(), timestamp(), myFormat),
    transports: [new transports.Console()]
});
