type GroupKeys = 'A' | 'B' | 'C' | 'D' | '*'

export type GroupValues = {
  [key in GroupKeys]: number
}

export interface ItemData {
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
