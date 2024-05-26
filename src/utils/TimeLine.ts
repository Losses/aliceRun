export interface ITimelineEvent<Type extends string, Detail> {
   time: number;
   type: Type;
   label: string;
   detail: Detail;
}

type DisposeFn = () => void;

type EventCallback<Type extends string, Detail> = (
   x: ITimelineEvent<Type, Detail>,
// biome-ignore lint/suspicious/noConfusingVoidType: This is safe
) => DisposeFn | void;

// biome-ignore lint/suspicious/noExplicitAny: This is safe
type TimelineEventCallbacks<T extends ITimelineEvent<string, any>[]> = {
   [Event in T[number] as Event['type']]: EventCallback<
      Event['type'],
      Event['detail']
   >;
};

// biome-ignore lint/suspicious/noExplicitAny: This is safe
export class TimelineManager<T extends ITimelineEvent<string, any>[]> {
   private events: T | null = null;
   private startTime: number | null = null;
   private isPaused = false;
   private eventIndex = 0;
   private pauseTime: number | null = null;
   private disposers = new Set<DisposeFn>();
   public totalTime = 0;
   public timeLeft = 0;

   public _storyId = 0;

   get storyId() {
      return this._storyId;
   }

   set storyId(x) {
      this._storyId = x;

      const events = this.eventSet[x] ?? this.eventSet[0];

      this.events = events.sort((a, b) => a.time - b.time);

      this.totalTime =
         events.find((x) => x.type === 'end')?.time ?? Number.POSITIVE_INFINITY;
      this.timeLeft = this.totalTime;

      this.reset();
   }

   constructor(
      public eventSet: T[],
      public callbacks: TimelineEventCallbacks<T>,
   ) {}

   public reset() {
      if (this.startTime === null) return;
      this.startTime = null;
      this.isPaused = false;
      this.eventIndex = 0;
      this.pauseTime = null;

      this.timeLeft = this.totalTime;

      this.disposers.forEach((x) => x());
      this.disposers.clear();
   }

   nextEvent = (skip = 0) => {
      if (!this.events) return;
      this.eventIndex += skip;
      this.onEvent(this.events[this.eventIndex]);
      this.eventIndex++;
   }

   tick = (timestamp: number) => {
      if (this.isPaused) return;
      if (!this.events) return;

      if (this.startTime === null) {
         this.startTime = timestamp;
         return;
      }

      while (
         this.eventIndex < this.events.length &&
         this.events[this.eventIndex].time + this.startTime <= timestamp
      ) {
         this.nextEvent();
      }

      this.timeLeft = this.totalTime - (timestamp - this.startTime);
   };

   private onEvent<C extends T[number], D extends C['type']>(event: C): void {
      const disposeFn = (
         this.callbacks[event.type as D] as unknown as EventCallback<
            C['type'],
            C['detail']
         >
      )?.(event);

      if (disposeFn) {
         this.disposers.add(disposeFn);
      }
   }

   public pause(): void {
      if (!this.isPaused) {
         this.isPaused = true;
         this.pauseTime = Date.now();
      }
   }

   public resume(): void {
      if (this.isPaused && this.pauseTime != null) {
         const pausedDuration = Date.now() - this.pauseTime;
         if (this.startTime !== null) {
            this.startTime += pausedDuration;
         }
         this.isPaused = false;
         this.pauseTime = null;
      }
   }
}
