export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

enum GroupKeys {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  NO_ANSWER = '*',
}

export type GroupValues = Record<GroupKeys, number>

export type ItemData = {
  question: number
  difficulty: number
  discrimination_index: GroupValues
  distribution: GroupValues
  high_group: Partial<GroupValues>
  low_group: Partial<GroupValues>
  mean_scores: GroupValues
  p_value: number
  rpbis: GroupValues
}
