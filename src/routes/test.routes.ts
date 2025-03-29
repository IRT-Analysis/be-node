// in your route file (e.g. src/routes/index.ts)

import express from 'express'
const router = express.Router()

router.get('/ping', (_req, res) => {
  res.status(200).json({ message: 'pong' })
})

export const testRoute = router
