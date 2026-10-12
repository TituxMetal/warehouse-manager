import type { ValidationArguments, ValidatorConstraintInterface } from 'class-validator'
import { IsBoolean, IsIn, IsInt, IsNotEmpty, Max, Min, Validate } from 'class-validator'
import { ValidatorConstraint } from 'class-validator'

import type { LocationType } from '~/warehouse/domain/services'
import { CellStructureCalculator } from '~/warehouse/domain/services'

/**
 * Object-level constraint for `locationsPerAisle` (decisions 003 and 004).
 *
 * A per-field decorator cannot express this rule: legality depends on the aisle
 * configuration (`startLocationType` / `endLocationType`), not on `locationsPerAisle`
 * alone. For example, a total of 10 is illegal for a two-sided aisle (5 positions per
 * side, not a sum of 3- and 4-position bays) but legal for a one-sided one (3 + 3 + 4).
 *
 * "One-sided" is derived from the configurations `CellStructureCalculator` actually
 * produces rather than from a parallel interpretation: `generateAisleConfiguration`
 * ignores `endLocationType` for a single aisle and forces middle aisles to `both`, so a
 * multi-aisle cell is two-sided even when both endpoints are `odd`/`even`.
 *
 * NOTE: no `ValidationPipe` is registered in the application yet, so this constraint is
 * declared but inert over HTTP. It is proven directly with `class-validator`'s
 * `validate()` in `CreateCell.dto.spec.ts`. The rule is *enforced* today in
 * `CreateCellUseCase`, which throws `InvalidLocationsPerAisleException`.
 */
@ValidatorConstraint({ name: 'isLegalLocationsPerAisle', async: false })
export class IsLegalLocationsPerAisleConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    // Non-integer / missing values are reported by the field-level decorators; do not
    // duplicate those errors here.
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return true
    }

    const dto = args.object as CreateCellDto

    if (
      dto.aisleStart === undefined ||
      dto.aisleEnd === undefined ||
      dto.startLocationType === undefined ||
      dto.endLocationType === undefined
    ) {
      return true
    }

    const calculator = new CellStructureCalculator()
    const aisleConfig = calculator.generateAisleConfiguration(
      dto.aisleStart,
      dto.aisleEnd,
      dto.startLocationType as LocationType,
      dto.endLocationType as LocationType
    )

    return calculator.evaluateLocationsPerAisleRule(value, aisleConfig) === null
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateCellDto
    const calculator = new CellStructureCalculator()
    const reason =
      dto.aisleStart !== undefined &&
      dto.aisleEnd !== undefined &&
      dto.startLocationType !== undefined &&
      dto.endLocationType !== undefined
        ? calculator.evaluateLocationsPerAisleRule(
            args.value as number,
            calculator.generateAisleConfiguration(
              dto.aisleStart,
              dto.aisleEnd,
              dto.startLocationType as LocationType,
              dto.endLocationType as LocationType
            )
          )
        : null

    return `locationsPerAisle is invalid for the requested aisle configuration: ${reason ?? 'no valid side length can be built'}`
  }
}

export class CreateCellDto {
  @IsNotEmpty({ message: 'cellNumber is required' })
  @IsInt({ message: 'cellNumber must be an integer' })
  @Min(1, { message: 'cellNumber must be at least 1' })
  @Max(9, { message: 'cellNumber must be at most 9' })
  cellNumber?: number

  @IsNotEmpty({ message: 'aisleStart is required' })
  @IsInt({ message: 'aisleStart must be an integer' })
  @Min(1, { message: 'aisleStart must be at least 1' })
  aisleStart?: number

  @IsNotEmpty({ message: 'aisleEnd is required' })
  @IsInt({ message: 'aisleEnd must be an integer' })
  @Min(1, { message: 'aisleEnd must be at least 1' })
  aisleEnd?: number

  @IsNotEmpty({ message: 'startLocationType is required' })
  @IsIn(['odd', 'even', 'both'], { message: 'startLocationType must be one of odd, even, both' })
  startLocationType?: string

  @IsNotEmpty({ message: 'endLocationType is required' })
  @IsIn(['odd', 'even', 'both'], { message: 'endLocationType must be one of odd, even, both' })
  endLocationType?: string

  // The field-level bound is only the domain floor (a bay has at least 3 positions).
  // Evenness, the two-sided minimum and the "never 5" rule are configuration-dependent
  // and live in the object-level constraint below (decisions 003 and 004).
  @IsNotEmpty({ message: 'locationsPerAisle is required' })
  @IsInt({ message: 'locationsPerAisle must be an integer' })
  @Min(3, { message: 'locationsPerAisle must be at least 3 (one bay needs 3 positions)' })
  @Validate(IsLegalLocationsPerAisleConstraint)
  locationsPerAisle?: number

  @IsNotEmpty({ message: 'levelCount is required' })
  @IsInt({ message: 'levelCount must be an integer' })
  @Min(2, { message: 'levelCount must be at least 2' })
  levelCount?: number

  @IsNotEmpty({ message: 'hasPicking is required' })
  @IsBoolean({ message: 'hasPicking must be a boolean' })
  hasPicking?: boolean
}
