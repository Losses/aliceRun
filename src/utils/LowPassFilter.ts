export class LowPassFilter {
    private readonly alpha: number;
    public filteredValue: number = 0;
  
    constructor(alpha: number = 0.1) {
      this.alpha = alpha;
    }
  
    public filter(value: number): number {
      this.filteredValue = this.alpha * value + (1 - this.alpha) * this.filteredValue;
      return this.filteredValue;
    }
  }