class WindowAverageRecord {
    private windowSize: number;
    private pointer: number;
    private windowData: number[];
    private averages: number[];
  
    constructor(windowSize: number) {
      this.windowSize = windowSize;
      this.pointer = 0;
      this.windowData = new Array(windowSize).fill(0);
      this.averages = [];
    }
  
    public addData(data: number): void {
      this.windowData[this.pointer] = data;
      this.pointer = (this.pointer + 1) % this.windowSize;
  
      if (this.pointer === 0) {
        const sum = this.windowData.reduce((acc, val) => acc + val, 0);
        const avg = sum / this.windowSize;
        this.averages.push(avg);
      }
    }
  
    public reset(): void {
      this.pointer = 0;
      this.windowData.fill(0);
      this.averages = [];
    }

    public getAverages() {
      return this.averages;
    }
  }
  