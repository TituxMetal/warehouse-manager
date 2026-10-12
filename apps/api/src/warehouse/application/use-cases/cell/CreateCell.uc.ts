import { Injectable } from '@nestjs/common'

import type { CellResponseDto, CreateCellDto } from '~/warehouse/application/dtos'
import { AisleEntity, BayEntity, CellEntity, LocationEntity } from '~/warehouse/domain/entities'
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
import { CellStructureCalculator, LocationType } from '~/warehouse/domain/services'
import {
  AisleValueObject,
  CellValueObject,
  LevelValueObject,
  PositionValueObject
} from '~/warehouse/domain/value-objects'

import { CellMapper } from '../../mappers'

@Injectable()
export class CreateCellUseCase {
  constructor(
    private readonly cellRepository: ICellRepository,
    private readonly aisleRepository: IAisleRepository,
    private readonly bayRepository: IBayRepository,
    private readonly locationRepository: ILocationRepository
  ) {}

  async execute(dto: CreateCellDto): Promise<CellResponseDto> {
    const existingCell = await this.cellRepository.findByNumber(
      new CellValueObject(dto.cellNumber!)
    )

    if (existingCell) {
      throw new CellAlreadyExistsException(dto.cellNumber!)
    }

    if (dto.aisleStart! > dto.aisleEnd!) {
      throw new InvalidAisleRangeException(dto.aisleStart!, dto.aisleEnd!)
    }

    const calculator = new CellStructureCalculator()
    const aisleConfig = calculator.generateAisleConfiguration(
      dto.aisleStart!,
      dto.aisleEnd!,
      dto.startLocationType! as LocationType,
      dto.endLocationType! as LocationType
    )
    const locationsPerAisleRule = calculator.evaluateLocationsPerAisleRule(
      dto.locationsPerAisle!,
      aisleConfig
    )

    if (locationsPerAisleRule) {
      throw new InvalidLocationsPerAisleException(dto.locationsPerAisle!, locationsPerAisleRule)
    }

    // The number of positions on the side each aisle actually has (decisions 002/004):
    // half the entered total for a two-sided cell, the full total for a one-sided one.
    // Under decision 005 this is also the value stored on `CellEntity.locationsPerAisle`:
    // the field holds the per-side count, and `getTotalLocations()` multiplies it by the
    // number of aisle records (one per side) to recover the `Location` row count.
    const positionsPerSide = calculator.calculatePositionsPerSide(
      dto.locationsPerAisle!,
      aisleConfig
    )
    const bayDistribution = calculator.calculateBayDistribution(positionsPerSide)
    const baySpecs = calculator.generateBayStartPositions(bayDistribution)
    const allLevels = calculator.generateLevels(dto.levelCount!)
    const locationLevels = dto.hasPicking ? allLevels : allLevels.filter(level => level !== 0)
    const aisleSpecs = aisleConfig.flatMap(config => {
      if (config.locationType === 'both') {
        return [
          { number: config.number, isOdd: true },
          { number: config.number, isOdd: false }
        ]
      }

      return [{ number: config.number, isOdd: config.locationType === 'odd' }]
    })
    const levelsPerLocation = locationLevels.length

    // One timestamp for the whole orchestration, so every record of a cell shares it.
    const now = new Date()
    // Decision 005: `CellEntity.locationsPerAisle` stores the number of positions on ONE
    // SIDE of an aisle — the same quantity the bay specification is built from above.
    // `aislesCount` counts aisle records (one per side), so
    // `getTotalLocations()` = records × per-side × levels equals the number of `Location`
    // rows created. The entered `dto.locationsPerAisle` is a total and is NOT stored.
    const cellToCreate = new CellEntity(
      0,
      new CellValueObject(dto.cellNumber!),
      aisleSpecs.length,
      positionsPerSide,
      levelsPerLocation,
      now,
      now
    )
    const createdCell = await this.cellRepository.create(cellToCreate)
    const aislesToCreate = aisleSpecs.map(
      spec =>
        new AisleEntity(0, new AisleValueObject(spec.number), spec.isOdd, createdCell.id, now, now)
    )
    const createdAisles = await this.aisleRepository.createMany(aislesToCreate)
    const baysToCreate: BayEntity[] = []

    for (const aisle of createdAisles) {
      for (const [bayIndex, baySpec] of baySpecs.entries()) {
        baysToCreate.push(
          new BayEntity(0, bayIndex + 1, baySpec.width, baySpec.startPosition, aisle.id, now, now)
        )
      }
    }

    const createdBays = await this.bayRepository.createMany(baysToCreate)
    const aisleIdToIsOdd = new Map<number, boolean>()

    for (const aisle of createdAisles) {
      aisleIdToIsOdd.set(aisle.id, aisle.isOdd)
    }

    const locationsToCreate: LocationEntity[] = []

    for (const bay of createdBays) {
      const isOdd = aisleIdToIsOdd.get(bay.aisleId)!
      const positions = bay.getPositions(isOdd)

      for (const position of positions) {
        for (const level of locationLevels) {
          locationsToCreate.push(
            new LocationEntity(
              0,
              new PositionValueObject(position),
              new LevelValueObject(level),
              'available',
              bay.aisleId,
              bay.id,
              null,
              now,
              now
            )
          )
        }
      }
    }

    // TODO(infra): wrap the four create* calls in a transaction once the Prisma layer
    // lands (Phase 4). Without it, a failure during location persistence leaves an
    // orphan Cell + Aisles + Bays in the database.
    await this.locationRepository.createMany(locationsToCreate)

    return CellMapper.toResponseDto(createdCell)
  }
}
