# Cell Structure Calculation

> Working through a real warehouse cell scenario to validate our domain model.

---

## The Scenario

A warehouse cell with:

| Property           | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| Aisles             | 20 to 37                                                |
| Aisle 20-36        | Both odd AND even sides                                 |
| Aisle 37           | Only odd side                                           |
| Positions per side | 104 (odd: 1,3,5...207, even: 2,4,6...208)               |
| Levels             | 5 (00, 10, 20, 30, 40)                                  |
| Tunnel positions   | Odd: 95-101, Even: 96-102                               |
| Tunnel levels      | Only 30, 40 exist (00, 10, 20 are open for circulation) |

---

## Step 1: Count Aisle Sides

```
Aisles 20-36: 17 aisles × 2 sides (odd + even) = 34 aisle records
Aisle 37: 1 aisle × 1 side (odd only) = 1 aisle record

Total aisle records: 35
```

---

## Step 2: Count Positions Per Side

```
Odd positions:  1, 3, 5, 7, ..., 207
Count = (207 - 1) / 2 + 1 = 104 positions

Even positions: 2, 4, 6, 8, ..., 208
Count = (208 - 2) / 2 + 1 = 104 positions
```

---

## Step 3: Identify Tunnel Positions

```
Odd side tunnel:  95, 97, 99, 101 → 4 positions
Even side tunnel: 96, 98, 100, 102 → 4 positions
```

These positions exist but only have 2 levels (30, 40) instead of 5.

---

## Step 4: Count Locations

**Per aisle side:**

```
Normal positions: 104 - 4 = 100 positions
Normal locations: 100 × 5 levels = 500

Tunnel positions: 4 positions
Tunnel locations: 4 × 2 levels = 8

Total per side: 508 locations
```

**Total for entire cell:**

```
35 aisle sides × 508 locations = 17,780 locations
```

---

## Step 5: Calculate Bays

### The Bay Width Problem

We have 104 positions per aisle side. We need to divide them into bays of:

- **Width 3**: minimum (physical beam constraint)
- **Width 4**: maximum (typical)

### Algorithm: Maximize 4-Position Bays

```typescript
function calculateBayDistribution(totalPositions: number): { width3: number; width4: number } {
  const maxFours = Math.floor(totalPositions / 4)
  const remainder = totalPositions % 4

  switch (remainder) {
    case 0:
      // Perfect fit: all 4-position bays
      // 104 = 26 × 4
      return { width3: 0, width4: maxFours }

    case 1:
      // 4k + 1: Replace two 4-bays with three 3-bays
      // 101 = 23×4 + 3×3 = 92 + 9
      return { width3: 3, width4: maxFours - 2 }

    case 2:
      // 4k + 2: Replace one 4-bay with two 3-bays
      // 102 = 24×4 + 2×3 = 96 + 6
      return { width3: 2, width4: maxFours - 1 }

    case 3:
      // 4k + 3: Add one 3-bay
      // 103 = 25×4 + 1×3 = 100 + 3
      return { width3: 1, width4: maxFours }
  }
}
```

### For Our Scenario (104 positions)

```
104 ÷ 4 = 26 remainder 0

Result: 26 bays of width 4, 0 bays of width 3
```

### Total Bay Count

```
35 aisle sides × 26 bays = 910 Bay records
```

---

## Step 6: Validate getPositions()

Can `getPositions()` handle 104 positions across 26 bays?

```typescript
// Bay 1: startPosition=0, width=4
bay1.getPositions(true) // → [1, 3, 5, 7]

// Bay 2: startPosition=4, width=4
bay2.getPositions(true) // → [9, 11, 13, 15]

// Bay 26: startPosition=100, width=4
bay26.getPositions(true) // → [201, 203, 205, 207]

// Verification:
// startPosition=100 → basePositions: 100, 101, 102, 103
// Odd formula: base * 2 + 1 → 201, 203, 205, 207 ✓
```

**Yes, getPositions() handles this correctly!**

---

## Step 7: Bay Placement Strategy

### Option A: All 4-Position Bays (Simple)

When positions divide evenly by 4:

```
Bay 1:  startPosition=0   → positions 1, 3, 5, 7
Bay 2:  startPosition=4   → positions 9, 11, 13, 15
Bay 3:  startPosition=8   → positions 17, 19, 21, 23
...
Bay 26: startPosition=100 → positions 201, 203, 205, 207
```

### Option B: Mixed Widths (When Needed)

For 103 positions (remainder 3):

```
25 bays of width 4 = 100 positions
1 bay of width 3 = 3 positions
Total = 103 ✓
```

**Placement question: Where to put the 3-bay?**

Options:

1. **At the end**: Last bay is width 3
2. **At the start**: First bay is width 3
3. **Near tunnel**: Align 3-bay with tunnel boundary

### Recommended: Place 3-Bays at the End

Simpler calculation, predictable structure:

```
Bay 1-25:  width=4, startPosition = (bayNumber-1) × 4
Bay 26:    width=3, startPosition = 100
```

---

## Step 8: Handling the Tunnel

The tunnel is at positions 95-101 (odd) / 96-102 (even).

### Which bays contain tunnel positions?

For odd side (positions 95, 97, 99, 101):

```
95 = odd position, basePosition = (95-1)/2 = 47
Bay containing position 95: floor(47/4) + 1 = Bay 12 (startPosition=44)

Bay 12: startPosition=44, width=4 → basePositions 44,45,46,47 → positions 89,91,93,95
Bay 13: startPosition=48, width=4 → basePositions 48,49,50,51 → positions 97,99,101,103
```

So tunnel spans parts of **Bay 12 and Bay 13**.

### Location Creation Logic

When creating locations for tunnel bays:

```typescript
for (const level of [0, 10, 20, 30, 40]) {
  for (const position of bay.getPositions(isOdd)) {
    const isTunnelPosition = position >= 95 && position <= 101
    const isTunnelLevel = level <= 20

    if (isTunnelPosition && isTunnelLevel) {
      // Skip - no physical location here (open for circulation)
      continue
    }

    // Create location
    createLocation({ bayId, position, level })
  }
}
```

---

## Summary

| Metric                     | Value            |
| -------------------------- | ---------------- |
| Aisle records              | 35               |
| Positions per side         | 104              |
| Bays per side              | 26 (all width=4) |
| **Total Bay records**      | **910**          |
| Locations per side         | 508              |
| **Total Location records** | **17,780**       |

### Algorithm Needed in CellStructureCalculator

```typescript
interface BayConfiguration {
  width3Count: number
  width4Count: number
  totalBays: number
}

calculateBayDistribution(totalPositions: number): BayConfiguration

generateBayStartPositions(config: BayConfiguration): { startPosition: number; width: number }[]
```

---

_Document created: 2026-01-01_ _Context: Phase 4 Domain Services - Cell structure calculation
analysis_
