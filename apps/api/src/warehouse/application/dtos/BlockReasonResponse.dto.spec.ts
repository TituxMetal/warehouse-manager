import { describe, expect, it } from 'bun:test'

import { BlockReasonResponseDto } from './BlockReasonResponse.dto'

/*
 * Test Data Builder
 * A helper to create instances of BlockReasonResponseDto with default or overridden values.
 */
const createBlockReasonResponseDto = (
  overrides: Partial<BlockReasonResponseDto> = {}
): BlockReasonResponseDto =>
  Object.assign(new BlockReasonResponseDto(), {
    id: 1,
    code: 'PILL',
    name: 'Concrete Pillar',
    description: 'A permanent concrete pillar blocking the location',
    permanent: true,
    displayName: 'Concrete Pillar (Permanent)',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides
  })

describe('BlockReasonResponseDto', () => {
  it('should create instance with all properties', () => {
    const dto = createBlockReasonResponseDto()

    expect(dto).toBeInstanceOf(BlockReasonResponseDto)
    expect(dto.id).toBe(1)
    expect(dto.code).toBe('PILL')
    expect(dto.name).toBe('Concrete Pillar')
    expect(dto.description).toBe('A permanent concrete pillar blocking the location')
    expect(dto.permanent).toBe(true)
    expect(dto.displayName).toBe('Concrete Pillar (Permanent)')
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should handle non-permanent block reason', () => {
    const dto = createBlockReasonResponseDto({
      id: 2,
      code: 'BEAM',
      name: 'Broken Beam',
      description: 'A broken beam blocking the location',
      permanent: false,
      displayName: 'Broken Beam (Temporary)'
    })

    expect(dto).toBeInstanceOf(BlockReasonResponseDto)
    expect(dto.id).toBe(2)
    expect(dto.code).toBe('BEAM')
    expect(dto.name).toBe('Broken Beam')
    expect(dto.description).toBe('A broken beam blocking the location')
    expect(dto.permanent).toBe(false)
    expect(dto.displayName).toBe('Broken Beam (Temporary)')
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should be serializable to JSON', () => {
    const dto = createBlockReasonResponseDto()

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      id: 1,
      code: 'PILL',
      name: 'Concrete Pillar',
      description: 'A permanent concrete pillar blocking the location',
      permanent: true,
      displayName: 'Concrete Pillar (Permanent)',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    })
  })
})
