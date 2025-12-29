import { describe, expect, it } from 'bun:test'

import { AisleResponseDto } from './AisleResponse.dto'

/*
 * Test Data Builder
 * A helper to create instances of AisleResponseDto with default or overridden values.
 */
const createAisleResponseDto = (overrides: Partial<AisleResponseDto> = {}): AisleResponseDto =>
  Object.assign(new AisleResponseDto(), {
    id: 1,
    number: 16,
    isOdd: true,
    cellId: 5,
    label: 'Aisle-16',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides
  })

describe('AisleResponseDto', () => {
  it('should create instance with all properties', () => {
    const dto = createAisleResponseDto()

    expect(dto).toBeInstanceOf(AisleResponseDto)
    expect(dto.id).toBe(1)
    expect(dto.number).toBe(16)
    expect(dto.isOdd).toBe(true)
    expect(dto.cellId).toBe(5)
    expect(dto.label).toBe('Aisle-16')
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should be serializable to JSON', () => {
    const dto = createAisleResponseDto()

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      id: 1,
      number: 16,
      isOdd: true,
      cellId: 5,
      label: 'Aisle-16',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    })
  })
})
