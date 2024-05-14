export class RateEstimator {
   private timestamps: number[] = [];
   private readonly windowSize: number = 10000; // 10 seconds window size in milliseconds

   constructor() {
      this.timestamps = [];
   }

   // Record a new timestamp
   public record(): void {
      const now = Date.now();
      this.timestamps.push(now);
      this.cleanup();
   }

   // Remove timestamps that are outside the 10-second window
   private cleanup(): void {
      const now = Date.now();
      while (
         this.timestamps.length > 0 &&
         this.timestamps[0] < now - this.windowSize
      ) {
         this.timestamps.shift();
      }
   }

   // Reset the rate estimator by clearing the timestamps
   public reset(): void {
      this.timestamps = [];
   }

   // Estimate the rate per minute based on the data of the last 10 seconds
   public estimateRate(): number {
      this.cleanup();
      const countLastTenSeconds = this.timestamps.length;
      const ratePerMinute = (countLastTenSeconds / 10) * 60;
      return ratePerMinute;
   }
}
