import { describe, expect, it } from 'bun:test'

import { UpdateBlockReasonDto } from './UpdateBlockReason.dto'

describe('UpdateBlockReasonDto', () => {
  it('should create instance with all properties', () => {
    const dto = new UpdateBlockReasonDto()
    dto.code = 'BR1234'
    dto.name = 'Updated Block Reason'
    dto.description = 'This is an updated block reason description.'
    dto.permanent = false

    expect(dto).toBeInstanceOf(UpdateBlockReasonDto)
    expect(dto.code).toBe('BR1234')
    expect(dto.name).toBe('Updated Block Reason')
    expect(dto.description).toBe('This is an updated block reason description.')
    expect(dto.permanent).toBe(false)
  })

  it('should create instance with single property', () => {
    const dto = new UpdateBlockReasonDto()
    dto.name = 'Partially Updated Block Reason'

    expect(dto).toBeInstanceOf(UpdateBlockReasonDto)
    expect(dto.code).toBeUndefined()
    expect(dto.name).toBe('Partially Updated Block Reason')
    expect(dto.description).toBeUndefined()
    expect(dto.permanent).toBeUndefined()
  })

  it('should create empty instance', () => {
    const dto = new UpdateBlockReasonDto()

    expect(dto).toBeInstanceOf(UpdateBlockReasonDto)
    expect(dto.code).toBeUndefined()
    expect(dto.name).toBeUndefined()
    expect(dto.description).toBeUndefined()
    expect(dto.permanent).toBeUndefined()
  })

  it('should be serializable to JSON', () => {
    const dto = new UpdateBlockReasonDto()
    dto.code = 'BR5678'
    dto.permanent = true

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      code: 'BR5678',
      name: undefined,
      description: undefined,
      permanent: true
    })
  })
})
