export class LowPassFilter {
   private readonly alpha: number;
   public filteredValue = 0;

   constructor(alpha = 0.1) {
      this.alpha = alpha;
   }

   public filter(value: number): number {
      this.filteredValue =
         this.alpha * value + (1 - this.alpha) * this.filteredValue;
      return this.filteredValue;
   }

   public reset() {
      this.filteredValue = 0;
   }
}
