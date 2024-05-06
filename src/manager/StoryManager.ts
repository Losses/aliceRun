import { ROUTER_ID } from "../stores/router";
import { TimelineManager } from "../utils/TimeLine"
import { FrameRateLevel } from "../utils/TimeMagic";
import { timeManager } from "./TimeManager";

export const StoryManager = () => {
    const timeLine = new TimelineManager([
        {
            time: 1000,
            detail: '1000',
        },
        {
            time: 3000,
            detail: '3000',
        },
        {
            time: 4000,
            detail: '4000',
        },
        {
            time: 4500,
            detail: '4500',
        },
        {
            time: 6000,
            detail: '6000',
        },
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