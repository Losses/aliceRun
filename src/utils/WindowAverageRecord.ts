export class WindowAverageRecord {
  private windowSize: number;
  private pointer: number;
  private windowData: number[];
  protected points: number[];

  constructor(windowSize: number) {
    this.windowSize = windowSize;
    this.pointer = 0;
    this.windowData = new Array(windowSize).fill(0);
    this.points = [];
  }

  public addData(data: number): void {
    this.windowData[this.pointer] = data;
    this.pointer = (this.pointer + 1) % this.windowSize;

    if (this.pointer === 0) {
      const sum = this.windowData.reduce((acc, val) => acc + val, 0);
      const avg = sum / this.windowSize;
      this.points.push(avg);
    }
  }

  public getAverageValue() {
    if (this.points.length === 0) {
      return 0;
    }

    const sum = this.points.reduce((acc, curr) => acc + curr, 0);
    return sum / this.points.length;
  }

  public reset(): void {
    this.pointer = 0;
    this.windowData.fill(0);
    this.points = [];
  }
}
