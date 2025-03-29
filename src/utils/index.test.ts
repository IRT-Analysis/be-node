import { normalizePath } from '@/utils'

describe('normalizePath', () => {
  it.each`
    input         | expected
    ${'/hello'}   | ${'hello'}
    ${'world'}    | ${'world'}
    ${'/'}        | ${''}
    ${''}         | ${''}
    ${'/path/to'} | ${'path/to'}
  `('should convert "$input" to "$expected"', ({ input, expected }) => {
    expect(normalizePath(input)).toBe(expected)
  })
})
