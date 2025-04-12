export const REQUIRED_FILES = ['result_file', 'exam_file'] as const

export enum AnalysisType {
  CTT = 'CTT',
  IRT = 'IRT',
  RASCH = 'Rasch',
}
