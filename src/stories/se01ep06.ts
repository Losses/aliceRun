import { AudioEvent, DebugAlertEvent, EndEvent, LowRpmLimitEvent, ThemeEvent, Time } from "./utils";

export const SE1EP06 = [
   ...new Array(3)
      .fill(0)
      .map((_, index) =>
         AudioEvent(
            Time(0, 10, index),
            `S001-EP001-${(index + 1).toString().padStart(3, '0')}.mp3`,
         ),
      ),
   ...new Array(38)
      .fill(0)
      .map((_, index) =>
         AudioEvent(
            Time(0, 10, index + 3),
            `S001-EP006-${(index + 4).toString().padStart(3, '0')}.mp3`,
         ),
      ),
   AudioEvent(
      Time(0, 10, 41),
      'S001-EP001-038.mp3',
   ),
   LowRpmLimitEvent(Time(0, 10), 170),
   LowRpmLimitEvent(Time(0, 10, 1), 195),
   LowRpmLimitEvent(Time(0, 14, 4), 200),
   LowRpmLimitEvent(Time(0, 14, 13), 260),
   ThemeEvent(Time(0, 14, 13), 'ending'),
   LowRpmLimitEvent(Time(0, 14, 21), 230),
   ThemeEvent(Time(0, 14, 25), 'dark'),
   ThemeEvent(Time(0, 14, 26), 'dawn'),
   ThemeEvent(Time(0, 14, 27), 'dust'),
   ThemeEvent(Time(0, 14, 28), 'fire'),
   ThemeEvent(Time(0, 14, 29), 'void'),
   ThemeEvent(Time(0, 14, 30), 'winter'),
   ThemeEvent(Time(0, 14, 31), 'rainy'),
   ThemeEvent(Time(0, 14, 32), 'desert'),
   ThemeEvent(Time(0, 14, 33), 'god'),
   LowRpmLimitEvent(Time(0, 14, 33), 170),
   EndEvent(Time(0, 30, 44)),
   ThemeEvent(Time(0, 30, 44), 'clear'),
   DebugAlertEvent(Time(0, 31, 45), 'Hmmmm'),
];