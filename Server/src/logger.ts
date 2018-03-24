import * as winston from 'winston';

export const logger = new winston.Logger({
    exitOnError: false,
    level: 'info',
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            timestamp: () => {
                return new Date().toLocaleString('sv-SE');
            },
            colorize: true
        })
    ]
});
