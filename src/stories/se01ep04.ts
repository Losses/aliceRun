import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP04 = [
    ...new Array(3)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index),
             `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    ...new Array(34)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index + 3),
             `S001-EP004-${(index + 4).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    ...new Array(5)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index + 37),
             `S001-EP001-${(index + 36).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    LowRpmLimitEvent(Time(0, 10), 170),
    LowRpmLimitEvent(Time(0, 10, 1), 195),
    LowRpmLimitEvent(Time(0, 14, 4), 200),
    ThemeEvent(Time(0, 14, 4), 'rain'),
    LowRpmLimitEvent(Time(0, 14, 12), 270),
    ThemeEvent(Time(0, 14, 12), 'fire'),
    LowRpmLimitEvent(Time(0, 14, 18), 200),
    ThemeEvent(Time(0, 14, 18), 'rain'),
    LowRpmLimitEvent(Time(0, 14, 21), 230),
    LowRpmLimitEvent(Time(0, 14, 31), 240),
    LowRpmLimitEvent(Time(0, 14, 38), 200),
    ThemeEvent(Time(0, 14, 38), 'clear'),
    EndEvent(Time(0, 31, 42)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];