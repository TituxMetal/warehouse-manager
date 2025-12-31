import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleMapper } from '~/warehouse/application/mappers'
import { AisleEntity, CellEntity } from '~/warehouse/domain/entities'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { CellWithAisles, ICellRepository } from '~/warehouse/domain/repositories'
import { AisleValueObject, CellValueObject } from '~/warehouse/domain/value-objects'

import { GetCellWithAislesUseCase } from './GetCellWithAisles.uc'

const createTestCellEntity = (overrides?: {
  id?: number
  number?: number
  aislesCount?: number
  locationsPerAisle?: number
  levelsPerLocation?: number
  createdAt?: Date
  updatedAt?: Date
}) =>
  new CellEntity(
    overrides?.id ?? 1,
    new CellValueObject(overrides?.number ?? 4),
    overrides?.aislesCount ?? 20,
    overrides?.locationsPerAisle ?? 200,
    overrides?.levelsPerLocation ?? 6,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

const createTestAisleEntity = (overrides?: {
  id?: number
  number?: number
  isOdd?: boolean
  cellId?: number
  createdAt?: Date
  updatedAt?: Date
}) =>
  new AisleEntity(
    overrides?.id ?? 1,
    new AisleValueObject(overrides?.number ?? 1),
    overrides?.isOdd ?? true,
    overrides?.cellId ?? 1,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('GetCellWithAislesUseCase', () => {
  let useCase: GetCellWithAislesUseCase
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
    useCase = new GetCellWithAislesUseCase(mockCellRepository as unknown as ICellRepository)
  })

  describe('execute', () => {
    it('should return cell with its aisles', async () => {
      const cell = createTestCellEntity({ id: 1 })
      const aisles = [
        createTestAisleEntity({ id: 1, number: 1, isOdd: true, cellId: 1 }),
        createTestAisleEntity({ id: 2, number: 1, isOdd: false, cellId: 1 })
      ]
      const cellWithAisles: CellWithAisles = Object.assign(cell, { aisles })
      mockCellRepository.findWithAisles.mockResolvedValue(cellWithAisles)

      const result = await useCase.execute(1)

      expect(mockCellRepository.findWithAisles).toHaveBeenCalledWith(1)
      expect(result.id).toBe(cell.id)
      expect(result.number).toBe(cell.number.value)
      expect(result.aisles).toHaveLength(2)
      expect(result.aisles[0]).toEqual(AisleMapper.toResponseDto(aisles[0]))
      expect(result.aisles[1]).toEqual(AisleMapper.toResponseDto(aisles[1]))
    })

    it('should return cell with empty aisles array', async () => {
      const cell = createTestCellEntity({ id: 1 })
      const cellWithAisles: CellWithAisles = Object.assign(cell, { aisles: [] })
      mockCellRepository.findWithAisles.mockResolvedValue(cellWithAisles)

      const result = await useCase.execute(1)

      expect(result.aisles).toHaveLength(0)
    })

    it('should throw CellNotFoundException when not found', async () => {
      mockCellRepository.findWithAisles.mockResolvedValue(null)

      await expect(useCase.execute(999)).rejects.toThrow(CellNotFoundException)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockCellRepository.findWithAisles.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
