export interface EventDetail<T = string> {
    time: number;
    detail: T;
};

export class TimelineManager {
    private events: EventDetail[];
    private startTime: number = Date.now();
    private isPaused: boolean = false;
    private eventIndex: number = 0;
    private pauseTime: number | null = null;

    constructor(events: EventDetail[]) {
        this.events = events.sort((a, b) => a.time - b.time);
    }

    public reset() {
        this.startTime = Date.now();
        this.isPaused = false;
        this.eventIndex = 0;
        this.pauseTime = null;
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

    private onEvent(event: EventDetail): void {
        console.log(`Event at ${event.time}: ${event.detail}`);
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