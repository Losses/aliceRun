import Stats from 'stats.js';

import { accX, accY, accZ, magnitude, filteredAccX, filteredAccY, filteredAccZ } from "../effects/StatsEffect";
import { LowPassFilter } from "./LowPassFilter";
import { IAcceleroMeter, IPacket } from "./joyCon/nintendoSwitch/JoyCon";

enum StepState {
  WAITING_FOR_PEAK,
  WAITING_FOR_TROUGH
}

class NumberRecord {
  private maxValue = 0;
  private _value = 0;

  constructor(
    private panel: Stats.Panel,
    private _update?: (x: number) => void,
  ) {
  }

  get value() { return this._value };
  set value(x: number) {
    this._update?.(x);
    this.maxValue = Math.max(this.maxValue, x);
    this._value = x;
    this.panel.update(x, this.maxValue);
  }
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

  private filteredAccX = new NumberRecord(filteredAccX);
  private filteredAccY = new NumberRecord(filteredAccY);
  private filteredAccZ = new NumberRecord(filteredAccZ);
  private accX = new NumberRecord(accX, (x) => { this.filteredAccX.value = this.lowPassFilterX.filter(x); });
  private accY = new NumberRecord(accY, (x) => { this.filteredAccY.value = this.lowPassFilterY.filter(x); });
  private accZ = new NumberRecord(accZ, (x) => { this.filteredAccZ.value = this.lowPassFilterZ.filter(x); });
  
  private magnitude = new NumberRecord(magnitude);

  public processPacket(packet: IPacket): void {
    if (!packet.accelerometers) {
      return;
    }

    const now = Date.now();
    const accelData: IAcceleroMeter = packet.accelerometers[packet.accelerometers.length - 1];

    // Applying low-pass filter
    this.accX.value = accelData.x.acc;
    this.accY.value = accelData.y.acc;
    this.accZ.value = accelData.z.acc;

    // Calculating acceleration after filtering
    this.magnitude.value = this.calculateMagnitude(
      this.filteredAccX.value,
      this.filteredAccY.value,
      this.filteredAccZ.value,
    );

    switch (this.state) {
      case StepState.WAITING_FOR_PEAK:
        if (this.magnitude.value > StepCounter.STEP_THRESHOLD) {
          if (now - this.lastStepTimestamp > StepCounter.MIN_TIME_BETWEEN_STEPS_MS) {
            this.stepCount++;
            this.lastStepTimestamp = now;
            console.log(`Step detected. Total steps: ${this.stepCount}`);
          }
          this.state = StepState.WAITING_FOR_TROUGH;
        }
        break;
      case StepState.WAITING_FOR_TROUGH:
        if (this.magnitude.value < StepCounter.STEP_THRESHOLD) {
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