import axios from 'axios'

const flaskApiBaseUrl = process.env.FLASK_API_ENDPOINT || 'http://localhost:5000'

const httpClient = axios.create({
  baseURL: `${flaskApiBaseUrl}/api/analyze`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default httpClient
