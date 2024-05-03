import Stats from 'stats.js';
import { createEventName, Event } from '@web-media/event-target';

import { filteredMagnitude } from "../effects/StatsEffect";
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

  public history: number[] = [];

  public recording = false;

  constructor(
    private panel?: Stats.Panel,
    private _update?: (x: number) => void,
  ) {
  }

  get value() { return this._value };
  set value(x: number) {
    this._update?.(x);
    this.maxValue = Math.max(this.maxValue, x);
    this._value = x;
    this.panel?.update(x, this.maxValue);

    if (this.recording) {
      this.history.push(x);
    }
  }

  clear() {
    this.maxValue = 0;
    this._value = 0;
    this.history = [];
  }
}

interface IStepEventDetail {
  magnitude: number;
  total: number;
}

export const STEP_EVENT = createEventName<IStepEventDetail>();

export class StepCounter {
  private static readonly STEP_THRESHOLD: number = 0.5;
  private static readonly MIN_TIME_BETWEEN_STEPS_MS: number = 300;
  private static readonly FILTER_ALPHA: number = 0.15;

  private lastStepTimestamp: number = 0;
  private stepCount: number = 0;
  private state: StepState = StepState.WAITING_FOR_PEAK;

  private accX = new NumberRecord();
  private accY = new NumberRecord();
  private accZ = new NumberRecord();

  private oriH = new NumberRecord();
  private oriV = new NumberRecord();
  
  private magnitude = new NumberRecord();
  private guide = new NumberRecord();
  private time = new NumberRecord();
  private magnitudeFilter: LowPassFilter = new LowPassFilter(StepCounter.FILTER_ALPHA);
  private filteredMagnitude = new NumberRecord(filteredMagnitude);
  private maxMagnitude = 0;

  private lastPacket: IPacket | null = null;

  private _recording = false;

  get recording() {
    return this._recording;
  }

  set recording(x) {
    this._recording = x;
    this.accX.recording = x;
    this.accY.recording = x;
    this.accZ.recording = x;
    this.oriH.recording = x;
    this.oriV.recording = x;
    this.magnitude.recording = x;
    this.filteredMagnitude.recording = x;
    this.guide.recording = x;
    this.time.recording = x;
  }

  constructor() {
    // @ts-ignore
    window.dumpRecord = this.dumpRecord;
  }

  public processPacket(packet: IPacket): void {
    if (!packet.accelerometers) {
      return;
    }

    this.lastPacket = packet;
    if (!this.recording) {
      this.tick();
    }
  }

  reset() {
    this.accX.clear();
    this.accY.clear();
    this.accZ.clear();
    this.oriH.clear();
    this.oriV.clear();

    this.magnitude.clear();
    this.filteredMagnitude.clear();
    this.guide.clear();
    this.time.clear();
    this.maxMagnitude = 0;
    this.lastPacket = null;
  }

  tick = () => {
    const now = Date.now();
    const packet = this.lastPacket;
    if (!packet || !packet.accelerometers) return;

    const ori = packet.analogStickLeft ?? packet.analogStickRight;

    if (!ori) return;

    const accData = packet.accelerometers[packet.accelerometers.length - 1];

    // Applying low-pass filter
    this.accX.value = accData.x.acc - 1;
    this.accY.value = accData.y.acc;
    this.accZ.value = accData.z.acc;

    this.oriH.value = -ori.horizontal;
    this.oriV.value = -ori.vertical;

    // Calculating acceleration after filtering
    this.magnitude.value = this.calculateMagnitude(
      this.accX.value,
      this.accY.value,
      this.accZ.value,
    );
    this.filteredMagnitude.value = this.magnitudeFilter.filter(this.magnitude.value);

    this.maxMagnitude = Math.max(this.magnitude.value, this.maxMagnitude);

    this.guide.value = Date.now() % 800 > 400 ? 1 : 0;
    this.time.value = Date.now();

    switch (this.state) {
      case StepState.WAITING_FOR_PEAK:
        if (this.oriH.value > StepCounter.STEP_THRESHOLD) {
          if (now - this.lastStepTimestamp > StepCounter.MIN_TIME_BETWEEN_STEPS_MS) {
            this.stepCount++;
            this.lastStepTimestamp = now;

            eventTarget.dispatchEvent(new Event(STEP_EVENT, {magnitude: this.maxMagnitude, total: this.stepCount}));
          }
          this.state = StepState.WAITING_FOR_TROUGH;
        }
        break;
      case StepState.WAITING_FOR_TROUGH:
        if (this.oriH.value  < Math.min(this.maxMagnitude, StepCounter.STEP_THRESHOLD)) {
          this.stepCount++;
          eventTarget.dispatchEvent(new Event(STEP_EVENT, {magnitude: this.maxMagnitude, total: this.stepCount}));
          this.state = StepState.WAITING_FOR_PEAK;
          this.maxMagnitude = 0;
        }
        break;
    }
  }

  mockStep = () => {
    this.stepCount++;
    eventTarget.dispatchEvent(new Event(STEP_EVENT, {magnitude: 2, total: this.stepCount}));
  }

  private calculateMagnitude(x: number, y: number, z: number): number {
    return -y + z;
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  public dumpRecord = () => {
    let result = 'X, Y, Z, H, V, Add, fAdd, guide, time\n';
    for (let i = 0; i < this.accX.history.length; i += 1) {
      result += this.accX.history[i] + ',';
      result += this.accY.history[i] + ',';
      result += this.accZ.history[i] + ',';
      result += this.oriH.history[i] + ',';
      result += this.oriV.history[i] + ',';
      result += this.magnitude.history[i] + ',';
      result += this.filteredMagnitude.history[i] + ',';
      result += this.guide.history[i] + ',';
      result += this.time.history[i] + '';
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