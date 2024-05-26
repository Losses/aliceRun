import { type ITimelineEvent } from "../utils/TimeLine";

export const Time = (ms = 0, s = 0, m = 0, h = 0) => {
   return ms + s * 1000 + m * 1000 * 60 + h * 1000 * 60 * 60;
};

export interface IPlayAudioStoryEvent {
   url: string;
}

export const AudioEvent = (
   time: number,
   url: string
): ITimelineEvent<"audio", IPlayAudioStoryEvent> => ({
   time,
   type: "audio",
   label: url,
   detail: {
      url,
   },
});

export const EndEvent = (time: number): ITimelineEvent<"end", null> => ({
   time,
   type: "end",
   label: "end",
   detail: null,
});

export const ThemeEvent = (
   time: number,
   theme: string
): ITimelineEvent<"theme", string> => ({
   time,
   type: "theme",
   label: `theme: ${theme}`,
   detail: theme,
});

export const LowRpmLimitEvent = (
   time: number,
   rpm: number
): ITimelineEvent<"lowRpm", number> => ({
   time,
   type: "lowRpm",
   label: `low-rpm: ${rpm}`,
   detail: rpm,
});

export const DebugAlertEvent = (
   time: number,
   text: string
): ITimelineEvent<"debugAlert", string> => ({
   time,
   label: `alert: ${text}`,
   type: "debugAlert",
   detail: text,
});
