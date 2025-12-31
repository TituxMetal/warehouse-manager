import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { CreateBlockReasonDto } from '~/warehouse/application/dtos'
import { BlockReasonMapper } from '~/warehouse/application/mappers'
import { BlockReasonEntity } from '~/warehouse/domain/entities'
import type { IBlockReasonRepository } from '~/warehouse/domain/repositories'

import { CreateBlockReasonUseCase } from './CreateBlockReason.uc'

const createTestBlockReasonEntity = (overrides?: Partial<BlockReasonEntity>) =>
  new BlockReasonEntity(
    overrides?.id ?? 1,
    overrides?.code ?? 'BR0001',
    overrides?.name ?? 'Test Block Reason',
    overrides?.description ?? 'Test description',
    overrides?.permanent ?? false,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('CreateBlockReasonUseCase', () => {
  let useCase: CreateBlockReasonUseCase
  let mockBlockReasonRepository: {
    findById: Mock<IBlockReasonRepository['findById']>
    findByCode: Mock<IBlockReasonRepository['findByCode']>
    findAll: Mock<IBlockReasonRepository['findAll']>
    create: Mock<IBlockReasonRepository['create']>
    update: Mock<IBlockReasonRepository['update']>
    delete: Mock<IBlockReasonRepository['delete']>
    exists: Mock<IBlockReasonRepository['exists']>
    isInUse: Mock<IBlockReasonRepository['isInUse']>
  }

  beforeEach(() => {
    mockBlockReasonRepository = {
      findById: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findById']>,
      findByCode: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findByCode']>,
      findAll: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findAll']>,
      create: mock(() => {}) as unknown as Mock<IBlockReasonRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IBlockReasonRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBlockReasonRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<IBlockReasonRepository['exists']>,
      isInUse: mock(() => {}) as unknown as Mock<IBlockReasonRepository['isInUse']>
    }
    useCase = new CreateBlockReasonUseCase(
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should create block reason with all fields', async () => {
      const dto: CreateBlockReasonDto = {
        code: 'BR0001',
        name: 'Concrete Pillar',
        description: 'Structural pillar blocking location',
        permanent: true
      }
      const createdEntity = createTestBlockReasonEntity({
        id: 1,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        permanent: dto.permanent
      })
      mockBlockReasonRepository.create.mockResolvedValue(createdEntity)

      const result = await useCase.execute(dto)

      expect(mockBlockReasonRepository.create).toHaveBeenCalled()
      expect(result).toEqual(BlockReasonMapper.toResponseDto(createdEntity))
    })

    it('should create block reason with optional fields as defaults', async () => {
      const dto: CreateBlockReasonDto = {
        code: 'BR0002',
        name: 'Temporary Block'
      }
      const createdEntity = createTestBlockReasonEntity({
        id: 2,
        code: dto.code,
        name: dto.name,
        description: null,
        permanent: false
      })
      mockBlockReasonRepository.create.mockResolvedValue(createdEntity)

      const result = await useCase.execute(dto)

      expect(mockBlockReasonRepository.create).toHaveBeenCalled()
      expect(result).toEqual(BlockReasonMapper.toResponseDto(createdEntity))
    })

    it('should handle repository errors', async () => {
      const dto: CreateBlockReasonDto = {
        code: 'BR0001',
        name: 'Test'
      }
      const error = new Error('Database error')
      mockBlockReasonRepository.create.mockRejectedValue(error)

      await expect(useCase.execute(dto)).rejects.toThrow(error)
    })
  })
})
