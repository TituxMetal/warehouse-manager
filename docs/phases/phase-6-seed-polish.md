# Phase 6: Seed Data & Polish

**Goal:** Create realistic test data and polish the user experience.

---

## Steps

| Step | Action                                              | Verification                |
| ---- | --------------------------------------------------- | --------------------------- |
| 6.1  | Create `apps/api/prisma/seed.ts`                    | Seed script exists          |
| 6.2  | Seed 3 realistic cells with aisles, bays, locations | Data in DB                  |
| 6.3  | Include tunnel bays and blocked locations           | Variety in data             |
| 6.4  | Add loading skeletons to components                 | Skeletons show              |
| 6.5  | Add error handling and error states                 | Errors displayed            |
| 6.6  | Add breadcrumb navigation                           | Breadcrumbs work            |
| 6.7  | Add empty states                                    | Empty states show           |
| 6.8  | Final UI polish                                     | Matches design              |
| 6.9  | Run all checks                                      | Tests, typecheck, lint pass |
| 6.10 | Commit with atomic commits                          | Committed                   |
| 6.11 | Update VISION.md progress                           | Checklist updated           |
| 6.12 | Create PR to develop                                | PR created                  |
| 6.13 | Merge to main and tag release                       | v1.0.0 released             |

---

## Seed Data Structure

Create realistic warehouse data:

```text
Cell 1 "Picking Zone A"
├── 10 aisles (001-010)
├── 50 positions per aisle
├── 6 levels (00-50)
├── 2 tunnel bays (positions 25-28)
└── Some blocked locations (pillars)

Cell 2 "Reserve Zone B"
├── 5 aisles (001-005)
├── 40 positions per aisle
├── 6 levels (00-50)
└── Mostly reserve (levels 10-50 only used)

Cell 3 "Shipping Dock"
├── 3 aisles (001-003)
├── 20 positions per aisle
├── 2 levels (00, 10)
└── Ground level for staging
```

---

## Seed Script Pattern

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient } from '../generated'

const prisma = new PrismaClient()

const main = async () => {
  // Clear existing data
  await prisma.location.deleteMany()
  await prisma.bay.deleteMany()
  await prisma.aisle.deleteMany()
  await prisma.cell.deleteMany()
  await prisma.obstacle.deleteMany()
  await prisma.blockReason.deleteMany()

  // Create block reasons
  const pillarReason = await prisma.blockReason.create({
    data: { code: 'PILLAR', name: 'Concrete Pillar', permanent: true }
  })

  // Create Cell 1
  const cell1 = await prisma.cell.create({
    data: {
      name: 'Picking Zone A',
      aisleCount: 10,
      positionsPerAisle: 50,
      levelsPerPosition: 6
    }
  })

  // Create aisles for Cell 1
  for (let aisleNum = 1; aisleNum <= 10; aisleNum++) {
    // Odd side
    const aisleOdd = await prisma.aisle.create({
      data: {
        number: aisleNum,
        isOdd: true,
        cellId: cell1.id
      }
    })

    // Even side
    const aisleEven = await prisma.aisle.create({
      data: {
        number: aisleNum,
        isOdd: false,
        cellId: cell1.id
      }
    })

    // Create bays and locations...
  }

  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:

```json
{
  "scripts": {
    "db:seed": "bun run prisma/seed.ts"
  }
}
```

---

## UX Polish Checklist

- [ ] Loading skeletons for all data-dependent components
- [ ] Error boundaries with user-friendly messages
- [ ] Empty states when no data exists
- [ ] Breadcrumb navigation (Home > Cell > Aisle)
- [ ] Hover states on interactive elements
- [ ] Focus states for accessibility
- [ ] Consistent spacing and alignment
- [ ] Responsive layout (works on tablet minimum)

---

## Commits for this Phase

Suggested atomic commits:

1. `feat(api): add seed script with block reasons`
2. `feat(api): seed Cell 1 with aisles and locations`
3. `feat(api): seed Cells 2 and 3`
4. `feat(web): add loading skeletons`
5. `feat(web): add error handling and empty states`
6. `feat(web): add breadcrumb navigation`
7. `style(web): final UI polish`
8. `docs: update VISION.md for Phase 6 completion`
