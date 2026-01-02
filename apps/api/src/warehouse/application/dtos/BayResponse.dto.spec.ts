import { describe, expect, it } from 'bun:test'

import { BayResponseDto } from './BayResponse.dto'

/*
 * Test Data Builder
 * A helper to create instances of BayResponseDto with default or overridden values.
 */
const createBayResponseDto = (overrides: Partial<BayResponseDto> = {}): BayResponseDto =>
  Object.assign(new BayResponseDto(), {
    id: 1,
    number: 2,
    width: 4,
    startPosition: 0,
    aisleId: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides
  })

describe('BayResponseDto', () => {
  it('should create instance with all properties', () => {
    const dto = createBayResponseDto()

    expect(dto).toBeInstanceOf(BayResponseDto)
    expect(dto.id).toBe(1)
    expect(dto.number).toBe(2)
    expect(dto.width).toBe(4)
    expect(dto.startPosition).toBe(0)
    expect(dto.aisleId).toBe(5)
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should be serializable to JSON', () => {
    const dto = createBayResponseDto()

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      id: 1,
      number: 2,
      width: 4,
      startPosition: 0,
      aisleId: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    })
  })
})
