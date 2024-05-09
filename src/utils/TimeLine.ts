import { Clip, Mp3DeMuxAdapter } from "@web-media/phonograph";
import { globalAudioContext } from "../manager/AudioManager";

export interface IPlayAudioStoryEvent {
    type: 'audio',
    url: string,
}

export interface ITimelineEventDetail<T> {
    time: number;
    detail: T;
};


const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

export class TimelineManager<T extends IPlayAudioStoryEvent> {
    private events: ITimelineEventDetail<T>[];
    private startTime: number = Date.now();
    private isPaused: boolean = false;
    private eventIndex: number = 0;
    private pauseTime: number | null = null;

    private audioMap = new Map<string, Clip<unknown, unknown>>();

    constructor(events: ITimelineEventDetail<T>[]) {
        this.events = events.sort((a, b) => a.time - b.time);
        this.events.map((x) => {
            if (x.detail.type === 'audio') {
                this.audioMap.set(
                    x.detail.url,
                    new Clip({
                        context: globalAudioContext,
                        url: STORY_AUDIO_URL_BASE + x.detail.url,
                        adapter: new Mp3DeMuxAdapter(),
                    })
                );
            }
        })
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

    private onEvent(event: ITimelineEventDetail<T>): void {
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