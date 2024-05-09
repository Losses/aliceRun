import { Clip, Mp3DeMuxAdapter } from "@web-media/phonograph";
import { globalAudioContext } from "../manager/AudioManager";

import { ROUTER_ID } from "../stores/router";
import { timeManager } from "./TimeManager";
import { FrameRateLevel } from "../utils/TimeMagic";
import { IPlayAudioStoryEvent, ITimelineEventDetail, TimelineManager } from "../utils/TimeLine"

const Time = (ms = 0, s = 0, m = 0, h = 0) => {
    return ms + s * 1000 + m * 1000 * 60 + h * 1000 * 60 * 60;
}

const AudioEvent = (time: number, url: string): ITimelineEventDetail<'audio', IPlayAudioStoryEvent> => ({
    time,
    type: 'audio',
    detail: {
        url,
    }
});

const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

export const StoryManager = () => {
    const timeLine = new TimelineManager([
        ...new Array(37).fill(0).map((_, index) => 
            AudioEvent(Time(0, 3, index), `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`)
        ),
    ], {
        audio: async (x) => {
            const clip = new Clip({
                context: globalAudioContext,
                url: STORY_AUDIO_URL_BASE + x.detail.url,
                adapter: new Mp3DeMuxAdapter(),
            });

            await clip.buffer();
            clip.play();
        },
    });

    ROUTER_ID.subscribe((id) => {
        if (id.includes('/single/play/story')) {
            timeLine.reset();
            timeManager.addFn(timeLine.tick, FrameRateLevel.D0);
        } else {
            timeManager.removeFn(timeLine.tick);
        }
    });
}