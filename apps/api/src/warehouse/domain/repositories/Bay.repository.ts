import type { BayEntity } from '../entities/Bay.entity'

export interface IBayRepository {
  findById(id: number): Promise<BayEntity | null>
  findByAisleId(aisleId: number): Promise<BayEntity[]>
  create(bay: BayEntity): Promise<BayEntity>
  update(bay: BayEntity): Promise<BayEntity>
  delete(id: number): Promise<void>
}
