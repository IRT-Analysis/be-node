import { createLogger, format, transports, Logger } from 'winston'

const { combine, timestamp, json, colorize, printf } = format

const consoleLogFormat = printf(({ level, message }) => {
  return `${level}: ${message}`
})

const logger: Logger = createLogger({
  level: 'info',
  format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
  transports: [
    new transports.Console({
      format: combine(colorize(), consoleLogFormat),
    }),
    // new transports.File({
    //   filename: 'app.log',
    //   format: combine(timestamp(), json()),
    // }),
  ],
})

// utils/requestLogger.ts (or in the same file)

export const requestLoggerStream = {
  write: (message: string) => {
    const parts = message.trim().split(' ')
    const logObject = {
      method: parts[0],
      url: parts[1],
      status: parts[2],
      responseTime: parts[3],
    }
    logger.info(JSON.stringify(logObject))
  },
}

export default logger
