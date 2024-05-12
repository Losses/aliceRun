import { Clip, Mp3DeMuxAdapter } from "@web-media/phonograph";
import { globalAudioContext } from "../manager/AudioManager";

import { ROUTER_ID } from "../stores/router";
import { timeManager } from "./TimeManager";
import { FrameRateLevel } from "../utils/TimeMagic";
import { ITimelineEvent, TimelineManager } from "../utils/TimeLine"
import { THEME_ID } from "./ColorManager";
import { LOW_LIMIT } from "../stores/runStat";

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

const LowRpmLimitEvent = (time: number, rpm: number): ITimelineEvent<'lowRpm', number> => ({
    time,
    type: 'lowRpm',
    detail: rpm,
});

const DebugAlertEvent = (time: number, text: string): ITimelineEvent<'debugAlert', string> => ({
    time,
    type: 'debugAlert',
    detail: text,
});

const STORY_AUDIO_URL_BASE = 'https://resource.alice.is.not.ci/';

export const timeLine = new TimelineManager([
    ...new Array(37).fill(0).map((_, index) => 
        AudioEvent(Time(0, 10, index), `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`)
    ),
    LowRpmLimitEvent(Time(0, 10), 170),
    LowRpmLimitEvent(Time(0, 10, 1), 195),
    EndEvent(Time(0, 31, 41)),
    LowRpmLimitEvent(Time(0, 6, 19), 265),
    ThemeEvent(Time(0, 3, 19), 'dark'),
    LowRpmLimitEvent(Time(0, 10, 27), 180),
    ThemeEvent(Time(0, 15, 27), 'clear'),
    DebugAlertEvent(Time(0, 40, 37), 'Story Finished'),
], {
    audio: (x: ITimelineEvent<"audio", IPlayAudioStoryEvent>) => {
        const clip = new Clip({
            context: globalAudioContext,
            url: STORY_AUDIO_URL_BASE + x.detail.url,
            adapter: new Mp3DeMuxAdapter(),
        });
        
        
        performance.mark(`advancedAudio-${x}:load:start`);
        clip.buffer().then(async () => {
            performance.mark(`advancedAudio-${x}:play:start`);
            clip.play().then((x) => {
                performance.mark(`advancedAudio-${x}:play:end`);
                performance.measure(`advancedAudio-${x}:play`, `advancedAudio-${x}:play:start`, `advancedAudio-${x}:play:end`);
            });
        });
        performance.mark(`advancedAudio-${x}:load:end`);
        performance.measure(`advancedAudio-${x}:load`, `advancedAudio-${x}:load:start`, `advancedAudio-${x}:load:end`);
        
        return () => clip.dispose();
    },
    end: (x: ITimelineEvent<"end", null>) => {
    },
    theme: (x: ITimelineEvent<"theme", string>) => {
        THEME_ID.value = x.detail;
    },
    lowRpm: (x: ITimelineEvent<'lowRpm', number>) => {
        LOW_LIMIT.value = x.detail;
    },
    debugAlert: (x: ITimelineEvent<'debugAlert', string>) => {
        alert(x.detail);
    },
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