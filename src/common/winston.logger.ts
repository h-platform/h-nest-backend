import { SERVICE_NAME } from '../constants'
const winston = require('winston');
const colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function colorizePhrase(level, phrase) {
    phrase = `[${phrase || ''}]`;
    switch (level) {
        case 'silly':
            phrase = colors.silly(phrase)
            break;
        case 'verpose':
            phrase = colors.verpose(phrase)
            break;
        case 'info':
            phrase = colors.info(phrase)
            break;
        case 'warn':
            phrase = colors.warn(phrase)
            break;
        case 'debug':
            phrase = colors.debug(phrase)
            break;
        case 'error':
            phrase = colors.error(phrase)
            break;
        default:
            break;
    }
    return phrase;
}

const hCapitalizeLevel = winston.format((info, opts) => {
    info.level = `[${info.level.toUpperCase()}]`
    return info;
});

const hFormatColored = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY/MM/DD HH:mm:ss'
    }),
    winston.format.printf((info) => {
        const timestamp = colorizePhrase(info.level, info.timestamp)
        const level = colorizePhrase(info.level, info.level.toUpperCase())
        return `${level} ${timestamp} [${info.service || ''}][${info.className || ''}] - ${info.message} ` + JSON.stringify({ ...info, service: undefined, className: undefined, level: undefined, timestamp: undefined, message: undefined })
    })
)

const hFormatNoColor = winston.format.combine(
    hCapitalizeLevel(),
    winston.format.timestamp({
        format: 'YYYY/MM/DD HH:mm:ss'
    }),
    winston.format.printf((info) => {
        return `${info.level} [${info.timestamp}] [${info.service || ''}][${info.class || ''}] - ${info.message} ` + JSON.stringify({ ...info, service: undefined, className: undefined, level: undefined, timestamp: undefined, message: undefined })
    })
)

const defaultLoggerOptions = {
    defaultMeta: { service: SERVICE_NAME },
    transports: [
        new winston.transports.File({
            filename: 'logs/info.jsonl',
            level: 'info',
            format: winston.format.json(),
        }),
        new winston.transports.File({
            filename: 'logs/info.log',
            level: 'info',
            format: hFormatNoColor,
        }),
        new winston.transports.Console({
            level: 'debug',
            format: hFormatColored,
        })
    ],
};

export const httpLogger = winston.createLogger({
    defaultMeta: { service: SERVICE_NAME },
    transports: [
        new winston.transports.File({
            filename: 'logs/http.jsonl',
            level: 'info',
            format: winston.format.json(),
        })
    ],
})

export const logger = winston.createLogger(defaultLoggerOptions)

export function giveMeClassLogger(className: string) {
    return winston.createLogger({
        ...defaultLoggerOptions,
        defaultMeta: { ...defaultLoggerOptions.defaultMeta, className: className }
    });
}