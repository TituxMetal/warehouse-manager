import { Injectable } from '@nestjs/common'

import type { CellResponseDto, CreateCellDto } from '~/warehouse/application/dtos'
import { AisleEntity, BayEntity, CellEntity, LocationEntity } from '~/warehouse/domain/entities'
import {
  CellAlreadyExistsException,
  InvalidAisleRangeException
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
    const isUniqueCellNumber = await this.cellRepository.findByNumber(
      new CellValueObject(dto.cellNumber!)
    )

    if (isUniqueCellNumber) {
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
    const positionRanges = calculator.calculatePositionRanges(dto.locationsPerAisle!)
    const bayDistribution = calculator.calculateBayDistribution(positionRanges.odd.count)
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
    const locationsPerAisle = positionRanges.odd.count
    const levelsPerLocation = locationLevels.length
    const cellToCreate = new CellEntity(
      0,
      new CellValueObject(dto.cellNumber!),
      aisleSpecs.length,
      locationsPerAisle,
      levelsPerLocation,
      new Date(),
      new Date()
    )
    const createdCell = await this.cellRepository.create(cellToCreate)
    const aislesToCreate = aisleSpecs.map(
      spec =>
        new AisleEntity(
          0,
          new AisleValueObject(spec.number),
          spec.isOdd,
          createdCell.id,
          new Date(),
          new Date()
        )
    )
    const createdAisles = await this.aisleRepository.createMany(aislesToCreate)
    const baysToCreate: BayEntity[] = []

    for (const aisle of createdAisles) {
      for (const [bayIndex, baySpec] of baySpecs.entries()) {
        baysToCreate.push(
          new BayEntity(
            0,
            bayIndex + 1,
            baySpec.width,
            baySpec.startPosition,
            aisle.id,
            new Date(),
            new Date()
          )
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
              new Date(),
              new Date()
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
