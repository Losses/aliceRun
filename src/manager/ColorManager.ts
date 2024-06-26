import { Hct } from '@material/material-color-utilities';
import { useLerps } from '../utils/lerp';
import { store } from './DataManager';
import { forceSelect } from '../utils/forceSelect';

interface ITheme<T> {
   grassBase: T;
   grassTip: T;
   sky0: T;
   sky1: T;
}

const themeArgb: Record<string, ITheme<number>> = {
   dark: {
      grassTip: 0xffdd1818,
      grassBase: 0xff290404,
      sky0: 0xff23074d,
      sky1: 0xffcc5333,
   },
   dawn: {
      grassTip: 0xffffa352,
      grassBase: 0xff4c3736,
      sky0: 0xff43454b,
      sky1: 0xffc98774,
   },
   dust: {
      grassTip: 0xfffc6d43,
      grassBase: 0xff262428,
      sky0: 0xff524b4d,
      sky1: 0xffdfb6ad,
   },
   fire: {
      grassTip: 0xffdc4027,
      grassBase: 0xff402b27,
      sky0: 0xff2f2e36,
      sky1: 0xffab5829,
   },
   void: {
      grassTip: 0xff5d06a3,
      grassBase: 0xff140e22,
      sky0: 0xff263238,
      sky1: 0xff37474F,
   },
   ending: {
      grassTip: 0xff474b4d,
      grassBase: 0xff27252a,
      sky0: 0xff1e3139,
      sky1: 0xff518093,
   },
   clear: {
      grassBase: 0xff0c3302,
      grassTip: 0xff7f7f19,
      sky0: 0xff4ca1af,
      sky1: 0xffc4e0e5,
   },
   night: {
      grassTip: 0xff464a61,
      grassBase: 0xff1d243a,
      sky0: 0xff10182e,
      sky1: 0xff1c3a65,
   },
   storm: {
      grassTip: 0xff1d2e3d,
      grassBase: 0xff10161b,
      sky0: 0xff0d141d,
      sky1: 0xff121d2d,
   },
   winter: {
      grassTip: 0xffebdaa1,
      grassBase: 0xff684c25,
      sky0: 0xff295877,
      sky1: 0xffa3cbd0,
   },
   desert: {
      grassTip: 0xffe1b254,
      grassBase: 0xff7e473a,
      sky0: 0xff762902,
      sky1: 0xffc5b267,
   },
   rainy: {
      grassTip: 0xff154e61,
      grassBase: 0xff123147,
      sky0: 0xff1f3130,
      sky1: 0xff1c3d4b,
   },
   god: {
      grassTip: 0xffd4eff0,
      grassBase: 0xff819ea9,
      sky0: 0xffd4eff0,
      sky1: 0xfffbfdfc,
   },
};


const THEME_IDS = Object.keys(themeArgb).filter((x) => x !== 'clear');
const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random()*items.length)];


const themeHct: Record<string, ITheme<Hct>> = {};

Object.entries(themeArgb).forEach(([key, value]) => {
   themeHct[key] = {
      grassBase: Hct.fromInt(value.grassBase),
      grassTip: Hct.fromInt(value.grassTip),
      sky0: Hct.fromInt(value.sky0),
      sky1: Hct.fromInt(value.sky1),
   };
});

const ARGB_TO_RGB_MASK = 0x00ffffff;
const argbToTheme = (x: ITheme<number>): ITheme<number> => {
   return {
      grassBase: x.grassBase & ARGB_TO_RGB_MASK,
      grassTip: x.grassTip & ARGB_TO_RGB_MASK,
      sky0: x.sky0 & ARGB_TO_RGB_MASK,
      sky1: x.sky1 & ARGB_TO_RGB_MASK,
   };
};

export const THEME_ID = store.createStore('clear');
export const THEME_VALUE = store.createStore(argbToTheme(themeArgb.clear));
export const MULTIPLE_PLAYER_THEME_ID = store.createStore(pickRandom(THEME_IDS)); 
export const MULTIPLE_PLAYER_COLOR_PROGRESS = store.createStore(0);

// @ts-ignore
window.themeId = THEME_ID;

const interpolate = (from: number, to: number, progress: number) => {
   return from + (to - from) * progress;
}

const interpolateTheme = (to: string, progress: number) => {
   const fromTheme = themeHct.clear;
   if (!fromTheme) throw new Error('From theme not found');
   
   const toTheme = themeHct[to];
   if (!toTheme) throw new Error('From theme not found');

   return (Object.entries(toTheme) as [keyof ITheme<Hct>, Hct][]).flatMap(([key, x]) => [
      interpolate(fromTheme[key].hue, x.hue, progress),
      interpolate(fromTheme[key].chroma, x.chroma, progress),
      interpolate(fromTheme[key].tone, x.tone, progress),
   ]);
}

export const ColorManager = () => {
   const $theme = forceSelect<HTMLMetaElement>('meta[name="theme-color"]');

   THEME_VALUE.subscribe((x) => {
      $theme.setAttribute('content', `#${x.sky0.toString(16)}`);
   });

   const initialThemeNumber = Object.values(themeHct[THEME_ID.value]).flatMap(
      (x: Hct) => [x.hue, x.chroma, x.tone],
   );
   const initialTheme = {} as ITheme<Hct>;

   Object.entries(themeHct[THEME_ID.value]).forEach(
      ([key, hct]: [string, Hct]) => {
         initialTheme[key as keyof ITheme<number>] = Hct.from(
            hct.hue,
            hct.chroma,
            hct.tone,
         );
      },
   );

   const [lerpTheme] = useLerps(
      initialThemeNumber,
      (x) => {
         Object.entries(initialTheme).forEach(
            ([key, hct]: [string, Hct], index) => {
               hct.hue = x[index * 3];
               hct.chroma = x[index * 3 + 1];
               hct.tone = x[index * 3 + 2];
               THEME_VALUE.value[key as keyof ITheme<number>] =
                  hct.toInt() & ARGB_TO_RGB_MASK;
            },
         );

         // biome-ignore lint/correctness/noSelfAssign: We need to trigger event here
         THEME_VALUE.value = THEME_VALUE.value;
      },
      0.01,
      2,
   );

   THEME_ID.subscribe((id) => {
      const targetTheme = themeHct[id];
      if (!targetTheme) return;

      lerpTheme(
         Object.values(targetTheme).flatMap((x: Hct) => [
            x.hue,
            x.chroma,
            x.tone,
         ]),
      );
   });

   MULTIPLE_PLAYER_COLOR_PROGRESS.subscribe((x) => {
      lerpTheme(interpolateTheme(MULTIPLE_PLAYER_THEME_ID.value, x));
   });
};
