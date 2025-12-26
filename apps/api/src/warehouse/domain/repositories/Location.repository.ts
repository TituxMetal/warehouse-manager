import type { LocationEntity } from '../entities/Location.entity'

export interface ILocationRepository {
  findById(id: number): Promise<LocationEntity | null>
  findByBayId(bayId: number): Promise<LocationEntity[]>
  findByAisleId(aisleId: number): Promise<LocationEntity[]>
  create(location: LocationEntity): Promise<LocationEntity>
  update(location: LocationEntity): Promise<LocationEntity>
  delete(id: number): Promise<void>
}
