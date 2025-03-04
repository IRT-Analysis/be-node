export type StudentAnswer = {
  id: number
  firstName: string
  lastName: string
  exam_code: string
  answers: Answer
}

export type Answer = Record<string, { answer: string; correct: boolean }>
