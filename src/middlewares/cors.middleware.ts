import cors from 'cors'

const allowedOrigins = ['https://lifeistoolong.id.vn', 'https://www.lifeistoolong.id.vn']

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: false,
})

export default corsMiddleware
