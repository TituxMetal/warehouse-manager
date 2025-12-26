export class ObstacleEntity {
  constructor(
    public readonly id: number,
    public readonly type: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly aisleId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Returns a human-readable display name combining type and name
   * Example: "Pillar: Main Support A" or "Fire Equipment: Hose Reel 3"
   */
  getDisplayName(): string {
    return this.name
  }
}
