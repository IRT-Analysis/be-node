import axios from 'axios'
import FormData from 'form-data'

export const analyzeFileWithFlask = async (
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  flaskEndpoint: string
): Promise<unknown> => {
  const formData = new FormData()

  // Append the buffer directly instead of creating a Blob
  formData.append('file', buffer, {
    filename: originalName,
    contentType: mimeType,
  })

  const response = await axios.post(flaskEndpoint, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  })

  return response.data
}
