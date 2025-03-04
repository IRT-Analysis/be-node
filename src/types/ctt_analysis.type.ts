export type CTTAnalysisResult = {
  [key: string]: {
    content: QuestionDetails
    difficulty: number
    difficulty_category: string
    discrimination: number
    discrimination_category: string
    r_pbis: number
    options: {
      [optionKey: string]: OptionDetails
    }
    group_choice_percentages: Record<string, number>[]
    correct_index: number
  }
}

export type OptionDetails = Readonly<{
  selected_by: number
  top_selected: number
  bottom_selected: number
  ratio: number
  discrimination: number
  r_pbis: number
}>

export type QuestionDetails = {
  question: string
  option: string[]
}

export type CTTGeneralDetails = Readonly<{
  general: {
    total_students: number
    total_questions: number
    total_option: number
  }
  histogram: {
    score: Record<string, number>[]
    difficulty: Record<string, number>[]
    discrimination: Record<string, number>[]
    r_pbis: Record<string, number>[]
  }
  average: AverageDetails
}>

export type AverageDetails = Readonly<{
  average_score: number
  average_discrimination: number
  average_difficulty: number
  average_rpbis: number
}>

export type RelevantKeys = Extract<
  keyof CTTAnalysisResult[keyof CTTAnalysisResult],
  'difficulty' | 'discrimination' | 'r_pbis'
>

type ValueType<Key extends RelevantKeys> = CTTAnalysisResult[keyof CTTAnalysisResult][Key]

export type ReviewQuestion = {
  id: string
  violatedIndices: {
    name: RelevantKeys
    value: ValueType<RelevantKeys>
    message: string
  }[]
}
