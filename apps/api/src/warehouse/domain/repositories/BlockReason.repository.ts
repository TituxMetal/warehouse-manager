import type { BlockReasonEntity } from '../entities/BlockReason.entity'

export interface IBlockReasonRepository {
  findById(id: number): Promise<BlockReasonEntity | null>
  findByCode(code: string): Promise<BlockReasonEntity | null>
  findAll(): Promise<BlockReasonEntity[]>
  create(blockReason: BlockReasonEntity): Promise<BlockReasonEntity>
  update(blockReason: BlockReasonEntity): Promise<BlockReasonEntity>
  delete(id: number): Promise<void>
  exists(id: number): Promise<boolean>
  isInUse(id: number): Promise<boolean>
}
