import { Event, Target, createEventName } from '@web-media/event-target';

import { Sparkline } from './Sparkline';
import { P1_SENSITIVITY } from '../stores/settings';
import type { IPacket } from './joyCon/nintendoSwitch/JoyCon';

enum StepState {
   WAITING_FOR_PEAK = 0,
   WAITING_FOR_TROUGH = 1,
}

interface IStepEventDetail {
   magnitude: number;
   total: number;
   type: 'UP' | 'DN';
}

export const STEP_EVENT = createEventName<IStepEventDetail>();

export class StepCounter extends Target<[typeof STEP_EVENT]> {
   private static readonly STEP_THRESHOLD_LOW: number = -0.007;
   private static readonly STEP_THRESHOLD_HIGH: number = 0.005;
   private static readonly MIN_TIME_BETWEEN_STEPS_MS: number = 200;

   public stepCount = 0;
   private state: StepState = StepState.WAITING_FOR_PEAK;

   public readonly data = {
      accX: new Sparkline(),
      accY: new Sparkline(),
      accZ: new Sparkline(),
      gyoX: new Sparkline(),
      gyoY: new Sparkline(),
      gyoZ: new Sparkline(),
      oriX: new Sparkline(),
      oriY: new Sparkline(),
      oriZ: new Sparkline(),
      magnitude: new Sparkline(),
      guide: new Sparkline(),
      time: new Sparkline(),
   } as const;

   private maxMagnitude = 0;

   private lastPacket: IPacket | null = null;

   private _recording = false;

   private lastStepTimestamp = 0;

   get recording() {
      return this._recording;
   }

   set recording(x) {
      this._recording = x;
      Object.values(this.data).forEach((a) => {
         a.recording = x;
      });
   }

   private _monitoring = false;

   get monitoring() {
      return this._monitoring;
   }

   set monitoring(x) {
      this._monitoring = x;
      Object.values(this.data).forEach((a) => {
         a.monitoring = x;
      });
   }

   public processPacket(packet: IPacket): void {
      if (!packet.accelerometers) {
         return;
      }

      this.lastPacket = packet;
      this.tick();
   }

   reset() {
      this.stepCount = 0;
      this.maxMagnitude = 0;
      this.lastPacket = null;
      Object.values(this.data).forEach((a) => a.clear());
   }

   step = (type: 'UP' | 'DN') => {
      const now = Date.now();
      if (this.lastStepTimestamp) {
         this.stepCount++;

         this.dispatchEvent(
            new Event(STEP_EVENT, {
               magnitude: this.maxMagnitude,
               total: this.stepCount,
               type,
            }),
         );
         this.maxMagnitude = 0;
      }

      this.lastStepTimestamp = now;
   };

   tick = () => {
      const now = Date.now();
      const packet = this.lastPacket;
      if (!packet || !packet.accelerometers) return;

      const ori0 = packet.analogStickLeft ?? packet.analogStickRight;
      if (!ori0) return;

      const ori = packet.actualOrientation;
      if (!ori) return;

      const gyo = packet.actualGyroscope;
      if (!gyo) return;

      const acc = packet.actualAccelerometer;
      if (!acc) return;

      // Applying low-pass filter
      this.data.accX.value = acc.x - 1;
      this.data.accY.value = acc.y;
      this.data.accZ.value = acc.z;

      this.data.gyoX.value = gyo.rps.x;
      this.data.gyoY.value = gyo.rps.y;
      this.data.gyoZ.value = gyo.rps.z;

      this.data.oriX.value = ori.alpha;
      this.data.oriY.value = ori.beta;
      this.data.oriZ.value = ori.gamma;

      // Calculating acceleration after filtering
      this.data.magnitude.value = this.calculateMagnitude(
         this.data.gyoX.value,
         this.data.gyoY.value,
         -this.data.gyoZ.value,
      );

      this.maxMagnitude = Math.max(
         this.data.magnitude.value,
         this.maxMagnitude,
      );

      this.data.guide.value = Date.now() % 800 > 400 ? 1 : 0;
      this.data.time.value = Date.now();

      switch (this.state) {
         case StepState.WAITING_FOR_PEAK:
            if (
               this.data.gyoY.value >
               StepCounter.STEP_THRESHOLD_HIGH * P1_SENSITIVITY.value
            ) {
               if (
                  now - this.lastStepTimestamp >
                  StepCounter.MIN_TIME_BETWEEN_STEPS_MS
               ) {
                  this.step('UP');
                  this.maxMagnitude = 0;
                  this.state = StepState.WAITING_FOR_TROUGH;
               }
            }
            break;
         case StepState.WAITING_FOR_TROUGH:
            if (
               this.data.gyoY.value <
               StepCounter.STEP_THRESHOLD_LOW * P1_SENSITIVITY.value
            ) {
               this.step('DN');
               this.state = StepState.WAITING_FOR_PEAK;
            }
            break;
      }
   };

   updateSparklines = () => {
      if (this._monitoring) {
         Object.values(this.data).forEach((x) => x.tick());
      }
   };

   private _botMode = false;
   private _botHandler: (() => void) | null = null;

   get botMode() {
      return this._botMode;
   }

   set botMode(x) {
      if (x && this._botHandler) return;
      if (!x && !this._botHandler) return;
      this._botMode = x;

      if (x) {
         this._botHandler = setRandomInterval(this.mockStep, 200, 200);
      } else {
         if (!this._botHandler) throw new Error('Bot handler lost');
         this._botHandler();
         this._botHandler = null;
      }
   }

   mockStep = () => {
      this.stepCount++;
      this.dispatchEvent(
         new Event(STEP_EVENT, {
            magnitude: 2,
            total: this.stepCount,
            type: 'UP',
         }),
      );
   };

   private calculateMagnitude(x: number, y: number, z: number): number {
      return Math.sqrt(x * x + y * y + z * z);
   }

   public getStepCount(): number {
      return this.stepCount;
   }

   public dumpRecord = () => {
      let result =
         'aX, aY, aZ, oX, oY, oZ, gX, gY, gZ, Add, guide, time\n';
      for (let i = 0; i < this.data.accX.history.length; i += 1) {
         result += `${this.data.accX.history[i]},`;
         result += `${this.data.accY.history[i]},`;
         result += `${this.data.accZ.history[i]},`;
         result += `${this.data.oriX.history[i]},`;
         result += `${this.data.oriY.history[i]},`;
         result += `${this.data.oriZ.history[i]},`;
         result += `${this.data.gyoX.history[i]},`;
         result += `${this.data.gyoY.history[i]},`;
         result += `${this.data.gyoZ.history[i]},`;
         result += `${this.data.magnitude.history[i]},`;
         result += `${this.data.guide.history[i]},`;
         result += `${this.data.time.history[i]}`;
         result += '\n';
      }
      const element = document.createElement('a');
      element.setAttribute(
         'href',
         `data:text/plain;charset=utf-8,${encodeURIComponent(result)}`,
      );
      element.setAttribute('download', `acc-${Date.now()}.csv`);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
   };
}
