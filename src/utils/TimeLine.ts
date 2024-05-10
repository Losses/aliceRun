export interface IPlayAudioStoryEvent {
    url: string,
}

export interface ITimelineEventDetail<Type extends string, Detail> {
    time: number;
    type: Type,
    detail: Detail;
};

type DisposeFn = () => void;

type EventCallback<Type extends string, Detail> = (x: ITimelineEventDetail<Type, Detail>) => DisposeFn | void;

export class TimelineManager<Type extends string, Detail, T extends ITimelineEventDetail<Type, Detail>> {
    private events: ITimelineEventDetail<Type, Detail>[];
    private startTime: number = Date.now();
    private isPaused: boolean = false;
    private eventIndex: number = 0;
    private pauseTime: number | null = null;
    private disposers = new Set<DisposeFn>();

    constructor(events: ITimelineEventDetail<Type, Detail>[], public callbacks: Record<Type, EventCallback<Type, Detail>>) {
        this.events = events.sort((a, b) => a.time - b.time);
    }

    public reset() {
        this.startTime = Date.now();
        this.isPaused = false;
        this.eventIndex = 0;
        this.pauseTime = null;

        this.disposers.forEach((x) => x());
        this.disposers.clear();
    }

    tick = () => {
        if (this.isPaused) return;

        const now = Date.now();
        while (
            this.eventIndex < this.events.length &&
            this.events[this.eventIndex].time + this.startTime <= now
        ) {
            this.onEvent(this.events[this.eventIndex]);
            this.eventIndex++;
        }
    }

    private onEvent(event: ITimelineEventDetail<Type, Detail>): void {
        const disposeFn = this.callbacks[event.type]?.(event);

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
            this.startTime += pausedDuration;
            this.isPaused = false;
            this.pauseTime = null;
        }
    }
}