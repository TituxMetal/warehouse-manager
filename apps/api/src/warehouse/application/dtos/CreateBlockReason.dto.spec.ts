import { describe, expect, it } from 'bun:test'

import { CreateBlockReasonDto } from './CreateBlockReason.dto'

describe('CreateBlockReasonDto', () => {
  it('should create instance with all properties', () => {
    const dto = new CreateBlockReasonDto()
    dto.code = 'BR1234'
    dto.name = 'Test Block Reason'
    dto.description = 'This is a test block reason description.'
    dto.permanent = true

    expect(dto).toBeInstanceOf(CreateBlockReasonDto)
    expect(dto.code).toBe('BR1234')
    expect(dto.name).toBe('Test Block Reason')
    expect(dto.description).toBe('This is a test block reason description.')
    expect(dto.permanent).toBe(true)
  })

  it('should create instance with only required properties', () => {
    const dto = new CreateBlockReasonDto()
    dto.code = 'BR5678'
    dto.name = 'Another Block Reason'

    expect(dto).toBeInstanceOf(CreateBlockReasonDto)
    expect(dto.code).toBe('BR5678')
    expect(dto.name).toBe('Another Block Reason')
    expect(dto.description).toBeUndefined()
    expect(dto.permanent).toBeUndefined()
  })

  it('should be serializable to JSON', () => {
    const dto = new CreateBlockReasonDto()
    dto.code = 'BR9012'
    dto.name = 'Serializable Block Reason'

    const json = JSON.stringify(dto)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual({
      code: 'BR9012',
      name: 'Serializable Block Reason',
      description: undefined,
      permanent: undefined
    })
  })
})
