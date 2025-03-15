import cors from 'cors'

const allowedOrigins = [
  'https://lifeistoolong.id.vn',
  'https://www.lifeistoolong.id.vn',
  'http://localhost:5173',
  'http://localhost:4173',
]

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
