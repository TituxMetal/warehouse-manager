import { Injectable } from '@nestjs/common'

import type { BlockLocationDto, LocationResponseDto } from '~/warehouse/application/dtos'
import {
  BlockLocationUseCase,
  GetAvailableLocationsUseCase,
  GetBlockedLocationsUseCase,
  GetLocationByIdUseCase,
  GetLocationsByAisleIdUseCase,
  GetLocationsByBayIdUseCase,
  GetPickingLocationsUseCase,
  UnblockLocationUseCase
} from '~/warehouse/application/use-cases/location'

@Injectable()
export class LocationService {
  constructor(
    private readonly getLocationByIdUseCase: GetLocationByIdUseCase,
    private readonly getLocationsByBayIdUseCase: GetLocationsByBayIdUseCase,
    private readonly getLocationsByAisleIdUseCase: GetLocationsByAisleIdUseCase,
    private readonly getPickingLocationsUseCase: GetPickingLocationsUseCase,
    private readonly getAvailableLocationsUseCase: GetAvailableLocationsUseCase,
    private readonly getBlockedLocationsUseCase: GetBlockedLocationsUseCase,
    private readonly blockLocationUseCase: BlockLocationUseCase,
    private readonly unblockLocationUseCase: UnblockLocationUseCase
  ) {}

  async getById(id: number): Promise<LocationResponseDto> {
    return this.getLocationByIdUseCase.execute(id)
  }

  async getByBayId(bayId: number): Promise<LocationResponseDto[]> {
    return this.getLocationsByBayIdUseCase.execute(bayId)
  }

  async getByAisleId(aisleId: number): Promise<LocationResponseDto[]> {
    return this.getLocationsByAisleIdUseCase.execute(aisleId)
  }

  async getPickingLocations(): Promise<LocationResponseDto[]> {
    return this.getPickingLocationsUseCase.execute()
  }

  async getAvailableLocations(): Promise<LocationResponseDto[]> {
    return this.getAvailableLocationsUseCase.execute()
  }

  async getBlockedLocations(): Promise<LocationResponseDto[]> {
    return this.getBlockedLocationsUseCase.execute()
  }

  async block(id: number, dto: BlockLocationDto): Promise<LocationResponseDto> {
    return this.blockLocationUseCase.execute(id, dto)
  }

  async unblock(id: number): Promise<LocationResponseDto> {
    return this.unblockLocationUseCase.execute(id)
  }
}
