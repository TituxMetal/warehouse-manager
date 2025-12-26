export class BlockReasonEntity {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly permanent: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if this block reason is permanent (cannot be removed)
   * Examples: structural pillars, fire equipment
   */
  isPermanent(): boolean {
    return this.permanent
  }

  /**
   * Returns a human-readable display name with permanence indicator
   * Example: "Concrete Pillar (Permanent)" or "Temporary Storage (Temporary)"
   */
  getDisplayName(): string {
    const suffix = this.isPermanent() ? '(Permanent)' : '(Temporary)'

    return `${this.name} ${suffix}`
  }
}
