import { describe, expect, it } from 'bun:test'

import { BlockLocationDto } from './BlockLocation.dto'

describe('BlockLocationDto', () => {
  it('should create instance with blockReasonId', () => {
    const dto = new BlockLocationDto()
    dto.blockReasonId = 42

    expect(dto).toBeInstanceOf(BlockLocationDto)
    expect(dto.blockReasonId).toBe(42)
  })

  it('should be serializable to JSON', () => {
    const dto = new BlockLocationDto()
    dto.blockReasonId = 99

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      blockReasonId: 99
    })
  })
})
