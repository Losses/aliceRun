import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP05 = [
    ...new Array(3)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index),
             `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`,
          ),
       ),
    ...new Array(35)
       .fill(0)
       .map((_, index) =>
          AudioEvent(
             Time(0, 10, index + 3),
             `S001-EP005-${(index + 4).toString().padStart(3, '0')}.mp3`,
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
    LowRpmLimitEvent(Time(0, 14, 11), 265),
    ThemeEvent(Time(0, 14, 11), 'void'),
    LowRpmLimitEvent(Time(0, 14, 18), 195),
    ThemeEvent(Time(0, 14, 18), 'clear'),
    LowRpmLimitEvent(Time(0, 14, 33), 265),
    ThemeEvent(Time(0, 14, 33), 'void'),
    LowRpmLimitEvent(Time(0, 14, 39), 200),
    ThemeEvent(Time(0, 14, 39), 'clear'),
    EndEvent(Time(0, 31, 42)),
    DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];