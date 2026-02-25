import type { BayEntity } from '../entities/Bay.entity'
import type { LocationEntity } from '../entities/Location.entity'

export interface BayWithLocations extends BayEntity {
  locations: LocationEntity[]
}

export interface IBayRepository {
  findById(id: number): Promise<BayEntity | null>
  findByAisleId(aisleId: number): Promise<BayEntity[]>
  findWithLocations(id: number): Promise<BayWithLocations | null>
  create(bay: BayEntity): Promise<BayEntity>
  createMany(bays: BayEntity[]): Promise<BayEntity[]>
  update(bay: BayEntity): Promise<BayEntity>
  delete(id: number): Promise<void>
}
