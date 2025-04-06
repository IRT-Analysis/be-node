import axios from 'axios'
import { config } from 'dotenv'

config()

const flaskApiBaseUrl = process.env.FLASK_API_ENDPOINT

const httpClient = axios.create({
  baseURL: `${flaskApiBaseUrl}/api/analyze`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default httpClient
