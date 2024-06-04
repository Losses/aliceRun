import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP02 = [
    ...new Array(3)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index),
             `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    ...new Array(32)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index + 3),
             `S001-EP002-${(index + 4).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    ...new Array(5)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index + 35),
             `S001-EP001-${(index + 34).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    LowRpmLimitEvent(Time(0, 10), 170),
    LowRpmLimitEvent(Time(0, 10, 1), 195),
    LowRpmLimitEvent(Time(0, 14, 4), 265),
    ThemeEvent(Time(0, 14, 4), 'dawn'),
    LowRpmLimitEvent(Time(0, 0, 13), 180),
    ThemeEvent(Time(0, 0, 13), 'clear'),
    LowRpmLimitEvent(Time(0, 14, 16), 265),
    ThemeEvent(Time(0, 14, 16), 'dawn'),
    LowRpmLimitEvent(Time(0, 0, 23), 180),
    ThemeEvent(Time(0, 0, 23), 'clear'),
    EndEvent(Time(0, 31, 42)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];