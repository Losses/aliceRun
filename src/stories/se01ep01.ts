import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP01 = [
    ...new Array(38)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index),
             `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    LowRpmLimitEvent(Time(0, 10), 170),
    LowRpmLimitEvent(Time(0, 10, 1), 198),
    ThemeEvent(Time(0, 3, 16), 'dark'),
    LowRpmLimitEvent(Time(0, 6, 16), 262),
    LowRpmLimitEvent(Time(0, 0, 24), 198),
    ThemeEvent(Time(0, 0, 24), 'clear'),
    EndEvent(Time(0, 31, 41)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];