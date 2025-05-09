import cors from 'cors'

const allowedOrigins = [
  'https://mcq-insight.id.vn',
  'https://www.mcq-insight.id.vn',
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
  credentials: true,
})

export default corsMiddleware
