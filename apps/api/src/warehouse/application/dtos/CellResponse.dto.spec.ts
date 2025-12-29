import { describe, expect, it } from 'bun:test'

import { CellResponseDto } from './CellResponse.dto'

/*
 * Test Data Builder
 * A helper to create instances of CellResponseDto with default or overridden values.
 */
const createCellResponseDto = (overrides: Partial<CellResponseDto> = {}): CellResponseDto =>
  Object.assign(new CellResponseDto(), {
    id: 1,
    number: 101,
    aislesCount: 10,
    locationsPerAisle: 100,
    levelsPerLocation: 6,
    totalLocations: 6000,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides
  })

describe('CellResponseDto', () => {
  it('should create instance with all properties', () => {
    const dto = createCellResponseDto()

    expect(dto).toBeInstanceOf(CellResponseDto)
    expect(dto.id).toBe(1)
    expect(dto.number).toBe(101)
    expect(dto.aislesCount).toBe(10)
    expect(dto.locationsPerAisle).toBe(100)
    expect(dto.levelsPerLocation).toBe(6)
    expect(dto.totalLocations).toBe(6000)
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should be serializable to JSON', () => {
    const dto = createCellResponseDto()

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      id: 1,
      number: 101,
      aislesCount: 10,
      locationsPerAisle: 100,
      levelsPerLocation: 6,
      totalLocations: 6000,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    })
  })
})
