import Stats from 'stats.js';
import { createEventName, Event } from '@web-media/event-target';

import { accX, accY, accZ, magnitude, filteredAccX, filteredAccY, filteredAccZ } from "../effects/StatsEffect";
import { LowPassFilter } from "./LowPassFilter";
import { IAcceleroMeter, IPacket } from "./joyCon/nintendoSwitch/JoyCon";
import { eventTarget } from '../manager/EventManager';

enum StepState {
  WAITING_FOR_PEAK,
  WAITING_FOR_TROUGH
}

class NumberRecord {
  private maxValue = 0;
  private _value = 0;

  public readonly history: number[] = [];

  constructor(
    private panel: Stats.Panel,
    private _update?: (x: number) => void,
    private recordHistory = true,
  ) {
  }

  get value() { return this._value };
  set value(x: number) {
    this._update?.(x);
    this.maxValue = Math.max(this.maxValue, x);
    this._value = x;
    this.panel.update(x, this.maxValue);

    if (this.recordHistory) {
      this.history.push(x);
    }
  }
}

interface IStepEventDetail {
  magnitude: number;
  total: number;
}

export const STEP_EVENT = createEventName<IStepEventDetail>();

export class StepCounter {
  private static readonly STEP_THRESHOLD: number = 1.2;
  private static readonly MIN_TIME_BETWEEN_STEPS_MS: number = 300;
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
  private maxMagnitude = 0;

  constructor() {
    // @ts-ignore
    window.dumpRecord = this.dumpRecord;
  }

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

    this.maxMagnitude = Math.max(this.magnitude.value, this.maxMagnitude);

    switch (this.state) {
      case StepState.WAITING_FOR_PEAK:
        if (this.magnitude.value > StepCounter.STEP_THRESHOLD) {
          if (now - this.lastStepTimestamp > StepCounter.MIN_TIME_BETWEEN_STEPS_MS) {
            this.stepCount++;
            this.lastStepTimestamp = now;

            eventTarget.dispatchEvent(new Event(STEP_EVENT, {magnitude: this.maxMagnitude, total: this.stepCount}));
            this.maxMagnitude = 0;
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

  mockStep = () => {
    this.stepCount++;
    eventTarget.dispatchEvent(new Event(STEP_EVENT, {magnitude: 2, total: this.stepCount}));
  }

  private calculateMagnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public dumpRecord = () => {
    let result = 'fX, fY, fZ, X, Y, Z, Mag,';
    for (let i = 0; i < this.filteredAccX.history.length; i += 1) {
      result += this.filteredAccX.history[i] + ',';
      result += this.filteredAccY.history[i] + ',';
      result += this.filteredAccZ.history[i] + ',';
      result += this.accX.history[i] + ',';
      result += this.accY.history[i] + ',';
      result += this.accZ.history[i] + ',';
      result += this.magnitude.history[i] + ',';
      result += '\n';
    }
    const element = document.createElement("a");
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
    element.setAttribute('download', `acc-${Date.now()}.csv`);

    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
}