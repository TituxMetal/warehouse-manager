# Bay Concept: Physical vs Database Model

> A clarification document born from a coaching session discussion.

---

## The Physical Reality

In a warehouse:

- **Uprights (Montants)**: Vertical steel columns
- **Beams (Lisses)**: Horizontal rails connecting two uprights at a specific height
- **Bay (Travée)**: Physically, ONE beam between two uprights = ONE level

```text
Physical view: Each beam is a separate physical "bay"

     Upright 1                              Upright 2
         │                                      │
         │   ════════════════════════════════   │  ← Beam at Level 50 (physical bay)
         │   ════════════════════════════════   │  ← Beam at Level 40 (physical bay)
         │   ════════════════════════════════   │  ← Beam at Level 30 (physical bay)
         │   ════════════════════════════════   │  ← Beam at Level 20 (physical bay)
         │   ════════════════════════════════   │  ← Beam at Level 10 (physical bay)
         │                                      │
      ═══╧══════════════════════════════════════╧═══  Ground (Level 00)
```

---

## Two Mental Models

### OLD Understanding: One Bay Per Level

> "Each physical beam = one database Bay record"

```text
Aisle 16 ODD, Cell 4, width=4, 6 levels

Database would contain:
┌─────────────────────────────────────────────────────────┐
│ Bay Records (6 per "column" of uprights!)               │
├─────────────────────────────────────────────────────────┤
│ Bay #1:  aisleId=16, number=1, width=4, level=00        │
│ Bay #2:  aisleId=16, number=1, width=4, level=10        │
│ Bay #3:  aisleId=16, number=1, width=4, level=20        │
│ Bay #4:  aisleId=16, number=1, width=4, level=30        │
│ Bay #5:  aisleId=16, number=1, width=4, level=40        │
│ Bay #6:  aisleId=16, number=1, width=4, level=50        │
│ Bay #7:  aisleId=16, number=2, width=3, level=00        │
│ Bay #8:  aisleId=16, number=2, width=3, level=10        │
│ ... and so on                                           │
└─────────────────────────────────────────────────────────┘

Problem: If you have 20 aisles × 50 bays × 6 levels = 6,000 Bay records!
         And most data (width, startPosition) is DUPLICATED.
```

### NEW Understanding: One Bay Per Column

> "One Bay record represents the configuration between two uprights, shared across all levels"

```text
Aisle 16 ODD, Cell 4, width=4, 6 levels

Database contains:
┌─────────────────────────────────────────────────────────┐
│ Bay Records (1 per "column" of uprights)                │
├─────────────────────────────────────────────────────────┤
│ Bay #1:  aisleId=16, number=1, width=4, startPosition=0 │
│ Bay #2:  aisleId=16, number=2, width=3, startPosition=4 │
│ ... much fewer records                                  │
└─────────────────────────────────────────────────────────┘

Location records carry the level:
┌─────────────────────────────────────────────────────────┐
│ Location Records (Bay #1 has 4 positions × 6 levels)    │
├─────────────────────────────────────────────────────────┤
│ Location: bayId=1, position=1, level=00                 │
│ Location: bayId=1, position=1, level=10                 │
│ Location: bayId=1, position=1, level=20                 │
│ Location: bayId=1, position=3, level=00                 │
│ Location: bayId=1, position=3, level=10                 │
│ ... (24 locations for Bay #1: 4 positions × 6 levels)   │
│                                                         │
│ Location: bayId=2, position=9, level=00                 │
│ Location: bayId=2, position=9, level=10                 │
│ ... (18 locations for Bay #2: 3 positions × 6 levels)   │
└─────────────────────────────────────────────────────────┘

Benefit: 20 aisles × 50 bays = 1,000 Bay records (not 6,000!)
         No duplication of width/startPosition.
```

---

## Concrete Example: Address `4-016-0003-10`

```text
Address breakdown:
  Cell:     4
  Aisle:    016 (ODD side, positions are 1, 3, 5, 7, 9...)
  Position: 0003
  Level:    10

Finding the location:
  1. Find Aisle 16 in Cell 4 where isOdd=true
  2. Find Bay where startPosition covers position 3
     → Bay #1 (startPosition=0, width=4) covers positions 1, 3, 5, 7
  3. Find Location where bayId=1, position=3, level=10
```

```text
Visual representation:

     Bay #1 (width=4)              Bay #2 (width=3)
     startPosition=0               startPosition=4
     ┌─────────────────────────┐   ┌──────────────────┐
     │ Pos 1  Pos 3  Pos 5  Pos 7 │ Pos 9  Pos 11 Pos 13
     │                         │   │                  │
L 50 │  ▓▓▓    ▓▓▓    ▓▓▓    ▓▓▓ │   ▓▓▓    ▓▓▓    ▓▓▓ │
L 40 │  ▓▓▓    ▓▓▓    ▓▓▓    ▓▓▓ │   ▓▓▓    ▓▓▓    ▓▓▓ │
L 30 │  ▓▓▓    ▓▓▓    ▓▓▓    ▓▓▓ │   ▓▓▓    ▓▓▓    ▓▓▓ │
L 20 │  ▓▓▓    ▓▓▓    ▓▓▓    ▓▓▓ │   ▓▓▓    ▓▓▓    ▓▓▓ │
L 10 │  ▓▓▓   [▓▓▓]   ▓▓▓    ▓▓▓ │   ▓▓▓    ▓▓▓    ▓▓▓ │  ← [▓▓▓] = 4-016-0003-10
L 00 │  ░░░    ░░░    ░░░    ░░░ │   ░░░    ░░░    ░░░ │
     └─────────────────────────┘   └──────────────────┘

All 24 locations in Bay #1 reference the SAME Bay record.
All 18 locations in Bay #2 reference the SAME Bay record.
```

---

## Why This Matters for `getPositions()`

The `getPositions(isOdd)` method returns the **position numbers** for a bay:

```typescript
// Bay #1: startPosition=0, width=4
bay1.getPositions(true) // isOdd=true → [1, 3, 5, 7]
bay1.getPositions(false) // isOdd=false → [2, 4, 6, 8]

// Bay #2: startPosition=4, width=3
bay2.getPositions(true) // isOdd=true → [9, 11, 13]
bay2.getPositions(false) // isOdd=false → [10, 12, 14]
```

These position numbers are the same for ALL levels because the bay configuration doesn't change
vertically.

---

## Schema Confirmation

```prisma
model Bay {
  id            Int @id @default(autoincrement())
  number        Int           // Bay number within aisle (1, 2, 3...)
  width         Int           // 3 or 4 positions
  startPosition Int           // Base position index (0, 4, 7...)
  aisleId       Int
  locations     Location[]    // All locations at all levels

  @@unique([aisleId, number]) // One bay per number per aisle (NOT per level!)
}

model Location {
  position  Int               // The actual position number (1, 3, 5...)
  level     Int               // The level (00, 10, 20...)
  bayId     Int
  aisleId   Int
  // ...
}
```

---

_Document created: 2026-01-01_ _Context: Phase 4 Domain Services - Bay schema clarification_
