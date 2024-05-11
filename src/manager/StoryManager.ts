import { Clip, Mp3DeMuxAdapter } from "@web-media/phonograph";
import { globalAudioContext } from "../manager/AudioManager";

import { ROUTER_ID } from "../stores/router";
import { timeManager } from "./TimeManager";
import { FrameRateLevel } from "../utils/TimeMagic";
import { ITimelineEvent, TimelineManager } from "../utils/TimeLine"
import { THEME_ID } from "./ColorManager";

const Time = (ms = 0, s = 0, m = 0, h = 0) => {
    return ms + s * 1000 + m * 1000 * 60 + h * 1000 * 60 * 60;
}

export interface IPlayAudioStoryEvent {
    url: string,
}

const AudioEvent = (time: number, url: string): ITimelineEvent<'audio', IPlayAudioStoryEvent> => ({
    time,
    type: 'audio',
    detail: {
        url,
    }
});

const EndEvent = (time: number): ITimelineEvent<'end', null> => ({
    time,
    type: 'end',
    detail: null,
});

const ThemeEvent = (time: number, theme: string): ITimelineEvent<'theme', string> => ({
    time,
    type: 'theme',
    detail: theme,
});

const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

export const timeLine = new TimelineManager([
    ...new Array(37).fill(0).map((_, index) => 
        AudioEvent(Time(0, 3, index), `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`)
    ),
    EndEvent(Time(0, 31, 41)),
    ThemeEvent(Time(0, 3, 19), 'dark'),
    ThemeEvent(Time(0, 15, 27), 'clear'),
], {
    audio: (x: ITimelineEvent<"audio", IPlayAudioStoryEvent>) => {
        const clip = new Clip({
            context: globalAudioContext,
            url: STORY_AUDIO_URL_BASE + x.detail.url,
            adapter: new Mp3DeMuxAdapter(),
        });

        clip.buffer().then( async () => {
            clip.play();
        });
        
        return () => clip.dispose();
    },
    end: (x: ITimelineEvent<"end", null>) => {
    },
    theme: (x: ITimelineEvent<"theme", string>) => {
        THEME_ID.value = x.detail;
    }
});

export const StoryManager = () => {
    ROUTER_ID.subscribe((id) => {
        timeLine.reset();
        if (id.includes('/single/play/story')) {
            timeManager.addFn(timeLine.tick, FrameRateLevel.D0);
        } else {
            timeManager.removeFn(timeLine.tick);
        }
    });
}