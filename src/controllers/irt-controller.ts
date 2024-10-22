import { Request, Response, Router } from 'express'
import multer, { StorageEngine } from 'multer'
import axios from 'axios'

const router = Router()

const storage: StorageEngine = multer.memoryStorage()
const upload = multer({ storage })

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const formData = new FormData()
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype })
    formData.append('file', blob, req.file.originalname)

    const flaskUrl = `${process.env.FLASK_API_ENDPOINT}/api/irt/analyze`

    const flaskResponse = await axios.post(flaskUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    res.status(200).json({
      message: 'File uploaded and processed successfully by Flask',
      data: flaskResponse.data,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({
      message: 'Failed to process file',
      error: (error as Error).message,
    })
  }
})

export default router
