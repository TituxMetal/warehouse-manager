import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleEntity, BayEntity, CellEntity } from '~/warehouse/domain/entities'
import {
  CellAlreadyExistsException,
  InvalidAisleRangeException,
  InvalidLocationsPerAisleException
} from '~/warehouse/domain/exceptions'
import type {
  IAisleRepository,
  IBayRepository,
  ICellRepository,
  ILocationRepository
} from '~/warehouse/domain/repositories'
import { AisleValueObject, CellValueObject } from '~/warehouse/domain/value-objects'

import { CreateCellUseCase } from './CreateCell.uc'

const createTestBayEntity = (overrides?: Partial<BayEntity>) =>
  Object.assign(
    new BayEntity(
      overrides?.id ?? 1,
      overrides?.number ?? 1,
      overrides?.width ?? 4,
      overrides?.startPosition ?? 0,
      overrides?.aisleId ?? 1,
      overrides?.createdAt ?? new Date('2025-01-01'),
      overrides?.updatedAt ?? new Date('2025-01-02')
    ),
    overrides
  )

describe('CreateCellUseCase', () => {
  let useCase: CreateCellUseCase
  let mockCellRepository: {
    findById: Mock<ICellRepository['findById']>
    findByNumber: Mock<ICellRepository['findByNumber']>
    findAll: Mock<ICellRepository['findAll']>
    findWithAisles: Mock<ICellRepository['findWithAisles']>
    create: Mock<ICellRepository['create']>
    update: Mock<ICellRepository['update']>
    delete: Mock<ICellRepository['delete']>
    exists: Mock<ICellRepository['exists']>
  }
  let mockAisleRepository: {
    findById: Mock<IAisleRepository['findById']>
    findByCellId: Mock<IAisleRepository['findByCellId']>
    findWithBays: Mock<IAisleRepository['findWithBays']>
    findWithLocations: Mock<IAisleRepository['findWithLocations']>
    create: Mock<IAisleRepository['create']>
    createMany: Mock<IAisleRepository['createMany']>
    update: Mock<IAisleRepository['update']>
    delete: Mock<IAisleRepository['delete']>
  }
  let mockBayRepository: {
    findById: Mock<IBayRepository['findById']>
    findByAisleId: Mock<IBayRepository['findByAisleId']>
    findWithLocations: Mock<IBayRepository['findWithLocations']>
    create: Mock<IBayRepository['create']>
    createMany: Mock<IBayRepository['createMany']>
    update: Mock<IBayRepository['update']>
    delete: Mock<IBayRepository['delete']>
  }
  let mockLocationRepository: {
    findById: Mock<ILocationRepository['findById']>
    findByBayId: Mock<ILocationRepository['findByBayId']>
    findByAisleId: Mock<ILocationRepository['findByAisleId']>
    findPickingLocations: Mock<ILocationRepository['findPickingLocations']>
    findAvailableLocations: Mock<ILocationRepository['findAvailableLocations']>
    findBlockedLocations: Mock<ILocationRepository['findBlockedLocations']>
    create: Mock<ILocationRepository['create']>
    createMany: Mock<ILocationRepository['createMany']>
    update: Mock<ILocationRepository['update']>
    delete: Mock<ILocationRepository['delete']>
  }

  beforeEach(() => {
    mockCellRepository = {
      findById: mock(() => {}) as unknown as Mock<ICellRepository['findById']>,
      findByNumber: mock(() => {}) as unknown as Mock<ICellRepository['findByNumber']>,
      findAll: mock(() => {}) as unknown as Mock<ICellRepository['findAll']>,
      findWithAisles: mock(() => {}) as unknown as Mock<ICellRepository['findWithAisles']>,
      create: mock(() => {}) as unknown as Mock<ICellRepository['create']>,
      update: mock(() => {}) as unknown as Mock<ICellRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ICellRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<ICellRepository['exists']>
    }
    mockAisleRepository = {
      findById: mock(() => {}) as unknown as Mock<IAisleRepository['findById']>,
      findByCellId: mock(() => {}) as unknown as Mock<IAisleRepository['findByCellId']>,
      findWithBays: mock(() => {}) as unknown as Mock<IAisleRepository['findWithBays']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IAisleRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IAisleRepository['create']>,
      createMany: mock(() => {}) as unknown as Mock<IAisleRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<IAisleRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IAisleRepository['delete']>
    }
    mockBayRepository = {
      findById: mock(() => {}) as unknown as Mock<IBayRepository['findById']>,
      findByAisleId: mock(() => {}) as unknown as Mock<IBayRepository['findByAisleId']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IBayRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IBayRepository['create']>,
      createMany: mock(() => {}) as unknown as Mock<IBayRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<IBayRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBayRepository['delete']>
    }
    mockLocationRepository = {
      findById: mock(() => {}) as unknown as Mock<ILocationRepository['findById']>,
      findByBayId: mock(() => {}) as unknown as Mock<ILocationRepository['findByBayId']>,
      findByAisleId: mock(() => {}) as unknown as Mock<ILocationRepository['findByAisleId']>,
      findPickingLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findPickingLocations']
      >,
      findAvailableLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findAvailableLocations']
      >,
      findBlockedLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findBlockedLocations']
      >,
      create: mock(() => {}) as unknown as Mock<ILocationRepository['create']>,
      createMany: mock(() => {}) as unknown as Mock<ILocationRepository['createMany']>,
      update: mock(() => {}) as unknown as Mock<ILocationRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ILocationRepository['delete']>
    }

    useCase = new CreateCellUseCase(
      mockCellRepository as unknown as ICellRepository,
      mockAisleRepository as unknown as IAisleRepository,
      mockBayRepository as unknown as IBayRepository,
      mockLocationRepository as unknown as ILocationRepository
    )
  })

  describe('execute', () => {
    it('should orchestrate the full cell structure persistence (happy path)', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 3, 3, 2, new Date(), new Date())
      )
      mockAisleRepository.createMany.mockResolvedValue([
        new AisleEntity(1, new AisleValueObject(1), true, 1, new Date(), new Date()),
        new AisleEntity(2, new AisleValueObject(1), false, 1, new Date(), new Date()),
        new AisleEntity(3, new AisleValueObject(2), true, 1, new Date(), new Date())
      ])
      const bayEntity1 = createTestBayEntity({ id: 1, width: 3, startPosition: 0, aisleId: 1 })
      const bayEntity2 = createTestBayEntity({ id: 2, width: 3, startPosition: 0, aisleId: 2 })
      const bayEntity3 = createTestBayEntity({ id: 3, width: 3, startPosition: 0, aisleId: 3 })
      mockBayRepository.createMany.mockResolvedValue([bayEntity1, bayEntity2, bayEntity3])
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'both',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }
      const result = await useCase.execute(dto)

      expect(mockCellRepository.findByNumber).toHaveBeenCalledWith(
        new CellValueObject(dto.cellNumber)
      )

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(3)
      // Decision 005: the stored value is the per-side count (6 / 2 = 3), not the entered
      // total of 6.
      expect(cellArgs.locationsPerAisle).toBe(3)
      expect(cellArgs.levelsPerLocation).toBe(2)

      const aisleArgs = mockAisleRepository.createMany.mock.calls[0][0]
      expect(aisleArgs).toHaveLength(3)
      expect(aisleArgs[0].cellId).toBe(1)
      expect(aisleArgs[0].number.value).toBe(1)
      expect(aisleArgs[0].isOdd).toBe(true)
      expect(aisleArgs[1].number.value).toBe(1)
      expect(aisleArgs[1].isOdd).toBe(false)
      expect(aisleArgs[2].number.value).toBe(2)
      expect(aisleArgs[2].isOdd).toBe(true)

      const bayArgs = mockBayRepository.createMany.mock.calls[0][0]
      expect(bayArgs).toHaveLength(3)
      expect(bayArgs[0].number).toBe(1)
      expect(bayArgs[0].width).toBe(3)
      expect(bayArgs[0].startPosition).toBe(0)
      expect(bayArgs[0].aisleId).toBe(1)
      expect(bayArgs[1].aisleId).toBe(2)
      expect(bayArgs[2].aisleId).toBe(3)

      const locationArgs = mockLocationRepository.createMany.mock.calls[0][0]
      expect(locationArgs).toHaveLength(18)
      expect(locationArgs[0].position.value).toBe(1)
      expect(locationArgs[0].level.value).toBe(0)
      expect(locationArgs[1].position.value).toBe(1)
      expect(locationArgs[1].level.value).toBe(10)
      expect(locationArgs[0].status).toBe('available')
      expect(locationArgs[0].aisleId).toBe(1)
      expect(locationArgs[0].bayId).toBe(1)
      expect(locationArgs[6].position.value).toBe(2)
      expect(locationArgs[6].aisleId).toBe(2)
      expect(locationArgs[6].bayId).toBe(2)
      expect(locationArgs[12].position.value).toBe(1)
      expect(locationArgs[12].aisleId).toBe(3)
      expect(locationArgs[12].bayId).toBe(3)

      expect(result).toHaveProperty('id', 1)
      expect(result.aislesCount).toBe(3)
      expect(result.locationsPerAisle).toBe(3)
      expect(result.levelsPerLocation).toBe(2)
    })

    it('should throw CellAlreadyExistsException when cell number is taken', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 3, 3, 2, new Date(), new Date())
      )

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'both',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      await expect(useCase.execute(dto)).rejects.toThrow(CellAlreadyExistsException)
      expect(mockCellRepository.create).not.toHaveBeenCalled()
    })

    it('should throw InvalidAisleRangeException when aisleStart is greater than aisleEnd', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)

      const dto = {
        cellNumber: 1,
        aisleStart: 5,
        aisleEnd: 2,
        startLocationType: 'both',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      await expect(useCase.execute(dto)).rejects.toThrow(InvalidAisleRangeException)
      expect(mockCellRepository.create).not.toHaveBeenCalled()
    })

    it('should create one isOdd=true aisle per number when both ends are "odd"', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 2, 3, 2, new Date(), new Date())
      )
      mockAisleRepository.createMany.mockResolvedValue([
        new AisleEntity(1, new AisleValueObject(1), true, 1, new Date(), new Date()),
        new AisleEntity(2, new AisleValueObject(2), true, 1, new Date(), new Date())
      ])
      mockBayRepository.createMany.mockResolvedValue([
        createTestBayEntity({ id: 1, width: 3, startPosition: 0, aisleId: 1 }),
        createTestBayEntity({ id: 2, width: 3, startPosition: 0, aisleId: 2 })
      ])
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'odd',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      await useCase.execute(dto)

      const aisleArgs = mockAisleRepository.createMany.mock.calls[0][0]
      expect(aisleArgs).toHaveLength(2)
      expect(aisleArgs.every((aisle: AisleEntity) => aisle.isOdd)).toBe(true)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(2)
    })

    it('should create one isOdd=false aisle per number when both ends are "even"', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 2, 3, 2, new Date(), new Date())
      )
      mockAisleRepository.createMany.mockResolvedValue([
        new AisleEntity(1, new AisleValueObject(1), false, 1, new Date(), new Date()),
        new AisleEntity(2, new AisleValueObject(2), false, 1, new Date(), new Date())
      ])
      mockBayRepository.createMany.mockResolvedValue([
        createTestBayEntity({ id: 1, width: 3, startPosition: 0, aisleId: 1 }),
        createTestBayEntity({ id: 2, width: 3, startPosition: 0, aisleId: 2 })
      ])
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'even',
        endLocationType: 'even',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      await useCase.execute(dto)

      const aisleArgs = mockAisleRepository.createMany.mock.calls[0][0]
      expect(aisleArgs).toHaveLength(2)
      expect(aisleArgs.every((aisle: AisleEntity) => aisle.isOdd === false)).toBe(true)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(2)
    })

    it('should create two aisles (odd + even) per number when both ends are "both"', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 4, 3, 2, new Date(), new Date())
      )
      mockAisleRepository.createMany.mockResolvedValue([
        new AisleEntity(1, new AisleValueObject(1), true, 1, new Date(), new Date()),
        new AisleEntity(2, new AisleValueObject(1), false, 1, new Date(), new Date()),
        new AisleEntity(3, new AisleValueObject(2), true, 1, new Date(), new Date()),
        new AisleEntity(4, new AisleValueObject(2), false, 1, new Date(), new Date())
      ])
      mockBayRepository.createMany.mockResolvedValue([
        createTestBayEntity({ id: 1, width: 3, startPosition: 0, aisleId: 1 }),
        createTestBayEntity({ id: 2, width: 3, startPosition: 0, aisleId: 2 }),
        createTestBayEntity({ id: 3, width: 3, startPosition: 0, aisleId: 3 }),
        createTestBayEntity({ id: 4, width: 3, startPosition: 0, aisleId: 4 })
      ])
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'both',
        endLocationType: 'both',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      await useCase.execute(dto)

      const aisleArgs = mockAisleRepository.createMany.mock.calls[0][0]
      expect(aisleArgs).toHaveLength(4)
      expect(aisleArgs.filter((aisle: AisleEntity) => aisle.number.value === 1)).toHaveLength(2)
      expect(aisleArgs.filter((aisle: AisleEntity) => aisle.number.value === 2)).toHaveLength(2)
      expect(aisleArgs.filter((aisle: AisleEntity) => aisle.isOdd)).toHaveLength(2)
      expect(aisleArgs.filter((aisle: AisleEntity) => !aisle.isOdd)).toHaveLength(2)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(4)
    })

    it('should store the per-side count and expose a totalLocations matching the row count (two-sided)', async () => {
      // Two-sided cell: one aisle number expanded into two records. Per decision 005 the
      // stored value is the PER-SIDE count (6 / 2 = 3), not the entered total of 6. So
      // getTotalLocations reads records (2) x 3 per side x levels (2) = 12.
      //
      // The same 3 positions per side drives BAY generation, so 2 records x 3 positions x
      // 2 levels = 12 Location rows are materialised. `totalLocations` and the generated
      // row count are therefore EQUAL — that equality is the property decision 005 requires.
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockImplementation(async (cell: CellEntity) =>
        Object.assign(cell, { id: 1 })
      )
      mockAisleRepository.createMany.mockImplementation(async (aisles: AisleEntity[]) =>
        aisles.map((aisle, index) => Object.assign(aisle, { id: index + 1 }))
      )
      mockBayRepository.createMany.mockImplementation(async (bays: BayEntity[]) =>
        bays.map((bay, index) => Object.assign(bay, { id: index + 1 }))
      )
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'both',
        endLocationType: 'both',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }

      const result = await useCase.execute(dto)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(2)
      // Decision 005: the stored value is the per-side count, not the entered total.
      expect(cellArgs.locationsPerAisle).toBe(3)

      const locationArgs = mockLocationRepository.createMany.mock.calls[0][0]
      // Positions actually materialised: one set of 3 per side.
      expect(locationArgs).toHaveLength(12)
      expect(result.totalLocations).toBe(12)
      expect(result.totalLocations).toBe(cellArgs.getTotalLocations())
      expect(result.totalLocations).toBe(locationArgs.length)
    })

    it('should store the per-side count for the decision 005 worked example (both, 20)', async () => {
      // Decision 005 table:
      //   Aisle `both`, entered 20, 2 records -> stored 10 (per side).
      // `getTotalLocations()` reads it as 10 x 2 records x levels.
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockImplementation(async (cell: CellEntity) =>
        Object.assign(cell, { id: 1 })
      )
      mockAisleRepository.createMany.mockImplementation(async (aisles: AisleEntity[]) =>
        aisles.map((aisle, index) => Object.assign(aisle, { id: index + 1 }))
      )
      mockBayRepository.createMany.mockImplementation(async (bays: BayEntity[]) =>
        bays.map((bay, index) => Object.assign(bay, { id: index + 1 }))
      )
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'both',
        endLocationType: 'both',
        locationsPerAisle: 20,
        levelCount: 2,
        hasPicking: true
      }

      const result = await useCase.execute(dto)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(2)
      expect(cellArgs.locationsPerAisle).toBe(10)
      expect(result.totalLocations).toBe(10 * 2 * 2)
      expect(result.totalLocations).toBe(cellArgs.getTotalLocations())
    })

    it('should store the full total for a one-sided cell and expose a matching totalLocations', async () => {
      // Decision 005: for a one-sided aisle the per-side count coincides with the entered
      // total. Aisle `odd`, entered 10, 1 record -> stored 10; the single side is the
      // whole aisle, so a total of 10 means 10 positions on that side.
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockImplementation(async (cell: CellEntity) =>
        Object.assign(cell, { id: 1 })
      )
      mockAisleRepository.createMany.mockImplementation(async (aisles: AisleEntity[]) =>
        aisles.map((aisle, index) => Object.assign(aisle, { id: index + 1 }))
      )
      mockBayRepository.createMany.mockImplementation(async (bays: BayEntity[]) =>
        bays.map((bay, index) => Object.assign(bay, { id: index + 1 }))
      )
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'odd',
        endLocationType: 'odd',
        locationsPerAisle: 10,
        levelCount: 2,
        hasPicking: true
      }

      const result = await useCase.execute(dto)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.aislesCount).toBe(1)
      expect(cellArgs.locationsPerAisle).toBe(10)

      const locationArgs = mockLocationRepository.createMany.mock.calls[0][0]
      expect(locationArgs).toHaveLength(20)
      expect(result.totalLocations).toBe(20)
      expect(result.totalLocations).toBe(cellArgs.getTotalLocations())
      expect(result.totalLocations).toBe(locationArgs.length)
    })

    it('should reject an odd locationsPerAisle for a two-sided aisle', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 2,
        startLocationType: 'both',
        endLocationType: 'both',
        locationsPerAisle: 7,
        levelCount: 2,
        hasPicking: true
      }

      await expect(useCase.execute(dto)).rejects.toThrow(InvalidLocationsPerAisleException)
      expect(mockCellRepository.create).not.toHaveBeenCalled()
    })

    it('should reject a total of 10 for a two-sided aisle (5 positions per side is not bay-decomposable)', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'both',
        endLocationType: 'both',
        locationsPerAisle: 10,
        levelCount: 2,
        hasPicking: true
      }

      await expect(useCase.execute(dto)).rejects.toThrow(InvalidLocationsPerAisleException)
      expect(mockCellRepository.create).not.toHaveBeenCalled()
    })

    it('should accept a total of 10 for a one-sided aisle (3 + 3 + 4)', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockImplementation(async (cell: CellEntity) =>
        Object.assign(cell, { id: 1 })
      )
      mockAisleRepository.createMany.mockImplementation(async (aisles: AisleEntity[]) =>
        aisles.map((aisle, index) => Object.assign(aisle, { id: index + 1 }))
      )
      mockBayRepository.createMany.mockImplementation(async (bays: BayEntity[]) =>
        bays.map((bay, index) => Object.assign(bay, { id: index + 1 }))
      )
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'odd',
        endLocationType: 'odd',
        locationsPerAisle: 10,
        levelCount: 2,
        hasPicking: true
      }

      const result = await useCase.execute(dto)

      expect(mockCellRepository.create).toHaveBeenCalled()
      expect(result.totalLocations).toBe(20)
    })

    it.each([1, 2, 5])('should reject a total of %i for a one-sided aisle', async total => {
      mockCellRepository.findByNumber.mockResolvedValue(null)

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'even',
        endLocationType: 'even',
        locationsPerAisle: total,
        levelCount: 2,
        hasPicking: true
      }

      await expect(useCase.execute(dto)).rejects.toThrow(InvalidLocationsPerAisleException)
      expect(mockCellRepository.create).not.toHaveBeenCalled()
    })

    it('should skip level 0 locations when hasPicking is false', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)
      mockCellRepository.create.mockResolvedValue(
        new CellEntity(1, new CellValueObject(1), 1, 3, 2, new Date(), new Date())
      )
      mockAisleRepository.createMany.mockResolvedValue([
        new AisleEntity(1, new AisleValueObject(1), true, 1, new Date(), new Date())
      ])
      mockBayRepository.createMany.mockResolvedValue([
        createTestBayEntity({ id: 1, width: 3, startPosition: 0, aisleId: 1 })
      ])
      mockLocationRepository.createMany.mockResolvedValue([])

      const dto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 1,
        startLocationType: 'odd',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 3,
        hasPicking: false
      }

      await useCase.execute(dto)

      const cellArgs = mockCellRepository.create.mock.calls[0][0]
      expect(cellArgs.levelsPerLocation).toBe(2)

      const locationArgs = mockLocationRepository.createMany.mock.calls[0][0]
      expect(locationArgs).toHaveLength(6)
      expect(locationArgs.every((loc: { level: { value: number } }) => loc.level.value !== 0)).toBe(
        true
      )
      const distinctLevels = [
        ...new Set(locationArgs.map((loc: { level: { value: number } }) => loc.level.value))
      ]
      expect(distinctLevels.sort()).toEqual([10, 20])
    })
  })
})
