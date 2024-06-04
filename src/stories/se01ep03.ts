import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP03 = [
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
             `S001-EP003-${(index + 4).toString().padStart(3, '0')}.mp3`,
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
    LowRpmLimitEvent(Time(0, 14, 8), 265),
    ThemeEvent(Time(0, 14, 8), 'winter'),
    LowRpmLimitEvent(Time(0, 0, 13), 180),
    ThemeEvent(Time(0, 0, 13), 'clear'),
    LowRpmLimitEvent(Time(0, 14, 21), 265),
    ThemeEvent(Time(0, 14, 21), 'winter'),
    LowRpmLimitEvent(Time(0, 0, 26), 180),
    ThemeEvent(Time(0, 0, 26), 'clear'),
    LowRpmLimitEvent(Time(0, 14, 30), 265),
    ThemeEvent(Time(0, 14, 30), 'winter'),
    LowRpmLimitEvent(Time(0, 0, 37), 180),
    ThemeEvent(Time(0, 0, 37), 'clear'),
    EndEvent(Time(0, 31, 42)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];