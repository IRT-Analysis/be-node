import logger from '@/utils/logger'

if (process.env.NODE_ENV === 'test') {
  jest.spyOn(logger, 'info').mockImplementation(() => logger)
  jest.spyOn(logger, 'warn').mockImplementation(() => logger)
  jest.spyOn(logger, 'error').mockImplementation(() => logger)
}
