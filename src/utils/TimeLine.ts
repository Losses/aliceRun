export interface ITimelineEvent<Type extends string, Detail> {
    time: number;
    type: Type,
    detail: Detail;
};

type DisposeFn = () => void;

type EventCallback<Type extends string, Detail> = (x: ITimelineEvent<Type, Detail>) => DisposeFn | void;

type TimelineEventCallbacks<T extends ITimelineEvent<string, any>[]> = {
    [Event in T[number] as Event['type']]: EventCallback<Event['type'], Event['detail']>;
}

export class TimelineManager<T extends ITimelineEvent<string, any>[]> {
    private events: T;
    private startTime: number | null = null;
    private isPaused: boolean = false;
    private eventIndex: number = 0;
    private pauseTime: number | null = null;
    private disposers = new Set<DisposeFn>();
    public readonly totalTime: number;
    public timeLeft: number;

    constructor(
        events: T,
        public callbacks: TimelineEventCallbacks<T>
    ) {
        this.events = events.sort((a, b) => a.time - b.time);

        this.totalTime = events.find((x) => x.type === 'end')?.time ?? Infinity;
        this.timeLeft = this.totalTime;
    }

    public reset() {
        this.startTime = null;
        this.isPaused = false;
        this.eventIndex = 0;
        this.pauseTime = null;

        this.disposers.forEach((x) => x());
        this.disposers.clear();
    }

    tick = (timestamp: number) => {
        if (this.isPaused) return;

        if (this.startTime === null) {
            this.startTime = timestamp;
            return;
        }

        while (
            this.eventIndex < this.events.length &&
            this.events[this.eventIndex].time + this.startTime <= timestamp
        ) {
            this.onEvent(this.events[this.eventIndex]);
            this.eventIndex++;
        }

        this.timeLeft = this.totalTime - (timestamp - this.startTime);
    }

    private onEvent<C extends T[number], D extends C['type']>(event: C): void {
        const disposeFn = (this.callbacks[event.type as D] as unknown as EventCallback<C['type'], C['detail']>)?.(event);

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