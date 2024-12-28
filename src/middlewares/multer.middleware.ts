import multer, { StorageEngine } from 'multer'

const storage: StorageEngine = multer.memoryStorage()
const upload = multer({ storage })

export default upload.fields([
  { name: 'result_file', maxCount: 1 },
  { name: 'exam_file', maxCount: 1 },
])
