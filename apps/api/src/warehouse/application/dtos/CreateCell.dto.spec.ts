import { describe, expect, it } from 'bun:test'
import { validate } from 'class-validator'

import { CreateCellDto } from './CreateCell.dto'

const dtoWith = (overrides: Partial<CreateCellDto>): CreateCellDto => {
  const dto = new CreateCellDto()
  dto.cellNumber = 1
  dto.aisleStart = 1
  dto.aisleEnd = 1
  dto.startLocationType = 'both'
  dto.endLocationType = 'both'
  dto.locationsPerAisle = 6
  dto.levelCount = 2
  dto.hasPicking = true

  return Object.assign(dto, overrides)
}

const errorsFor = async (dto: CreateCellDto) => {
  const errors = await validate(dto)

  return errors.flatMap(error => Object.values(error.constraints ?? {}))
}

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

  describe('locationsPerAisle object-level constraint', () => {
    // No ValidationPipe is registered in the application yet (no CellController either),
    // so these decorators never run over HTTP. This block invokes `class-validator`'s
    // `validate()` directly to prove the constraint's verdicts against decision 004's
    // table. The rule is enforced for real in `CreateCellUseCase`.

    it('accepts the legal two-sided totals from decision 004', async () => {
      for (const locationsPerAisle of [6, 8, 12, 14, 16, 20]) {
        const errors = await errorsFor(dtoWith({ locationsPerAisle }))

        expect({ locationsPerAisle, errors }).toEqual({ locationsPerAisle, errors: [] })
      }
    })

    it('rejects a total of 10 for a two-sided aisle but accepts it for a one-sided one', async () => {
      const twoSidedErrors = await errorsFor(
        dtoWith({ locationsPerAisle: 10, startLocationType: 'both', endLocationType: 'both' })
      )
      expect(twoSidedErrors).toHaveLength(1)
      expect(twoSidedErrors[0]).toContain('5 positions per side')

      // A single aisle ignores endLocationType and has only the odd side; 10 = 3 + 3 + 4.
      const oneSidedErrors = await errorsFor(
        dtoWith({ locationsPerAisle: 10, startLocationType: 'odd', endLocationType: 'both' })
      )
      expect(oneSidedErrors).toEqual([])
    })

    it('rejects an odd total for a two-sided aisle but accepts it for a one-sided one', async () => {
      const twoSidedErrors = await errorsFor(
        dtoWith({ locationsPerAisle: 7, startLocationType: 'both', endLocationType: 'both' })
      )
      expect(twoSidedErrors).toHaveLength(1)
      expect(twoSidedErrors[0]).toContain('both sides')

      // One-sided aisles have no parity requirement: 7 = 4 + 3.
      const oneSidedErrors = await errorsFor(
        dtoWith({ locationsPerAisle: 7, startLocationType: 'even', endLocationType: 'even' })
      )
      expect(oneSidedErrors).toEqual([])
    })

    it('treats a multi-aisle cell as two-sided even when both endpoints are one-sided', async () => {
      // Middle aisles are always `both`, so an even but non-decomposable total of 10 must
      // be rejected even though both declared endpoints are `odd`.
      const errors = await errorsFor(
        dtoWith({
          aisleEnd: 3,
          locationsPerAisle: 10,
          startLocationType: 'odd',
          endLocationType: 'even'
        })
      )

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('5 positions per side')
    })

    it('rejects 1, 2 and 5 for a one-sided aisle and 4 for a two-sided aisle', async () => {
      for (const locationsPerAisle of [1, 2, 5]) {
        const errors = await errorsFor(
          dtoWith({ locationsPerAisle, startLocationType: 'odd', endLocationType: 'odd' })
        )

        expect(errors.length).toBeGreaterThan(0)
      }

      const twoSidedFour = await errorsFor(
        dtoWith({ locationsPerAisle: 4, startLocationType: 'both', endLocationType: 'both' })
      )
      expect(twoSidedFour).toHaveLength(1)
      expect(twoSidedFour[0]).toContain('at least 3 positions')
    })

    it('accepts the legal one-sided totals from decision 004', async () => {
      for (const locationsPerAisle of [3, 4, 6, 7, 8, 9, 11]) {
        const errors = await errorsFor(
          dtoWith({ locationsPerAisle, startLocationType: 'even', endLocationType: 'even' })
        )

        expect({ locationsPerAisle, errors }).toEqual({ locationsPerAisle, errors: [] })
      }
    })
  })
})
