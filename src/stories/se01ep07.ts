import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP07 = [
    ...new Array(54)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index),
             `S001-EP007-${(index + 1).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    LowRpmLimitEvent(Time(0, 10), 170),
    LowRpmLimitEvent(Time(0, 14, 2), 200),
    ThemeEvent(Time(0, 14, 2), 'night'),
    LowRpmLimitEvent(Time(0, 14, 22), 275),
    ThemeEvent(Time(0, 14, 22), 'storm'),
    LowRpmLimitEvent(Time(0, 14, 24), 260),
    ThemeEvent(Time(0, 14, 24), 'void'),
    LowRpmLimitEvent(Time(0, 14, 26), 230),
    ThemeEvent(Time(0, 14, 26), 'clear'),
    LowRpmLimitEvent(Time(0, 14, 36), 230),
    ThemeEvent(Time(0, 14, 36), 'rainy'),
    LowRpmLimitEvent(Time(0, 14, 40), 250),
    ThemeEvent(Time(0, 14, 40), 'dark'),
    LowRpmLimitEvent(Time(0, 14, 43), 270),
    ThemeEvent(Time(0, 14, 43), 'fire'),
    LowRpmLimitEvent(Time(0, 14, 52), 200),
    ThemeEvent(Time(0, 14, 52), 'clear'),
    EndEvent(Time(0, 31, 56)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];