import { timeManager } from './TimeManager';

import type { Effects } from '../initializeThreeCanvas';
import { P1_JOYCON } from '../stores/connection';
import { HP } from '../stores/hp';
import { ROUTER_ID, isMultiple, isSingle, isStory } from '../stores/router';
import { P1_SPM } from '../stores/runStat';
import { useLerp } from '../utils/lerp';
import { SMOOTHED_HIGH_LIMIT, SMOOTHED_LOW_LIMIT } from './RunStatManager';
import { forceSelect } from '../utils/forceSelect';

export const HpManager = (effects: Effects) => {
   let lastCalculateTime = 0;
   let trueHp = 100;

   const [updateHp] = useLerp(
      () => HP.value,
      (x) => {
         HP.value = x;
      },
   );

   const $hpBar = forceSelect<HTMLDivElement>('.hp-bar');
   const $hpVal = forceSelect<HTMLDivElement>('.hp-bar-val');

   HP.subscribe((x) => {
      if (x === trueHp || trueHp > HP.value) {
         $hpVal.setAttribute(
            'style',
            `width: ${HP.value}%; background: linear-gradient(90deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.7))`,
         );
      } else {
         $hpVal.setAttribute(
            'style',
            `width: ${HP.value}%; background: linear-gradient(90deg, rgba(255, 0, 0, 0.0), rgba(255, 0, 0, 0.8))`,
         );
      }
   });

   // This calculates visual effects and Joy-Con rumbles
   const tick = (time: number) => {
      if (!lastCalculateTime) {
         lastCalculateTime = time;
         return;
      }

      const effectProgress = Math.min(1, HP.value / 75);
      const effectFactor = 1 - effectProgress;
      const enableEffect = effectFactor > 0;

      effects.filmPass.enabled = enableEffect;
      effects.sepiaPass.enabled = enableEffect;
      effects.vignettePass.enabled = enableEffect;

      effects.sepiaPass.uniforms.amount.value = Math.min(
         1,
         1 * effectFactor * 2,
      );
      (
         effects.filmPass.uniforms as { nIntensity: { value: number } }
      ).nIntensity.value = 0.8 * effectFactor;
      effects.vignettePass.uniforms.offset.value = 3 * effectFactor;
      effects.vignettePass.uniforms.darkness.value = 4 * effectFactor;

      const bleeding =
         P1_SPM.value < SMOOTHED_LOW_LIMIT.value ||
         P1_SPM.value > SMOOTHED_HIGH_LIMIT.value;
      effects.glitchPass.enabled = bleeding;

      if (time - lastCalculateTime > 400) {
         if (bleeding) {
            trueHp = Math.max(0, trueHp - 0.5);
            P1_JOYCON.value?.rumble(600, 600, 0.5);
         } else {
            trueHp = Math.min(100, trueHp + 0.1);
         }

         updateHp(trueHp);
         lastCalculateTime = time;
      }
   };

   ROUTER_ID.subscribe(() => {
      if (!isSingle()) {
         trueHp = 100;
         HP.reset();
         effects.filmPass.enabled = false;
         effects.glitchPass.enabled = false;
         effects.sepiaPass.enabled = false;
         effects.vignettePass.enabled = false;
      }

      if (isStory() || isMultiple()) {
         timeManager.addFn(tick);
         $hpBar.classList.remove('hidden');
      } else {
         timeManager.removeFn(tick);
         $hpBar.classList.add('hidden');
      }
   }, true);
};
