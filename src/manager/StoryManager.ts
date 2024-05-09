import { ROUTER_ID } from "../stores/router";
import { IPlayAudioStoryEvent, ITimelineEventDetail, TimelineManager } from "../utils/TimeLine"
import { FrameRateLevel } from "../utils/TimeMagic";
import { timeManager } from "./TimeManager";

const Time = (ms = 0, s = 0, m = 0, h = 0) => {
    return ms + s * 1000 + m * 1000 * 60 + h * 1000 * 60 * 60;
}

const AudioEvent = (time: number, url: string): ITimelineEventDetail<IPlayAudioStoryEvent> => ({
    time,
    detail: {
        type: 'audio',
        url,
    }
});

export const StoryManager = () => {
    const timeLine = new TimelineManager([
        ...new Array(37).fill(0).map((_, index) => 
            AudioEvent(Time(index, 30), `S001-EP001-${index.toString().padStart(3, '0')}.mp3`)
        ),
    ]);

    ROUTER_ID.subscribe((id) => {
        if (id === '/single') {
            timeLine.reset();
            timeManager.addFn(timeLine.tick, FrameRateLevel.D0);
        } else {
            timeManager.removeFn(timeLine.tick);
        }
    });
}