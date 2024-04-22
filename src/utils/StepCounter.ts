import { LowPassFilter } from "./LowPassFilter";
import { IAcceleroMeter, IPacket } from "./joyCon/nintendoSwitch/JoyCon";

enum StepState {
    WAITING_FOR_PEAK,
    WAITING_FOR_TROUGH
  }
  
export class StepCounter {
    private static readonly STEP_THRESHOLD: number = 1.2;
    private static readonly MIN_TIME_BETWEEN_STEPS_MS: number = 500;
    private static readonly FILTER_ALPHA: number = 0.1;
  
    private lastStepTimestamp: number = 0;
    private stepCount: number = 0;
    private state: StepState = StepState.WAITING_FOR_PEAK;
    private lowPassFilterX: LowPassFilter = new LowPassFilter(StepCounter.FILTER_ALPHA);
    private lowPassFilterY: LowPassFilter = new LowPassFilter(StepCounter.FILTER_ALPHA);
    private lowPassFilterZ: LowPassFilter = new LowPassFilter(StepCounter.FILTER_ALPHA);
  
    public processPacket(packet: IPacket): void {
      if (!packet.accelerometers) {
        return;
      }
  
      const now = Date.now();
      const accelData: IAcceleroMeter = packet.accelerometers[packet.accelerometers.length - 1];
  
      // Applying low-pass filter
      const filteredX = this.lowPassFilterX.filter(accelData.x.acc);
      const filteredY = this.lowPassFilterY.filter(accelData.y.acc);
      const filteredZ = this.lowPassFilterZ.filter(accelData.z.acc);
  
      // Calculating acceleration after filtering
      const magnitude = this.calculateMagnitude(filteredX, filteredY, filteredZ);
  
      switch (this.state) {
        case StepState.WAITING_FOR_PEAK:
          if (magnitude > StepCounter.STEP_THRESHOLD) {
            if (now - this.lastStepTimestamp > StepCounter.MIN_TIME_BETWEEN_STEPS_MS) {
              this.stepCount++;
              this.lastStepTimestamp = now;
              console.log(`Step detected. Total steps: ${this.stepCount}`);
            }
            this.state = StepState.WAITING_FOR_TROUGH;
          }
          break;
        case StepState.WAITING_FOR_TROUGH:
          if (magnitude < StepCounter.STEP_THRESHOLD) {
            this.state = StepState.WAITING_FOR_PEAK;
          }
          break;
      }
    }
  
    private calculateMagnitude(x: number, y: number, z: number): number {
      return Math.sqrt(x * x + y * y + z * z);
    }
  
    public getStepCount(): number {
      return this.stepCount;
    }
  }