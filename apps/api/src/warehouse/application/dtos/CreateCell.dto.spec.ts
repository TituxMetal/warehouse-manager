import { describe, expect, it } from 'bun:test'

import { CreateCellDto } from './CreateCell.dto'

describe('CreateCellDto', () => {
  it('should create instance with all properties', () => {
    const dto = new CreateCellDto()
    dto.cellNumber = 5
    dto.aisleStart = 1
    dto.aisleEnd = 10
    dto.startLocationType = 'odd'
    dto.endLocationType = 'even'
    dto.locationsPerAisle = 100
    dto.levelCount = 6
    dto.hasPicking = true

    expect(dto).toBeInstanceOf(CreateCellDto)
    expect(dto.cellNumber).toBe(5)
    expect(dto.aisleStart).toBe(1)
    expect(dto.aisleEnd).toBe(10)
    expect(dto.startLocationType).toBe('odd')
    expect(dto.endLocationType).toBe('even')
    expect(dto.locationsPerAisle).toBe(100)
    expect(dto.levelCount).toBe(6)
    expect(dto.hasPicking).toBe(true)
  })

  it('should have all properties undefined by default', () => {
    const dto = new CreateCellDto()

    expect(dto).toBeInstanceOf(CreateCellDto)
    expect(dto.cellNumber).toBeUndefined()
    expect(dto.aisleStart).toBeUndefined()
    expect(dto.aisleEnd).toBeUndefined()
    expect(dto.startLocationType).toBeUndefined()
    expect(dto.endLocationType).toBeUndefined()
    expect(dto.locationsPerAisle).toBeUndefined()
    expect(dto.levelCount).toBeUndefined()
    expect(dto.hasPicking).toBeUndefined()
  })

  it('should be serializable to JSON', () => {
    const dto = new CreateCellDto()
    dto.cellNumber = 3
    dto.aisleStart = 2
    dto.aisleEnd = 5
    dto.startLocationType = 'odd'
    dto.endLocationType = 'even'
    dto.locationsPerAisle = 100
    dto.levelCount = 6
    dto.hasPicking = true

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      cellNumber: 3,
      aisleStart: 2,
      aisleEnd: 5,
      startLocationType: 'odd',
      endLocationType: 'even',
      locationsPerAisle: 100,
      levelCount: 6,
      hasPicking: true
    })
  })
})
