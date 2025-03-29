import { requestLoggerStream } from '@/utils/logger'
import morgan from 'morgan'

const morganFormat = ':method :url :status :response-time ms'

const loggerMiddleware = morgan(morganFormat, {
  stream: requestLoggerStream,
})

export default loggerMiddleware
