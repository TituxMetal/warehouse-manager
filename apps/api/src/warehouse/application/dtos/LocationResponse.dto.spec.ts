import { describe, expect, it } from 'bun:test'

import { LocationResponseDto } from './LocationResponse.dto'

/*
 * Test Data Builder
 * A helper to create instances of LocationResponseDto with default or overridden values.
 */
const createLocationResponseDto = (
  overrides: Partial<LocationResponseDto> = {}
): LocationResponseDto =>
  Object.assign(new LocationResponseDto(), {
    id: 1,
    level: 0,
    position: 50,
    status: 'available',
    aisleId: 10,
    bayId: 5,
    blockReasonId: null,
    isPicking: true,
    isBlocked: false,
    isAvailable: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides
  })

describe('LocationResponseDto', () => {
  it('should create instance with all properties', () => {
    const dto = createLocationResponseDto()

    expect(dto).toBeInstanceOf(LocationResponseDto)
    expect(dto.id).toBe(1)
    expect(dto.level).toBe(0)
    expect(dto.position).toBe(50)
    expect(dto.status).toBe('available')
    expect(dto.aisleId).toBe(10)
    expect(dto.bayId).toBe(5)
    expect(dto.blockReasonId).toBeNull()
    expect(dto.isPicking).toBe(true)
    expect(dto.isBlocked).toBe(false)
    expect(dto.isAvailable).toBe(true)
    expect(dto.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'))
    expect(dto.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'))
  })

  it('should create instance with blocked location properties', () => {
    const dto = createLocationResponseDto({
      id: 123,
      level: 20,
      status: 'blocked',
      blockReasonId: 1,
      isPicking: false,
      isBlocked: true,
      isAvailable: false
    })

    expect(dto.status).toBe('blocked')
    expect(dto.blockReasonId).toBe(1)
    expect(dto.isPicking).toBe(false)
    expect(dto.isBlocked).toBe(true)
    expect(dto.isAvailable).toBe(false)
  })

  it('should be serializable to JSON', () => {
    const dto = createLocationResponseDto()

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      id: 1,
      level: 0,
      position: 50,
      status: 'available',
      aisleId: 10,
      bayId: 5,
      blockReasonId: null,
      isPicking: true,
      isBlocked: false,
      isAvailable: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z'
    })
  })
})
